# FocusTrap 컴포넌트

> 핵심 포커스 관리만 남긴 단순화 버전

---

## 무슨 기능을 하는가?

수정된 FocusTrap은 **현대 브라우저에서 기본적인 포커스 가두기만 수행**하는 단순한 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **포커스 가두기** - Tab으로 순환, 컨테이너 밖으로 못 나감
2. **초기 포커스** - 컨테이너 열릴 때 자동으로 내부에 포커스
3. **포커스 복원** - 컨테이너 닫힐 때 원래 위치로 복귀

---

## 핵심 학습 포인트

### 1. Sentinel 노드를 이용한 경계 감지

```javascript
<React.Fragment>
  <div tabIndex={open ? 0 : -1} ref={sentinelStart} />  {/* 경비원 1 */}
  {React.cloneElement(children, { ref: rootRef, onFocus })}
  <div tabIndex={open ? 0 : -1} ref={sentinelEnd} />    {/* 경비원 2 */}
</React.Fragment>
```

**학습 가치**:
- 포커스 트래핑의 핵심 원리: 보이지 않는 "경비원" 노드로 경계 감지
- `tabIndex=0`: Tab 키로 도달 가능하게 만듦
- 사용자가 Tab으로 경계를 넘으려 하면 sentinel에 포커스 → 감지 → 되돌림

### 2. 이벤트 조합을 통한 키 정보 전달

```javascript
document.addEventListener('focusin', contain);
document.addEventListener('keydown', loopFocus, true);
```

**학습 가치**:
- `focusin`은 어떤 키를 눌렀는지 정보가 없음
- `keydown`에서 미리 저장 → `focusin`에서 꺼내 씀
- 이벤트 간 협력 패턴

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/modal/FocusTrap/FocusTrap.tsx (202줄, 원본 428줄)

[sentinelStart]  ← tabIndex=0 (경계 감지용)
[rootRef]        ← 모달 컨텐츠 (children)
  └─ Button 1
  └─ Input
  └─ Button 2
[sentinelEnd]    ← tabIndex=0 (경계 감지용)
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `sentinelStart` | 상단 경계 감지 |
| `sentinelEnd` | 하단 경계 감지 |
| `rootRef` | 모달 컨테이너 |
| `lastKeydown` | 마지막 키 이벤트 저장 (Tab/Shift+Tab 판별용) |
| `nodeToRestore` | 모달 열기 전 포커스 위치 저장 |
| `ignoreNextEnforceFocus` | 다음 contain() 한 번 무시 플래그 |

### 3. 함수 역할

#### loopFocus()
- **역할**: `contain()`에게 "Tab이냐 Shift+Tab이냐" 정보 전달
- **호출 시점**: `keydown` 이벤트 발생 시 (캡처 페이즈)
- **핵심 로직**:
```javascript
const loopFocus = (nativeEvent: KeyboardEvent) => {
  lastKeydown.current = nativeEvent;  // 핵심: 키 정보 저장
};
```

> `focusin` 이벤트는 어떤 키를 눌렀는지 정보가 없음. 그래서 `keydown`에서 미리 저장.

#### contain()
- **역할**: 포커스가 모달 밖으로 나가면 다시 안으로 되돌림
- **호출 시점**: `focusin` 이벤트 발생 시
- **핵심 로직**: 아래 동작 흐름 참고

### 4. 동작 흐름

#### contain() 플로우차트

```
focusin 이벤트 발생
        ↓
┌─────────────────────────────────┐
│ 브라우저 비활성화?               │──→ YES → return
│ ignoreNextEnforceFocus?         │
└─────────────────────────────────┘
        ↓ NO
┌─────────────────────────────────┐
│ 포커스가 모달 안에 있음?         │──→ YES → return (정상)
└─────────────────────────────────┘
        ↓ NO
┌─────────────────────────────────┐
│ 포커스가 sentinel에 있음?        │──→ NO → 아무것도 안 함
└─────────────────────────────────┘
        ↓ YES
┌─────────────────────────────────┐
│ Shift+Tab?                      │
│   YES → 마지막 요소로            │
│   NO  → 첫 번째 요소로           │
└─────────────────────────────────┘
```

#### Tab 순환 시나리오

**시나리오 1: Tab으로 끝까지**
```
Button 1 → Input → Button 2 → sentinelEnd
                                   ↓
                           focusin 발생
                                   ↓
                           contain() 실행
                                   ↓
                           Button 1로 이동 🔄
```

**시나리오 2: Shift+Tab으로 처음까지**
```
Button 2 → Input → Button 1 → sentinelStart
                                   ↓
                           focusin 발생
                                   ↓
                           contain() 실행
                                   ↓
                           Button 2로 이동 🔄
```

### 5. 핵심 패턴/플래그

- `ignoreNextEnforceFocus`: "일회용 패스권" - 다음 한 번만 포커스 강제를 무시

**왜 필요한가?**

모달 닫을 때 포커스 복원 상황:
```javascript
// cleanup
return () => {
  ignoreNextEnforceFocus.current = true;  // 플래그 ON
  nodeToRestore.current.focus();  // 모달 밖으로 포커스 이동
};
```

플래그 없으면:
```
모달 밖 버튼으로 focus() → focusin 발생 → contain()이 다시 모달 안으로 끌고 옴 ❌
```

플래그 있으면:
```
모달 밖 버튼으로 focus() → focusin 발생 → contain()이 무시하고 return ✅
```

**왜 리셋하는가?**

한 번 쓰고 `false`로 리셋해야 다음부터 정상 동작. 안 하면 포커스 트래핑이 영원히 무력화됨.

### 6. 초기 포커스 로직

```javascript
if (!rootRef.current.contains(activeElement)) {
  if (!rootRef.current.hasAttribute('tabIndex')) {
    rootRef.current.setAttribute('tabIndex', '-1');
  }
  rootRef.current.focus();
}
```

**tabIndex="-1"의 의미:**

| tabIndex | Tab 키로 도달 | JS로 .focus() |
|----------|---------------|---------------|
| 없음     | ❌            | ❌            |
| `-1`     | ❌            | ✅            |
| `0`      | ✅            | ✅            |

`<dialog>` 같은 요소는 기본적으로 포커스 불가 → `tabIndex="-1"` 추가해서 프로그래밍적 포커스 가능하게 함

> **참고**: `<dialog>` + `showModal()` 조합은 브라우저가 자동으로 내부 첫 요소에 포커스함. 이 경우 초기 포커스 로직은 제거 가능.

**원본과의 차이**:
- ❌ `disableAutoFocus` 제거 → 항상 자동 포커스
- ❌ `disableRestoreFocus` 제거 → 항상 복원
- ❌ IE11 호환성 체크 제거

### 7. Props (1개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | FocusTrap 활성화 여부 |
| `children` | element | **required** | 포커스를 가둘 컨테이너 |

---

## 커밋 히스토리로 보는 단순화 과정

FocusTrap은 **16개의 커밋**을 통해 단순화되었습니다.

### 제거 순서

1. `93adcae4` - **getTabIndex() 삭제** (36줄 삭제)
   - 브라우저 호환성 로직 제거
   - contentEditable, AUDIO, VIDEO 특수 처리 제거

2. `3718da45` - **interval 로직 삭제** (20줄 삭제)
   - Edge, Safari, Firefox 버그 우회 제거
   - BODY 포커스 체크 제거

3. `43120a92` - **isNonTabbableRadio() 삭제** (24줄 삭제)
   - 라디오 버튼 포커스 로빙 제거

4. `02116cc1` - **disableAutoFocus, activated 삭제** (47줄 삭제)
   - 항상 자동 포커스로 고정

5. `625a100d` - **ownerDocument(), getActiveElement() 삭제** (20줄 삭제)
   - 직접 `document` 사용

6. `9ebf7283` - **포커스 저장/복구 단순화** (38줄 변경)
   - IE11 호환성 체크 제거

7. `46a2587d` - **reactFocusEventTarget 삭제** (12줄 삭제)
   - React 이벤트 트리 추적 제거

8. `3fde0e7b` - **elementAcceptingRef 삭제** (5줄 삭제)
   - PropTypes 검증 제거

9. `6076bb7b` - **disableEnforceFocus, disableRestoreFocus, isEnabled 삭제** (52줄 삭제)
   - 과제 범위 벗어난 3개 props 제거

10. `07574e14` - **handleFocusSentinel() 삭제** (8줄 삭제)
    - Gemini 피셜 "방어적 로직" 제거

11. `99c56f74` - **포커스 저장 로직 추가** (3줄 변경)
    - 삭제된 함수 보완

12. `e5f7ccb2` - **포커스 요소 가져오기 단순화** (51줄 삭제)
    - tabIndex 정렬 알고리즘 제거
    - DOM 순서대로 단순하게 변경

13. `df22eeb3` - **useForkRef(), getReactElementRef() 삭제** (18줄 변경)
    - Ref 병합 로직 제거

14. `5da72155` - **자식 ref 전달 로직 제거** (15줄 변경)
    - handleRef 단순화

15. `5ed274c9` - **rootRef 직접 전달** (11줄 삭제)
    - Ref 처리 최종 단순화

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 428줄 | 202줄 (53% 감소) |
| **Props 개수** | 6개 | 1개 (open만) |
| **getTabbable** | 복잡한 정렬 (60줄) | DOM 순서 (3줄) |
| **interval 체크** | ✅ (50ms) | ❌ |
| **라디오 처리** | ✅ 로빙 | ❌ |
| **tabIndex 정렬** | ✅ | ❌ |
| **브라우저 버그 우회** | ✅ | ❌ |
| **IE11 호환** | ✅ | ❌ |
| **Ref 병합** | ✅ useForkRef | ❌ 직접 전달 |

---

## 학습 후 다음 단계

FocusTrap을 이해했다면:

1. **Modal** - FocusTrap을 사용하는 상위 컴포넌트
2. **Backdrop** - Modal과 함께 사용되는 오버레이
3. **Dialog** - Modal을 확장한 대화상자 컴포넌트

**예시: 기본 사용**
```javascript
<FocusTrap open={isOpen}>
  <div>
    <button>확인</button>
    <button>취소</button>
  </div>
</FocusTrap>
```

**예시: Modal과 함께**
```javascript
<Modal open={isOpen}>
  {/* Modal 내부에서 FocusTrap이 자동으로 적용됨 */}
  <div>모달 컨텐츠</div>
</Modal>
```
