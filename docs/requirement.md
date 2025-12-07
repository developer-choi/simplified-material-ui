# Material-UI 컴포넌트 단순화 프로젝트

## 프로젝트 목표

Material-UI의 복잡한 컴포넌트들을 **최소한의 기능만 남기고 단순화**하여 학습 및 이해를 돕는다.

## 작업 완료된 컴포넌트

- ✅ **Dialog** (548줄 → 94줄, 83% 감소)
- ✅ **Modal**
- ✅ **FocusTrap**
- ✅ **Portal**

## 작업 프로세스

### 0. 작업 시작 전 - 계획 단계 📋

**⚠️ 중요: 바로 코드를 수정+커밋작성 하지 말고, 먼저 삭제 계획을 세우고 사용자 컨펌을 받습니다.**

1. **컴포넌트 분석**
   - 원본 코드 읽기
   - 현재 기능 목록 파악
   - `[ComponentName]-original.md` 작성

2. **삭제 계획 작성**
   - 삭제할 기능들을 Phase별로 정리
   - 각 기능마다 커밋 메시지 초안 작성
   - 예상 커밋 목록 생성

3. **사용자 컨펌 대기** ✋
   - 삭제 계획을 사용자에게 제시
   - 사용자가 승인하면 작업 시작
   - 수정 요청이 있으면 계획 조정

4. **작업 시작**
   - 승인된 계획에 따라 진행

#### 계획서 예시

```markdown
## Button 컴포넌트 단순화 계획

### 현재 상태
- 파일: packages/mui-material/src/Button/Button.js
- 코드 라인: 450줄
- 주요 기능: variant, size, color, startIcon, endIcon, fullWidth 등

### 삭제 예정 기능 및 커밋 계획

#### Phase 1: Slot 시스템 제거
1. `slots`, `slotProps` prop 삭제
   - 커밋: "Button에서 Slot 시스템 삭제"

#### Phase 2: Icon Props 제거
2. `startIcon` prop 삭제
   - 커밋: "startIcon prop 삭제"
3. `endIcon` prop 삭제
   - 커밋: "endIcon prop 삭제"

#### Phase 3: Variant Props 제거
4. `variant` prop 삭제 (contained만 유지)
   - 커밋: "variant prop 삭제 (contained 고정)"
5. `color` prop 삭제 (primary만 유지)
   - 커밋: "color prop 삭제 (primary 고정)"

... (계속)

### 최종 목표
- 예상 코드 라인: ~80줄
- 남을 props: children, onClick, disabled, className

승인하시겠습니까? (y/n)
```

### 1. 점진적 단순화 원칙 ⚠️

**한 번에 모든 기능을 삭제하지 않습니다.** 다음과 같이 작업합니다:

1. **기능 하나 선택** (예: `onClick` prop)
2. **해당 기능만 삭제**
3. **커밋 메시지 작성** (예: "onClick prop 삭제")
4. **다음 기능으로 이동**

#### 커밋 예시 (Dialog 단순화 과정)

```
9e72205c7a Dialog에 Slot 삭제
88c1b47207 Dialog에서 Transition 다 삭제
8bc8941d89 BackdropComponent 고정으로 변경
b00786739b PaperComponent 고정으로 변경
ea2b00cc17 fullScreen prop 삭제
a8629a8885 fullWidth prop 삭제
1dd9a04d48 maxWidth prop 삭제
5ff021ece3 scroll prop 삭제
de1cf3d20a onClick prop 삭제
87da2fa64f useDefaultProps 삭제
91ff3513e8 useUtilityClasses, composeClasses 삭제
59795afe84 memoTheme 삭제 및 스타일 단순화
9f7e5eb9c5 불필요한 import 정리 (Fade 삭제)
0321935f39 classes, sx, ownerState 등 스타일 시스템 삭제
d0b0d6712a Dialog 구현 단순화 및 스타일 의존성 제거
e204177dad Dialog.js에 DialogContainer 및 DialogPaper 컴포넌트 재도입
58a1b606c8 Dialog에 DialogContext 기능 삭제
```

**왜 이렇게?**
- 각 변경 사항을 추적 가능
- 문제 발생 시 되돌리기 쉬움
- 변경 이력이 문서화됨
- 리뷰하기 쉬움

### 2. 삭제 대상 기능들

일반적으로 다음 기능들을 순서대로 제거합니다:

#### Phase 1: Slot 시스템 제거
**무엇을**: Material-UI v5의 컴포넌트 커스터마이징 시스템
**왜**: 내부 컴포넌트를 교체할 일이 거의 없고, 고정된 구조가 더 단순함
**삭제 대상**:
- `slots` prop (예: `slots={{ backdrop: CustomBackdrop }}`)
- `slotProps` prop (예: `slotProps={{ paper: { elevation: 8 } }}`)
- `useSlot()` 훅 호출

**커밋 예시**:
```
9e72205c7a Dialog에 Slot 삭제
```

---

#### Phase 2: Transition/Animation 제거
**무엇을**: 컴포넌트 등장/사라질 때 애니메이션
**왜**: 학습 목적으로는 즉시 표시/숨김만으로 충분함
**삭제 대상**:
- `TransitionComponent` prop
- `transitionDuration` prop
- Fade, Grow, Slide 등 애니메이션 컴포넌트 import 및 사용

**커밋 예시**:
```
88c1b47207 Dialog에서 Transition 다 삭제
```

---

#### Phase 3: Component Props 제거
**무엇을**: 내부 컴포넌트를 교체할 수 있는 props
**왜**: 고정된 컴포넌트만 사용하면 더 단순함
**삭제 대상**:
- `BackdropComponent` → 고정된 Backdrop만 사용
- `PaperComponent` → 고정된 Paper만 사용
- `ContainerComponent` 등

**커밋 예시**:
```
8bc8941d89 BackdropComponent 고정으로 변경
b00786739b PaperComponent 고정으로 변경
```

---

#### Phase 4: Layout/Style Props 제거
**무엇을**: 레이아웃과 크기를 조절하는 props
**왜**: 고정된 크기/레이아웃만 사용하면 코드가 단순해짐
**삭제 대상**:
- `fullScreen` prop → 항상 일반 모드
- `fullWidth` prop → 고정 너비
- `maxWidth` prop (xs/sm/md/lg/xl) → 600px 고정
- `scroll` prop (paper/body) → paper 모드 고정

**커밋 예시**:
```
ea2b00cc17 fullScreen prop 삭제
a8629a8885 fullWidth prop 삭제
1dd9a04d48 maxWidth prop 삭제
5ff021ece3 scroll prop 삭제
```

---

#### Phase 5: Event Props 제거
**무엇을**: 추가 이벤트 핸들러 props
**왜**: 기본 이벤트만으로 충분한 경우가 많음
**삭제 대상**:
- `onClick` prop (Dialog 자체의 클릭 이벤트)
- `onBackdropClick` (이미 onClose로 처리 가능)

**커밋 예시**:
```
de1cf3d20a onClick prop 삭제
```

---

#### Phase 6: Theme 시스템 제거
**무엇을**: Material-UI의 테마 통합 시스템
**왜**: 테마 없이 하드코딩된 값만 사용하면 의존성이 줄어듦
**삭제 대상**:
- `useDefaultProps()`로 테마 기본값 가져오기
- `useUtilityClasses()`로 CSS 클래스 생성
- `composeClasses()`로 클래스 병합
- `memoTheme()`로 테마 메모이제이션

**커밋 예시**:
```
87da2fa64f useDefaultProps 삭제
91ff3513e8 useUtilityClasses, composeClasses 삭제
59795afe84 memoTheme 삭제 및 스타일 단순화
```

---

#### Phase 7: Style 시스템 제거
**무엇을**: Material-UI의 스타일링 시스템
**왜**: 인라인 스타일로 대체하면 의존성이 줄어듦
**삭제 대상**:
- `styled()` 함수 사용 → 일반 div로 변경
- `classes` prop 및 className 병합
- `sx` prop (CSS-in-JS)
- `ownerState` (스타일에 props 전달)

**커밋 예시**:
```
0321935f39 classes, sx, ownerState 등 스타일 시스템 삭제
d0b0d6712a Dialog 구현 단순화 및 스타일 의존성 제거
```

---

#### Phase 8: Context 제거
**무엇을**: React Context API로 하위 컴포넌트와 통신
**왜**: 단순한 구조에서는 props로 충분함
**삭제 대상**:
- `DialogContext` (DialogTitle과 ID 공유)
- `ModalContext`
- Context Provider/Consumer 코드

**커밋 예시**:
```
58a1b606c8 Dialog에 DialogContext 기능 삭제
```

---

#### Phase 9: Disable/Enable Props 제거
**무엇을**: 기능을 켜고 끄는 boolean props
**왜**: 대부분 항상 같은 값으로 사용되므로 고정하면 단순해짐
**삭제 대상**:
- `disableAutoFocus` → 항상 자동 포커스
- `disableEnforceFocus` → 항상 포커스 강제
- `disableRestoreFocus` → 항상 포커스 복원
- `disableScrollLock` → 항상 스크롤 잠금
- `disablePortal` → 항상 Portal 사용

**커밋 예시**:
```
5131949fbe disableEnforceFocus, disableRestoreFocus, isEnabled 3개 props 삭제
aca44b10ab disableAutoFocus, activated 삭제
```

---

#### Phase 10: 복잡한 Ref 처리 제거
**무엇을**: 여러 ref를 병합하거나 전달하는 복잡한 로직
**왜**: 단순한 ref 사용만으로도 충분한 경우가 많음
**삭제 대상**:
- `useForkRef(ref1, ref2)` → 하나의 ref만 사용
- `getReactElementRef()` → React.cloneElement의 ref 직접 사용
- 복잡한 ref 병합 로직
- 자식에게 ref 전달하는 커스텀 로직

**커밋 예시**:
```
a231c0619f FocusTrap ref 처리 단순화 및 rootRef 직접 전달
35cdefd8ab FocusTrap.tsx에서 자식 ref 전달 로직 제거를 통해 handleRef 단순화
```

---

#### Phase 11: 브라우저 호환성 코드 제거
**무엇을**: 구형 브라우저를 지원하기 위한 코드
**왜**: 현대 브라우저만 타겟하면 코드가 단순해짐
**삭제 대상**:
- IE11 대응 코드
- Safari 구버전 대응
- Polyfill (Array.from, Promise 등)
- Vendor prefix 처리

**예시**:
```javascript
// 삭제 전
const element = Array.from ? Array.from(list) : [].slice.call(list);

// 삭제 후
const element = Array.from(list);
```

---

#### Phase 12: Interval/Polling 로직 제거
**무엇을**: 주기적으로 상태를 체크하는 코드
**왜**: 브라우저 버그를 우회하기 위한 것으로, 현대 브라우저에서는 불필요
**삭제 대상**:
- `setInterval()`로 주기적 포커스 체크
- 브라우저별 이벤트 버그 우회 코드

**커밋 예시**:
```
b6b4d72c5d Focus Trap에서 interval 로직 삭제
```

**설명**: FocusTrap에서는 포커스가 컨테이너 밖으로 나가는 것을 감지하기 위해 주기적으로 체크했지만, 이벤트 기반으로만 처리해도 충분함

---

#### Phase 13: 특수 케이스 처리 제거
**무엇을**: 특정 요소나 상황을 위한 예외 처리
**왜**: 일반적인 케이스만 지원하면 코드가 단순해짐
**삭제 대상**:
- 라디오 버튼 그룹 특수 처리 (포커스 이동 로직)
- 특정 input 타입별 예외 처리
- Edge case 방어 코드
- "혹시 모를" 방어적 로직

**커밋 예시**:
```
d3af9906d2 handleFocusSentinel() 코드 삭제
```

**설명**: `handleFocusSentinel()`은 "혹시 nodeToRestore가 없으면 지금이라도 저장해라"는 아주 방어적인 로직으로, 실제로는 거의 발생하지 않는 케이스를 대비한 것

**예시**:
```javascript
// 삭제 전: 라디오 버튼 특수 처리
if (element.type === 'radio' && element.name) {
  const group = container.querySelectorAll(`input[type="radio"][name="${element.name}"]`);
  // 라디오 그룹 내에서 checked된 것으로 이동
}

// 삭제 후: 일반 Tab 순서대로만 이동
```

---

#### Phase 14: 복잡한 알고리즘 단순화
**무엇을**: 복잡한 계산이나 정렬 로직
**왜**: 단순한 방식으로도 대부분의 경우에 동작함
**삭제 대상**:
- tabIndex 기반 정렬 알고리즘 (60줄) → `querySelectorAll()` 순서 사용
- React 내부 이벤트 트리 추적 (`reactFocusEventTarget`)
- 복잡한 우선순위 계산

**예시**:
```javascript
// 삭제 전: tabIndex 정렬 (60줄)
function defaultGetTabbable(root) {
  const regularTabNodes = [];
  const orderedTabNodes = [];
  Array.from(root.querySelectorAll(selector)).forEach(node => {
    const tabIndex = parseInt(node.getAttribute('tabIndex'), 10);
    if (tabIndex > 0) {
      orderedTabNodes.push({ node, tabIndex });
    } else {
      regularTabNodes.push(node);
    }
  });
  return orderedTabNodes.sort(...).map(...).concat(regularTabNodes);
}

// 삭제 후: DOM 순서 (3줄)
function defaultGetTabbable(root) {
  return Array.from(root.querySelectorAll(selector));
}
```

---

#### Phase 15: 유틸리티 함수 제거
**무엇을**: 재사용을 위한 helper 함수들
**왜**: 한 곳에서만 쓰이면 인라인으로 넣는 게 더 단순함
**삭제 대상**:
- `reactFocusEventTarget()` - React 내부 이벤트 타겟 추적
- `handleFocusSentinel()` - 방어적 포커스 저장 로직
- 한 번만 사용되는 helper 함수들

**커밋 예시**:
```
5d4f290314 reactFocusEventTarget 삭제
d3af9906d2 handleFocusSentinel() 코드 삭제
```

---

#### Phase 16: Deprecated Props 제거
**무엇을**: 하위 호환성을 위해 남겨둔 옛날 props
**왜**: 새로운 방식만 지원하면 코드가 깔끔해짐
**삭제 대상**:
- `PaperComponent` (대신 `slots.paper` 사용)
- `TransitionComponent` (대신 `slots.transition` 사용)
- 옛날 API를 새로운 API로 변환하는 코드

**예시**:
```javascript
// 삭제 전: 옛날 API 지원
const PaperSlot = slots?.paper ?? PaperComponent ?? Paper;

// 삭제 후: 고정
const PaperSlot = Paper;
```

---

#### Phase 17: 메타데이터 제거
**무엇을**: 개발/디버깅/문서화를 위한 추가 정보
**왜**: 학습 목적에서는 불필요함
**삭제 대상**:
- `PropTypes` - 런타임 타입 검증 (개발 모드에서만)
- `displayName` - 디버깅 시 컴포넌트 이름 표시
- `defaultProps` - 함수 파라미터 기본값으로 대체 가능
- JSDoc 주석 - 복잡한 설명

**예시**:
```javascript
// 삭제 전
Dialog.propTypes = {
  open: PropTypes.bool.isRequired,
  children: PropTypes.node,
  // ... 50줄
};

Dialog.displayName = 'Dialog';

// 삭제 후: 전부 삭제
```

### 3. 결과물

각 컴포넌트마다 다음 2개의 문서를 작성합니다:

```
docs/[상위개념을 뜻하는 키워드]/
  ├── [ComponentName]-original.md     # 원본 분석
  └── [ComponentName]-simplified.md   # 단순화 후 분석
```

#### original.md 구조
- 무슨 기능을 하는가?
- 내부 구조
- 주요 Props
- 설계 패턴
- 복잡도의 이유
- 사용 예시

#### simplified.md 구조
- 무슨 기능을 하는가? (남은 기능)
- 내부 구조
- **커밋 히스토리로 보는 단순화 과정** ⭐
- 원본과의 차이점 (표 형식)
- 스타일 비교 (코드 비교)
- 설계 철학의 변화
- 사용 예시
- 제한 사항
- 장단점

#### ⚠️ "무슨 기능을 하는가?" 작성 시 주의사항

**해당 컴포넌트 자체가 하는 일만 작성하세요. 하위 컴포넌트의 기능까지 포함하지 마세요.**

**❌ 나쁜 예시 (Dialog 설명)**:
```markdown
## 무슨 기능을 하는가?

Dialog는 다음 기능을 제공합니다:
1. 백드롭 표시 (화면 어둡게)
2. 포커스 트랩 (Tab 키 가두기)
3. ESC 키로 닫기
4. Portal로 body에 렌더링
5. 중앙 정렬
6. Paper 스타일
```
→ 1-4번은 Modal이 하는 일! Dialog가 직접 하는 건 아님

**✅ 좋은 예시 (Dialog 설명)**:
```markdown
## 무슨 기능을 하는가?

Dialog는 **Modal을 감싸서 대화상자 UI를 제공하는 고수준 컴포넌트**입니다.

Dialog 자체가 하는 일:
1. Modal을 래핑
2. 중앙 정렬 (DialogContainer)
3. Paper 스타일 적용 (DialogPaper)
4. ARIA 속성 추가 (role="dialog", aria-labelledby)

Modal이 제공하는 기능 (상속):
- 백드롭, 포커스 트랩, ESC 키, Portal 등
```
→ 명확하게 구분!

**다른 예시**:

**Button 컴포넌트**:
- ❌ "클릭 이벤트 처리" → 이건 HTML button이 원래 하는 일
- ✅ "ButtonBase를 감싸서 Material Design 스타일 적용"

**TextField 컴포넌트**:
- ❌ "텍스트 입력 받기" → 이건 HTML input이 하는 일
- ✅ "Input과 FormControl을 조합하여 레이블, 헬퍼텍스트 레이아웃 제공"

## 참고 자료

### 완료된 컴포넌트 커밋 목록

Dialog 관련 주요 커밋:
```
4a35ad54c5 Dialog 하위 컴포넌트들 md 분석결과 추가
58a1b606c8 Dialog에 DialogContext 기능 삭제
e204177dad Dialog.js에 DialogContainer 및 DialogPaper 컴포넌트 재도입
d0b0d6712a Dialog 구현 단순화 및 스타일 의존성 제거
0321935f39 classes, sx, ownerState 등 스타일 시스템 삭제
9f7e5eb9c5 불필요한 import 정리 (Fade 삭제)
59795afe84 memoTheme 삭제 및 스타일 단순화
91ff3513e8 useUtilityClasses, composeClasses 삭제
87da2fa64f useDefaultProps 삭제
de1cf3d20a onClick prop 삭제
5ff021ece3 scroll prop 삭제
1dd9a04d48 maxWidth prop 삭제
a8629a8885 fullWidth prop 삭제
ea2b00cc17 fullScreen prop 삭제
b00786739b PaperComponent 고정으로 변경
8bc8941d89 BackdropComponent 고정으로 변경
88c1b47207 Dialog에서 Transition 다 삭제
9e72205c7a Dialog에 Slot 삭제
```

### 참고 문서

- `docs/modal/Modal-original.md` - 원본 Modal 분석
- `docs/modal/Modal-simplified.md` - 단순화된 Modal 분석

## 작업 체크리스트

새 컴포넌트를 단순화할 때:

1. [ ] 원본 컴포넌트 코드 읽기
2. [ ] `ComponentName-original.md` 작성
3. [ ] **삭제 계획서 작성 (커밋 목록 포함)** 📋
4. [ ] **사용자 컨펌 대기** ✋
5. [ ] **기능 하나씩 삭제 + 커밋 반복** ⚠️
6. [ ] 최종 코드 검증
7. [ ] `[ComponentName]-simplified.md` 작성 (커밋 히스토리 포함)

## 주의 사항

- ⚠️ **작업 시작 전 반드시 삭제 계획서를 작성하고 사용자 컨펌을 받을 것**
- ⚠️ **절대 한 번에 여러 기능을 삭제하지 말 것**
- ⚠️ **각 단계마다 반드시 커밋할 것**
- 커밋 메시지는 명확하게 (예: "onClick prop 삭제")
- 단순화 후에도 기본 기능은 동작해야 함
- ARIA 접근성은 유지할 것

---
