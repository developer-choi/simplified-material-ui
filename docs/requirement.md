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

#### 계획서 제출 양식 ⭐

**⚠️ 계획서 작성 시 반드시 Plan Mode를 사용하세요!**
- Plan mode로 들어가서 코드베이스를 탐색하고 체계적으로 계획을 작성합니다
- `EnterPlanMode` 도구를 호출하여 plan mode로 진입합니다
- Plan mode에서 계획서를 작성한 후 `ExitPlanMode`로 사용자 승인을 받습니다

**계획서는 반드시 아래 양식을 따라야 합니다. 아래 Phase 1-17 예시를 참고하세요.**

```markdown
## [ComponentName] 컴포넌트 단순화 계획

### 현재 상태
- 파일: packages/mui-material/src/[ComponentName]/[ComponentName].js
- 코드 라인: XXX줄
- 베이스: [상속하는 컴포넌트 있으면 명시]
- 주요 기능: [주요 props나 기능 나열]

### 삭제 예정 기능 및 커밋 계획

#### Phase N: [Phase 이름]

**무엇을**: [삭제할 기능에 대한 1줄 설명]

**왜 불필요한가**:
[코드 예시 필요시 포함]

- **학습 목적**:
  - [이 기능이 학습 목적과 맞지 않는 이유]
  - [더 단순한 방법으로도 개념 이해 가능한 이유]

- **복잡도**:
  - [이 기능이 복잡한 이유 나열]
  - [관련 코드나 로직이 얼마나 복잡한지]

- **현실/일관성/대안** (선택):
  - [실제로는 잘 안 쓰이는 기능인지]
  - [다른 단순화된 컴포넌트와의 일관성]
  - [대체 가능한 더 단순한 방법]

**삭제 대상**:
- [삭제할 prop 1]
- [삭제할 prop 2]
- [삭제할 함수/컴포넌트 등]

**커밋**:
1. [변경사항 설명]
   - 커밋: "[ComponentName 단순화 X/Y] [커밋 메시지]"

---

... (다른 Phase들 계속)

### 최종 목표
- 남을 props: [최종적으로 남을 props 나열]
- 고정값: [고정될 값들 명시]
- 스타일: [스타일 처리 방법]

승인하시겠습니까? (y/n)
```

**⚠️ 핵심 규칙:**
- 각 Phase마다 "**무엇을**", "**왜 불필요한가**", "**삭제 대상**", "**커밋**" 4개 섹션 필수
- "왜 불필요한가"에는 "학습 목적", "복잡도" 중 최소 1개 이상 포함
- 아래 Phase 1-17 예시를 참고하여 구체적으로 작성

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

**왜 불필요한가**:
```javascript
// Slot 시스템으로 할 수 있는 것
<Dialog
  slots={{
    paper: CustomPaper,      // Paper를 내 컴포넌트로 교체
    backdrop: CustomBackdrop, // Backdrop도 교체
  }}
  slotProps={{
    paper: { myProp: 'value' },
  }}
/>
```

- **학습 목적**:
  - 커스터마이징 배우는 게 아니라 컴포넌트의 핵심 개념을 배우는 것
  - 고정된 구조가 이해하기 쉬움
- **복잡도**:
  - `useSlot()` 훅 여러 번 호출 필요
  - props 병합 로직 복잡
  - slot별로 props 전달 및 병합
- **일관성**: Dialog, Modal 등 모든 단순화된 컴포넌트에서 제거

**삭제 대상**:
- `slots` prop (예: `slots={{ backdrop: CustomBackdrop }}`)
- `slotProps` prop (예: `slotProps={{ paper: { elevation: 8 } }}`)
- `useSlot()` 훅 호출
- `externalForwardedProps` 객체

**커밋 예시**:
```
9e72205c7a Dialog에 Slot 삭제
```

---

#### Phase 2: Transition/Animation 제거

**무엇을**: 컴포넌트 등장/사라질 때 애니메이션 (Fade, Grow, Slide 등)

**왜 불필요한가**:
```javascript
// Transition은 복잡함
<Fade in={open} timeout={300}>
  <Dialog>{children}</Dialog>
</Fade>

// 또는
<Slide
  in={open}
  direction="right"
  timeout={{ enter: 225, exit: 195 }}
  appear={mounted.current}  // 초기 마운트 시 스킵
>
  <DrawerPaper>{children}</DrawerPaper>
</Slide>
```

- **학습 목적**:
  - 컴포넌트의 핵심은 UI 구조이지 "애니메이션"이 아님
  - 애니메이션은 Transition 컴포넌트의 책임 → 별도로 배워야 할 주제
  - 즉시 나타나도 기능은 똑같음
- **복잡도**:
  - `mounted.current` ref로 초기 렌더링 추적
  - `appear` prop 계산 필요
  - 테마에서 duration 가져오기 (theme.transitions.duration)
  - 방향별 애니메이션 매핑 (Drawer의 경우 anchor → slide direction)

**삭제 대상**:
- `TransitionComponent` prop
- `transitionDuration` prop
- Fade, Grow, Slide 등 애니메이션 컴포넌트 import 및 사용
- `mounted` ref 및 초기 마운트 추적 로직

**커밋 예시**:
```
88c1b47207 Dialog에서 Transition 다 삭제
```

---

#### Phase 3: Component Props 제거

**무엇을**: 내부 컴포넌트를 교체할 수 있는 props

**왜 불필요한가**:
```javascript
// 컴포넌트 교체 예시
<Dialog
  BackdropComponent={MyCustomBackdrop}
  PaperComponent={MyCustomPaper}
  ContainerComponent={MyCustomContainer}
>
  {children}
</Dialog>
```

- **학습 목적**:
  - 고정된 컴포넌트로도 Dialog의 핵심 개념을 충분히 이해 가능
  - "어떻게 커스터마이징하나"가 아니라 "어떻게 동작하나"가 중요
- **복잡도**:
  - 각 Component prop마다 fallback 처리 필요
  - props 전달 로직 복잡 (어떤 props를 전달해야 하나?)
- **Slot 시스템과 중복**: Slot 시스템이 이미 같은 기능 제공 (deprecated)

**삭제 대상**:
- `BackdropComponent` → 고정된 Backdrop만 사용
- `PaperComponent` → 고정된 Paper만 사용
- `ContainerComponent` → 고정된 Container만 사용
- Component 선택 로직 (fallback 처리)

**커밋 예시**:
```
8bc8941d89 BackdropComponent 고정으로 변경
b00786739b PaperComponent 고정으로 변경
```

---

#### Phase 4: Layout/Style Props 제거

**무엇을**: 레이아웃과 크기를 조절하는 props (fullScreen, fullWidth, maxWidth, scroll 등)

**왜 불필요한가**:
```javascript
// 다양한 레이아웃 옵션
<Dialog maxWidth="xs">  {/* 444px */}
<Dialog maxWidth="sm">  {/* 600px */}
<Dialog maxWidth="md">  {/* 960px */}
<Dialog maxWidth="lg">  {/* 1280px */}
<Dialog maxWidth="xl">  {/* 1920px */}

<Dialog fullWidth>      {/* maxWidth까지 꽉 참 */}
<Dialog fullScreen>     {/* 전체 화면 */}

<Dialog scroll="paper">  {/* Dialog 내부만 스크롤 */}
<Dialog scroll="body">   {/* body 전체 스크롤 */}
```

- **학습 목적**:
  - Dialog의 핵심은 "모달 대화상자"이지 "반응형 레이아웃"이 아님
  - 하나의 크기만 있어도 개념 이해 충분
- **복잡도**:
  - maxWidth 5가지 × fullWidth 2가지 × scroll 2가지 = 20가지 조합
  - 테마 breakpoint 시스템 의존 (theme.breakpoints.values.sm 등)
  - 각 조합마다 다른 스타일 필요 (variants 배열)
- **현실**: 대부분 기본값(sm, 600px) 사용

**삭제 대상**:
- `fullScreen` prop → 항상 일반 모드
- `fullWidth` prop → 고정 너비
- `maxWidth` prop (xs/sm/md/lg/xl) → 600px 고정
- `scroll` prop (paper/body) → paper 모드 고정
- breakpoint 반응형 로직

**커밋 예시**:
```
ea2b00cc17 fullScreen prop 삭제
a8629a8885 fullWidth prop 삭제
1dd9a04d48 maxWidth prop 삭제
5ff021ece3 scroll prop 삭제
```

---

#### Phase 5: Event Props 제거

**무엇을**: 추가 이벤트 핸들러 props (onClick, onBackdropClick 등)

**왜 불필요한가**:
```javascript
// 다양한 이벤트 핸들러
<Dialog
  onClick={handleDialogClick}
  onBackdropClick={handleBackdropClick}
  onClose={handleClose}
>
```

- **학습 목적**:
  - 이벤트 처리는 React의 기본 개념
  - Dialog의 핵심 동작 이해에 불필요
  - `onClose` 하나로 충분 (ESC 키, backdrop 클릭 모두 처리)
- **복잡도**:
  - 이벤트 전파 처리 (stopPropagation 등)
  - `onBackdropClick`과 `onClose`의 차이점 설명 필요
- **중복성**:
  - `onBackdropClick` → `onClose`로 처리 가능
  - `onClick` → Dialog 전체 클릭은 거의 사용 안 함

**삭제 대상**:
- `onClick` prop (Dialog 자체의 클릭 이벤트)
- `onBackdropClick` prop (backdrop 클릭은 onClose로 통합)
- 기타 세밀한 이벤트 핸들러

**커밋 예시**:
```
de1cf3d20a onClick prop 삭제
```

---

#### Phase 6: Theme 시스템 제거

**무엇을**: Material-UI의 테마 통합 시스템

**왜 불필요한가**:
```javascript
// useDefaultProps: 테마에서 기본값 가져오기
const props = useDefaultProps({ props: inProps, name: 'MuiDialog' });
// theme.components.MuiDialog.defaultProps에서 기본값 병합

// useUtilityClasses: CSS 클래스 이름 생성
const classes = {
  root: 'MuiDialog-root MuiDialog-scroll-paper',
  paper: 'MuiDialog-paper MuiDialog-paperScrollPaper'
};

// memoTheme: 테마 기반 스타일 메모이제이션
const styles = memoTheme(({ theme }) => ({
  zIndex: theme.zIndex.modal,  // 1300
  color: theme.palette.primary.main,  // #1976d2
}));
```

- **학습 목적**:
  - 테마 시스템은 Material-UI 전체의 주제로, 개별 컴포넌트 학습에는 과함
  - 하드코딩된 값으로도 컴포넌트 동작 이해 가능
  - `zIndex: 1300` vs `zIndex: theme.zIndex.modal` → 결과는 같음
- **복잡도**:
  - 테마 Context 구독
  - props 병합 로직
  - 클래스 이름 생성 및 조합
  - 메모이제이션 최적화
- **의존성**: 테마 시스템, Context, 유틸리티 함수 등 제거 가능

**삭제 대상**:
- `useDefaultProps()` → 함수 파라미터 기본값으로 대체
- `useUtilityClasses()` → 클래스 이름 제거
- `composeClasses()` → 클래스 병합 불필요
- `memoTheme()` → 하드코딩된 값 사용
- `useTheme()` → 테마 값을 상수로 대체

**커밋 예시**:
```
87da2fa64f useDefaultProps 삭제
91ff3513e8 useUtilityClasses, composeClasses 삭제
59795afe84 memoTheme 삭제 및 스타일 단순화
```

---

#### Phase 7: Style 시스템 제거

**무엇을**: Material-UI의 스타일링 시스템 (styled, sx, ownerState 등)

**왜 불필요한가**:
```javascript
// styled (복잡)
const DialogPaper = styled(Paper, {
  name: 'MuiDialog',
  slot: 'Paper',
  overridesResolver: (props, styles) => [
    styles.paper,
    styles[`paperScroll${capitalize(ownerState.scroll)}`],
  ],
})(memoTheme(({ theme }) => ({
  margin: 32,
  maxWidth: theme.breakpoints.values.sm,
  variants: [
    { props: { scroll: 'paper' }, style: { ... } },
    { props: { scroll: 'body' }, style: { ... } },
  ]
})));

// 인라인 스타일 (단순)
const DialogPaper = ({ children, ...props }) => (
  <div {...props} style={{
    margin: 32,
    maxWidth: 600,
    ...props.style
  }}>
    {children}
  </div>
);
```

- **학습 목적**:
  - 컴포넌트 구조 배우는 것이지 CSS-in-JS 배우는 게 아님
  - 인라인 스타일로도 똑같이 동작
  - 코드 가독성 향상 (스타일이 바로 보임)
- **복잡도**:
  - `styled()` API 이해 필요
  - `overridesResolver`: 테마 오버라이드 지원
  - `variants`: 조건부 스타일
  - `ownerState`: props를 스타일에 전달
  - `shouldForwardProp`: DOM에 전달할 prop 필터링
- **의존성**: @mui/system, emotion, styled-components 등 제거

**삭제 대상**:
- `styled()` 함수 → 일반 div/span으로 변경
- `classes` prop 및 className 병합 → 단순 className만
- `sx` prop (CSS-in-JS) → 인라인 style
- `ownerState` → props 직접 사용
- `overridesResolver` → 제거
- `variants` → 조건문으로 대체

**커밋 예시**:
```
0321935f39 classes, sx, ownerState 등 스타일 시스템 삭제
d0b0d6712a Dialog 구현 단순화 및 스타일 의존성 제거
```

---

#### Phase 8: Context 제거

**무엇을**: React Context API로 하위 컴포넌트와 통신

**왜 불필요한가**:
```javascript
// Context 사용 예시
const DialogContext = React.createContext({ titleId: undefined });

// Dialog가 Provider 제공
<DialogContext.Provider value={{ titleId }}>
  <Modal>
    {children}  {/* DialogTitle이 여기에 */}
  </Modal>
</DialogContext.Provider>

// DialogTitle이 Context에서 ID 가져옴
const { titleId } = React.useContext(DialogContext);
<h2 id={titleId}>Title</h2>
```

- **학습 목적**:
  - Context는 React의 별도 주제 (prop drilling 해결)
  - Dialog의 핵심 개념과 무관
  - 단순 구조에서는 props로 충분
- **복잡도**:
  - Context 생성 및 Provider 설정
  - Consumer/useContext 사용
  - 하위 컴포넌트 (DialogTitle) 의존성
- **대안**:
  - DialogTitle을 제거하면 Context 불필요
  - 또는 직접 `aria-labelledby` prop으로 ID 전달

**삭제 대상**:
- `DialogContext` (DialogTitle과 ID 공유)
- `ModalContext`
- Context Provider/Consumer 코드
- Context 관련 import

**커밋 예시**:
```
58a1b606c8 Dialog에 DialogContext 기능 삭제
```

---

#### Phase 9: Disable/Enable Props 제거

**무엇을**: 기능을 켜고 끄는 boolean props (disable*)

**왜 불필요한가**:
```javascript
// 다양한 disable props
<Modal
  disableAutoFocus      // 자동 포커스 끄기
  disableEnforceFocus   // 포커스 강제 끄기
  disableRestoreFocus   // 포커스 복원 끄기
  disableScrollLock     // 스크롤 잠금 끄기
  disablePortal         // Portal 끄기
  disableEscapeKeyDown  // ESC 키 끄기
>
```

- **학습 목적**:
  - Material Design 가이드라인: Modal은 기본 동작이 있음
  - 대부분 기본값(false) 사용 → 항상 켜진 상태
  - 예외 케이스는 학습에 불필요
- **복잡도**:
  - 각 disable prop마다 조건문 추가
  - 상호 의존성 (disableAutoFocus면 disableRestoreFocus도 고려)
  - 테스트 케이스 2^n개 (n = disable props 개수)
- **현실**: 99% 기본값 사용

**예시**:
```javascript
// 삭제 전
if (!disableAutoFocus) {
  focusTrap.activate();
}

// 삭제 후
focusTrap.activate();  // 항상 실행
```

**삭제 대상**:
- `disableAutoFocus` → 항상 자동 포커스
- `disableEnforceFocus` → 항상 포커스 강제
- `disableRestoreFocus` → 항상 포커스 복원
- `disableScrollLock` → 항상 스크롤 잠금
- `disablePortal` → 항상 Portal 사용
- 조건부 활성화 로직

**커밋 예시**:
```
5131949fbe disableEnforceFocus, disableRestoreFocus, isEnabled 3개 props 삭제
aca44b10ab disableAutoFocus, activated 삭제
```

---

#### Phase 10: 복잡한 Ref 처리 제거

**무엇을**: 여러 ref를 병합하거나 전달하는 복잡한 로직

**왜 불필요한가**:
```javascript
// useForkRef: 여러 ref를 하나로 병합
const handleRef = useForkRef(
  ownRef,           // 컴포넌트 내부 ref
  forwardedRef,     // 부모가 전달한 ref
  childRef          // 자식의 ref
);

// getReactElementRef: 자식 요소의 ref 가져오기
const childRef = getReactElementRef(children);
const mergedRef = useForkRef(childRef, ownRef);
const newChild = React.cloneElement(children, { ref: mergedRef });
```

- **학습 목적**:
  - ref 병합은 React의 고급 주제
  - 단순한 ref 하나로도 컴포넌트 이해 가능
  - ref 병합 자체가 배울 주제가 아님
- **복잡도**:
  - `useForkRef` 유틸리티 필요
  - `getReactElementRef` 유틸리티 필요
  - React.cloneElement로 자식 복제
  - ref 콜백 함수 생성 및 메모이제이션
- **대안**: ref 하나만 사용 (forwardedRef)

**삭제 대상**:
- `useForkRef(ref1, ref2)` → 하나의 ref만 사용
- `getReactElementRef()` → 자식 ref 가져오기 제거
- 복잡한 ref 병합 로직
- 자식에게 ref 전달하는 커스텀 로직
- React.cloneElement로 ref 주입

**커밋 예시**:
```
a231c0619f FocusTrap ref 처리 단순화 및 rootRef 직접 전달
35cdefd8ab FocusTrap.tsx에서 자식 ref 전달 로직 제거를 통해 handleRef 단순화
```

---

#### Phase 11: 브라우저 호환성 코드 제거

**무엇을**: 구형 브라우저를 지원하기 위한 코드

**왜 불필요한가**:
```javascript
// IE11 대응
const element = Array.from ? Array.from(list) : [].slice.call(list);

// Safari 구버전 대응
WebkitOverflowScrolling: 'touch',  // iOS < 13

// Polyfill 조건문
if (!window.Promise) {
  // Promise polyfill
}
```

- **학습 목적**:
  - 현대 브라우저(Chrome, Firefox, Safari, Edge)만 타겟
  - 호환성 코드는 레거시 지원용으로 학습과 무관
  - 표준 API 사용이 더 명확함
- **복잡도**:
  - Feature detection 조건문
  - Polyfill import 및 관리
  - Vendor prefix (-webkit-, -moz-, -ms-)
- **현실**: 2025년 기준 IE11 점유율 0.3% 미만

**삭제 대상**:
- IE11 대응 코드
- Safari 구버전 대응 (-webkit- prefix 등)
- Polyfill (Array.from, Promise, Object.assign 등)
- Feature detection 조건문

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

**왜 불필요한가**:
```javascript
// Interval로 포커스 추적 (구형 브라우저 버그 우회)
let intervalId;

function activate() {
  // 500ms마다 포커스가 컨테이너 밖으로 나갔는지 체크
  intervalId = setInterval(() => {
    if (!container.contains(document.activeElement)) {
      // 포커스가 밖으로 나감 → 다시 안으로
      container.focus();
    }
  }, 500);
}

function deactivate() {
  clearInterval(intervalId);
}
```

- **학습 목적**:
  - 이벤트 기반 처리가 더 직관적
  - Interval은 브라우저 버그 우회용 (학습과 무관)
  - FocusTrap의 핵심은 "포커스 가두기"이지 "Polling"이 아님
- **복잡도**:
  - setInterval/clearInterval 관리
  - 메모리 누수 방지 (cleanup)
  - Polling 주기 최적화 (너무 짧으면 성능↓, 길면 반응↓)
- **성능**: Polling 대신 이벤트 리스너 → CPU 사용↓
- **현대 브라우저**: focus/blur 이벤트가 정확히 동작

**삭제 대상**:
- `setInterval()`로 주기적 포커스 체크
- 브라우저별 이벤트 버그 우회 코드
- interval ID 관리 코드

**커밋 예시**:
```
b6b4d72c5d Focus Trap에서 interval 로직 삭제
```

**대안**:
```javascript
// 이벤트 기반 (간단)
container.addEventListener('focusout', (e) => {
  if (!container.contains(e.relatedTarget)) {
    container.focus();  // 포커스 복원
  }
});
```

---

#### Phase 13: 특수 케이스 처리 제거

**무엇을**: 특정 요소나 상황을 위한 예외 처리

**왜 불필요한가**:
```javascript
// 라디오 버튼 그룹 특수 처리
if (element.type === 'radio' && element.name) {
  const group = container.querySelectorAll(
    `input[type="radio"][name="${element.name}"]`
  );
  // 라디오 그룹 내에서 checked된 것으로 포커스
  const checked = group.find(r => r.checked) || group[0];
  checked.focus();
  return;  // 일반 Tab 처리 스킵
}

// handleFocusSentinel: "혹시 모를" 방어 로직
function handleFocusSentinel() {
  if (!nodeToRestore) {
    nodeToRestore = document.activeElement;  // 지금이라도 저장
  }
}
```

- **학습 목적**:
  - 일반적인 케이스(Tab 순서)만 이해해도 충분
  - 특수 케이스는 접근성 고급 주제
  - 80%의 경우에 동작하면 학습 목적으로 OK
- **복잡도**:
  - 각 input type별로 다른 처리 (radio, checkbox, select 등)
  - Edge case detection 코드
  - "혹시 모를" 방어적 if문 남발
- **현실**: 대부분 일반 Tab 순서로 충분

**삭제 대상**:
- 라디오 버튼 그룹 특수 처리 (포커스 이동 로직)
- 특정 input 타입별 예외 처리
- Edge case 방어 코드
- "혹시 모를" 방어적 로직 (handleFocusSentinel 등)

**커밋 예시**:
```
d3af9906d2 handleFocusSentinel() 코드 삭제
```

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

**무엇을**: 복잡한 계산이나 정렬 로직 (tabIndex 정렬, 우선순위 등)

**왜 불필요한가**:
```javascript
// tabIndex 기반 정렬 (60줄)
function defaultGetTabbable(root) {
  const regularTabNodes = [];      // tabIndex=0 또는 없음
  const orderedTabNodes = [];      // tabIndex=1,2,3...

  Array.from(root.querySelectorAll(selector)).forEach(node => {
    const tabIndex = parseInt(node.getAttribute('tabIndex'), 10);
    if (tabIndex > 0) {
      orderedTabNodes.push({ node, tabIndex });
    } else {
      regularTabNodes.push(node);
    }
  });

  // tabIndex 숫자 순으로 정렬 후 regularTabNodes 추가
  return orderedTabNodes
    .sort((a, b) => a.tabIndex - b.tabIndex)
    .map(item => item.node)
    .concat(regularTabNodes);
}
```

- **학습 목적**:
  - HTML 표준: tabIndex > 0은 안티패턴 (거의 사용 안 함)
  - DOM 순서로도 99% 케이스에서 정상 동작
  - 정렬 알고리즘 자체가 학습 주제가 아님
- **복잡도**:
  - 60줄의 정렬 로직
  - 배열 분리 → 정렬 → 병합
  - 우선순위 계산
- **현실**: tabIndex > 0 사용하는 사이트 거의 없음

**삭제 대상**:
- tabIndex 기반 정렬 알고리즘 (60줄) → `querySelectorAll()` DOM 순서 사용
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

**왜 불필요한가**:
```javascript
// 유틸리티 함수 예시
function reactFocusEventTarget() {
  // React의 내부 이벤트 타겟 추적
  // 30줄의 복잡한 로직...
}

function handleFocusSentinel() {
  // "혹시 모를" 방어 로직
  if (!nodeToRestore) {
    nodeToRestore = document.activeElement;
  }
}

// 사용: 한 곳에서만 호출
const target = reactFocusEventTarget();
```

- **학습 목적**:
  - 함수 추상화는 코드 재사용이 목적
  - 한 곳에서만 쓰면 인라인이 더 명확
  - "무엇을 하는가"가 바로 보임
- **복잡도**:
  - 함수 정의 찾아가며 읽어야 함
  - 함수 이름으로 추상화 → 세부 동작 숨김
- **원칙**: YAGNI (You Aren't Gonna Need It) - 실제로 재사용할 때만 함수화

**삭제 대상**:
- `reactFocusEventTarget()` - React 내부 이벤트 타겟 추적 (30줄) → 사용처에 인라인
- `handleFocusSentinel()` - 방어적 포커스 저장 로직 → 아예 제거
- 한 번만 사용되는 helper 함수들

**커밋 예시**:
```
5d4f290314 reactFocusEventTarget 삭제
d3af9906d2 handleFocusSentinel() 코드 삭제
```

---

#### Phase 16: Deprecated Props 제거

**무엇을**: 하위 호환성을 위해 남겨둔 옛날 props

**왜 불필요한가**:
```javascript
// 옛날 API와 새 API 동시 지원
const {
  PaperComponent,           // deprecated (v4 스타일)
  TransitionComponent,      // deprecated (v4 스타일)
  BackdropProps,            // deprecated (v4 스타일)
  slots = {},               // 새 API (v5+)
  slotProps = {},           // 새 API (v5+)
} = props;

// 병합 로직 (복잡)
const PaperSlot = slots.paper ?? PaperComponent ?? Paper;
const TransitionSlot = slots.transition ?? TransitionComponent ?? Fade;
const backdropProps = { ...BackdropProps, ...slotProps.backdrop };
```

- **학습 목적**:
  - 하위 호환성은 프로덕션 라이브러리의 책임
  - 학습용으로는 최신 방식 하나만 이해하면 충분
  - 옛날 API를 배울 이유 없음
- **복잡도**:
  - 두 가지 API 병합 로직
  - fallback 체인 (a ?? b ?? c)
  - props 이름 변환 (PaperComponent → slots.paper)
- **혼란**: "어느 걸 써야 하나?" → 선택지 줄이기

**삭제 대상**:
- `PaperComponent` (대신 `slots.paper` 사용) → 어차피 Slot 시스템도 제거
- `TransitionComponent` (대신 `slots.transition` 사용)
- `BackdropProps`, `componentsProps` 등 옛날 props
- 옛날 API를 새로운 API로 변환하는 병합 코드

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

**왜 불필요한가**:
```javascript
// PropTypes (런타임 타입 검증)
Dialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  children: PropTypes.node,
  disableEscapeKeyDown: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  // ... 100줄
};

// displayName (디버깅용)
Dialog.displayName = 'Dialog';

// defaultProps (기본값)
Dialog.defaultProps = {
  maxWidth: 'sm',
  scroll: 'paper',
};
```

- **학습 목적**:
  - PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님
  - TypeScript를 사용하면 빌드 타임에 검증 (더 강력)
  - displayName은 React DevTools에서만 유용
  - defaultProps는 함수 파라미터 기본값으로 대체 가능
- **복잡도**:
  - PropTypes 100줄 이상 (Dialog 기준)
  - JSDoc 주석 수십 줄
  - 실제 코드보다 메타데이터가 더 많음
- **프로덕션**: PropTypes는 빌드 시 제거됨 (babel-plugin-transform-react-remove-prop-types)

**삭제 대상**:
- `PropTypes` - 런타임 타입 검증 (개발 모드에서만, 100줄+)
- `displayName` - 디버깅 시 컴포넌트 이름 표시
- `defaultProps` - 함수 파라미터 기본값으로 대체
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

Dialog.defaultProps = {
  maxWidth: 'sm',
};

// 삭제 후: 전부 삭제

// 대신 함수 파라미터 기본값 사용
function Dialog({ open, children, maxWidth = 'sm' }) {
  // ...
}
```

### 3. 결과물

각 컴포넌트마다 다음 2개의 문서를 작성합니다:

```
docs/[상위개념을 뜻하는 키워드]/
  ├── [ComponentName]-original.md     # 원본 분석
  └── [ComponentName]-simplified.md   # 단순화 후 분석
```

---

#### ⭐ original.md 작성 가이드

**작성 항목**:
1. 무슨 기능을 하는가?
2. 내부 구조
3. 주요 Props
4. 설계 패턴
5. 복잡도의 이유
6. 사용 예시

**형식 예시**: `docs/modal/Dialog-original.md` 참고

---

#### ⭐ simplified.md 작성 가이드

**작성 항목**:
1. 무슨 기능을 하는가? (남은 기능)
2. 내부 구조
3. **⭐ 커밋 히스토리로 보는 단순화 과정** (계획서의 Phase와 일치하게 그룹화)
4. 원본과의 차이점 (표 형식)
5. 스타일 비교
6. 설계 철학의 변화
7. 사용 예시
8. 제한 사항
9. 장단점

**형식 예시**: `docs/modal/Dialog-simplified.md` 참고

**커밋 히스토리 주의사항**:
- 계획서의 Phase와 일치하게 그룹화
- 각 커밋의 해시 8자리 포함
- 변경 줄 수는 선택적
- 시간 순서대로 나열 (가장 먼저 한 것부터)

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

## 작업 체크리스트

새 컴포넌트를 단순화할 때:

1. [ ] 원본 컴포넌트 코드 읽기
2. [ ] **삭제 계획서 작성 (커밋 목록 포함)** 📋
3. [ ] **사용자 컨펌 대기** ✋
4. [ ] **기능 하나씩 삭제 + 커밋 반복** ⚠️
5. [ ] 최종 코드 검증
6. [ ] `ComponentName-original.md` 작성
7. [ ] `ComponentName-simplified.md` 작성 (커밋 히스토리 포함)

## 주의 사항

- ⚠️ **작업 시작 전 반드시 삭제 계획서를 작성하고 사용자 컨펌을 받을 것**
- ⚠️ **절대 한 번에 여러 기능을 삭제하지 말 것**
- ⚠️ **각 단계마다 반드시 커밋할 것**
- 커밋 메시지는 명확하게 (예: "onClick prop 삭제")
- 단순화 후에도 기본 기능은 동작해야 함
- ARIA 접근성은 유지할 것

---
