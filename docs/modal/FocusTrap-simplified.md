# FocusTrap 컴포넌트

> 핵심 포커스 관리만 남긴 단순화 버전

---

## 무슨 기능을 하는가?

수정된 FocusTrap은 **현대 브라우저에서 기본적인 포커스 가두기만 수행**하는 단순한 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **포커스 가두기** - Tab으로 순환, 컨테이너 밖으로 못 나감
2. **초기 포커스** - 컨테이너 열릴 때 자동으로 내부에 포커스
3. **포커스 복원** - 컨테이너 닫힐 때 원래 위치로 복귀
4. **Sentinel 노드** - 경계 감지

---

## 내부 구조

### 1. 렌더링 구조 (동일)

```javascript
// 위치: packages/mui-material/src/Unstable_TrapFocus/FocusTrap.tsx (202줄, 원본 428줄)

<React.Fragment>
  <div
    tabIndex={open ? 0 : -1}
    ref={sentinelStart}
    data-testid="sentinelStart"
  />

  {React.cloneElement(children, { ref: rootRef, onFocus })}

  <div
    tabIndex={open ? 0 : -1}
    ref={sentinelEnd}
    data-testid="sentinelEnd"
  />
</React.Fragment>
```

### 2. Props (1개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | FocusTrap 활성화 여부 |
| `children` | element | **required** | 포커스를 가둘 컨테이너 |

### 3. 단순화된 getTabbable (18-21줄)

**원본**: 복잡한 정렬 알고리즘 (60줄)
```javascript
function defaultGetTabbable(root: HTMLElement): HTMLElement[] {
  const regularTabNodes: HTMLElement[] = [];
  const orderedTabNodes: OrderedTabNode[] = [];
  // ... 복잡한 tabIndex 정렬 로직
  return orderedTabNodes.sort(...).map(...).concat(regularTabNodes);
}
```

**수정본**: DOM 순서 그대로 (3줄)
```javascript
function defaultGetTabbable(root: HTMLElement): HTMLElement[] {
  // 🔥 단순히 DOM 순서대로 가져옴
  return Array.from(root.querySelectorAll(candidatesSelector)) as HTMLElement[];
}
```

**철학 변화**:
- 원본: "레거시 웹사이트도 지원 (tabIndex 기반 순서)"
- 수정본: "현대 웹 접근성 원칙 (DOM 순서 = Tab 순서)"

### 4. 초기 포커스 및 복원 (39-74줄)

```javascript
React.useEffect(() => {
  // 1. 방어 코드
  if (!open || !rootRef.current) {
    return;
  }

  // 2. 초기 포커스 저장
  const activeElement = document.activeElement;
  nodeToRestore.current = activeElement;

  // 3. 모달 안으로 포커스 이동
  if (!rootRef.current.contains(activeElement)) {
    if (!rootRef.current.hasAttribute('tabIndex')) {
      rootRef.current.setAttribute('tabIndex', '-1');
    }
    rootRef.current.focus();
  }

  // 4. Cleanup: 포커스 복원
  return () => {
    if (nodeToRestore.current && (nodeToRestore.current as HTMLElement).focus) {
      ignoreNextEnforceFocus.current = true;
      (nodeToRestore.current as HTMLElement).focus();
      nodeToRestore.current = null;
    }
  };
}, [open]);
```

**원본과의 차이**:
- ❌ `disableAutoFocus` 제거 → 항상 자동 포커스
- ❌ `disableRestoreFocus` 제거 → 항상 복원
- ❌ IE11 호환성 체크 제거
- ❌ `activated` 상태 제거

### 5. 포커스 강제 (contain 함수, 104-151줄)

```javascript
const contain = () => {
  const rootElement = rootRef.current;

  if (rootElement === null) return;

  const activeEl = document.activeElement;

  // ignoreNextEnforceFocus 체크
  if (!document.hasFocus() || ignoreNextEnforceFocus.current) {
    ignoreNextEnforceFocus.current = false;
    return;
  }

  // 포커스가 이미 안에 있으면 OK
  if (rootElement.contains(activeEl)) {
    return;
  }

  // Sentinel 노드에 포커스가 갔을 때만 처리
  let tabbable: ReadonlyArray<HTMLElement> = [];
  if (activeEl === sentinelStart.current || activeEl === sentinelEnd.current) {
    tabbable = defaultGetTabbable(rootRef.current!);
  }

  if (tabbable.length > 0) {
    const isShiftTab = Boolean(
      lastKeydown.current?.shiftKey && lastKeydown.current?.key === 'Tab',
    );

    const focusNext = tabbable[0];
    const focusPrevious = tabbable[tabbable.length - 1];

    if (isShiftTab) {
      focusPrevious.focus();
    } else {
      focusNext.focus();
    }
  } else {
    rootElement.focus();
  }
};
```

**제거된 로직**:
- ❌ `isEnabled()` 체크
- ❌ `disableEnforceFocus` 체크
- ❌ `reactFocusEventTarget` 추적
- ❌ `activated.current` 체크
- ❌ `ownerDocument()` 헬퍼 함수

### 6. 이벤트 리스너 (76-160줄)

```javascript
React.useEffect(() => {
  if (!open || !rootRef.current) {
    return;
  }

  const loopFocus = (nativeEvent: KeyboardEvent) => {
    lastKeydown.current = nativeEvent;

    if (nativeEvent.key !== 'Tab') {
      return;
    }

    if (activeElement === rootRef.current && nativeEvent.shiftKey) {
      ignoreNextEnforceFocus.current = true;
      if (sentinelEnd.current) {
        sentinelEnd.current.focus();
      }
    }
  };

  document.addEventListener('focusin', contain);
  document.addEventListener('keydown', loopFocus, true);

  return () => {
    document.removeEventListener('focusin', contain);
    document.removeEventListener('keydown', loopFocus, true);
  };
}, [open]);
```

**제거된 것**:
- ❌ `setInterval()` - 브라우저 버그 우회 로직
- ❌ `ownerDocument()` - 직접 `document` 사용
- ❌ 의존성 배열에서 6개 props → 1개만 (open)

### 7. Ref 처리 단순화

**원본**:
```javascript
const handleRef = useForkRef(getReactElementRef(children), rootRef);
{React.cloneElement(children, { ref: handleRef, onFocus })}
```

**수정본**:
```javascript
{React.cloneElement(children, { ref: rootRef, onFocus })}
```

- ❌ `useForkRef` 제거
- ❌ `getReactElementRef` 제거
- `rootRef`만 직접 전달

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

12. `e5f7ccb2` - **포커스 요소 가져오기 단순화** (51줄 삭제) ⭐
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
