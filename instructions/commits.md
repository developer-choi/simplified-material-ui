일반적으로 다음 기능들을 순서대로 제거합니다:

# Commit 1: Slot 시스템 제거

**무엇을**: 컴포넌트 커스터마이징 시스템

**왜 불필요한가**:

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

**예시**:
```javascript
// ❌ 삭제 대상
const [BackdropSlot, backdropProps] = useSlot('backdrop', {
  elementType: Backdrop,
  externalSlotProps: slotProps?.backdrop,
  additionalProps: { onClick: handleBackdropClick },
});
return <BackdropSlot {...backdropProps} />;

// ✅ 단순화 결과
return <Backdrop onClick={handleBackdropClick} />;
```

---

# Commit 2: Transition/Animation 제거

**무엇을**: 컴포넌트 등장/사라질 때 애니메이션 (Fade, Grow, Slide 등)

**왜 불필요한가**:

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

**예시**:
```javascript
// ❌ 삭제 대상
<TransitionComponent
  in={open}
  timeout={transitionDuration}
  appear={!mounted.current}
>
  <DialogContent>{children}</DialogContent>
</TransitionComponent>

// ✅ 단순화 결과
{open && <div>{children}</div>}
```

---

# Commit 3-4: Component Props 제거

**무엇을**: 내부 컴포넌트를 교체할 수 있는 props

**왜 불필요한가**:

- **학습 목적**:
    - 고정된 컴포넌트로도 핵심 개념을 충분히 이해 가능
    - "어떻게 커스터마이징하나"가 아니라 "어떻게 동작하나"가 중요
- **복잡도**:
    - 각 Component prop마다 fallback 처리 필요
    - props 전달 로직 복잡 (어떤 props를 전달해야 하나?)
- **Slot 시스템과 중복**: Slot 시스템이 이미 같은 기능 제공 (deprecated)

**삭제 대상**:
- `*Component` 계열 props → 고정된 컴포넌트만 사용
- Component 선택 로직 (fallback 처리)

**예시**:
```javascript
// ❌ 삭제 대상
function Dialog({ BackdropComponent = DefaultBackdrop, PaperComponent = DefaultPaper }) {
  const Backdrop = BackdropComponent;
  const Paper = PaperComponent;
  return <Backdrop><Paper>{children}</Paper></Backdrop>;
}

// ✅ 단순화 결과
function Dialog() {
  return <Backdrop><Paper>{children}</Paper></Backdrop>;
}
```

---

# Commit 5-8: Layout/Style Props 제거

**무엇을**: 레이아웃과 크기를 조절하는 props (fullScreen, fullWidth, maxWidth, scroll 등)

**왜 불필요한가**:

- **학습 목적**:
    - 핵심은 "컴포넌트의 동작 원리"이지 "반응형 레이아웃"이 아님
    - 하나의 크기만 있어도 개념 이해 충분
- **복잡도**:
    - maxWidth 5가지 × fullWidth 2가지 × scroll 2가지 = 20가지 조합
    - 테마 breakpoint 시스템 의존 (theme.breakpoints.values.sm 등)
    - 각 조합마다 다른 스타일 필요 (variants 배열)
- **현실**: 대부분 기본값(sm, 600px) 사용

**삭제 대상**:
- 크기/레이아웃 관련 props → 고정값
- breakpoint 반응형 로직

**예시**:
```javascript
// ❌ 삭제 대상
function Dialog({ fullScreen = false, fullWidth = false, maxWidth = 'sm', scroll = 'paper' }) {
  const styles = {
    ...(fullScreen && { width: '100vw', height: '100vh' }),
    ...(fullWidth && { width: '100%' }),
    maxWidth: theme.breakpoints.values[maxWidth],
    overflow: scroll === 'paper' ? 'auto' : undefined,
  };
}

// ✅ 단순화 결과
function Dialog() {
  const styles = { maxWidth: 600, overflow: 'auto' };
}
```

---

# Commit 9: Event Props 제거

**무엇을**: 추가 이벤트 핸들러 props (onClick, onBackdropClick 등)

**왜 불필요한가**:

- **학습 목적**:
    - 이벤트 처리는 React의 기본 개념
    - 핵심 동작 이해에 불필요
    - `onClose` 하나로 충분 (ESC 키, backdrop 클릭 모두 처리)
- **복잡도**:
    - 이벤트 전파 처리 (stopPropagation 등)
    - `onBackdropClick`과 `onClose`의 차이점 설명 필요
- **중복성**:
    - `onBackdropClick` → `onClose`로 처리 가능
    - `onClick` → 전체 클릭은 거의 사용 안 함

**삭제 대상**:
- `onClick` prop
- `onBackdropClick` prop (backdrop 클릭은 onClose로 통합)
- 기타 세밀한 이벤트 핸들러

**예시**:
```javascript
// ❌ 삭제 대상
function Dialog({ onClose, onClick, onBackdropClick }) {
  const handleBackdropClick = (e) => {
    if (onBackdropClick) onBackdropClick(e);
    if (onClose) onClose(e, 'backdropClick');
  };
}

// ✅ 단순화 결과
function Dialog({ onClose }) {
  const handleBackdropClick = () => onClose?.();
}
```

---

# Commit 10-12: Theme 시스템 제거

**무엇을**: 라이브러리의 테마 통합 시스템

**왜 불필요한가**:

- **학습 목적**:
    - 테마 시스템은 라이브러리 전체의 주제로, 개별 컴포넌트 학습에는 과함
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

**예시**:
```javascript
// ❌ 삭제 대상
const theme = useTheme();
const props = useDefaultProps({ props: inProps, name: 'MuiDialog' });
const classes = useUtilityClasses(ownerState);
const style = { zIndex: theme.zIndex.modal };

// ✅ 단순화 결과
const style = { zIndex: 1300 };
```

---

# Commit 13-14: Style 시스템 제거

**무엇을**: 라이브러리의 스타일링 시스템 (styled, sx, ownerState 등)

**왜 불필요한가**:

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
- **의존성**: CSS-in-JS 라이브러리(emotion, styled-components 등) 제거

**삭제 대상**:
- `styled()` 함수 → 일반 div/span으로 변경
- `classes` prop 및 className 병합 → 단순 className만
- `sx` prop (CSS-in-JS) → 인라인 style
- `ownerState` → props 직접 사용
- `overridesResolver` → 제거
- `variants` → 조건문으로 대체

**예시**:
```javascript
// ❌ 삭제 대상
const DialogRoot = styled('div', {
  name: 'MuiDialog',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})(memoTheme(({ theme }) => ({
  zIndex: theme.zIndex.modal,
})));
return <DialogRoot className={classes.root} sx={sx} ownerState={ownerState} />;

// ✅ 단순화 결과
return <div style={{ zIndex: 1300 }}>{children}</div>;
```

---

# Commit 15: Context 제거

**무엇을**: React Context API로 하위 컴포넌트와 통신

**왜 불필요한가**:

- **학습 목적**:
    - Context는 React의 별도 주제 (prop drilling 해결)
    - 핵심 개념과 무관
    - 단순 구조에서는 props로 충분
- **복잡도**:
    - Context 생성 및 Provider 설정
    - Consumer/useContext 사용
    - 하위 컴포넌트 의존성
- **대안**:
    - 하위 컴포넌트를 제거하면 Context 불필요
    - 또는 직접 prop으로 ID 전달

**삭제 대상**:
- 컴포넌트 간 Context (예: DialogContext, ModalContext)
- Context Provider/Consumer 코드
- Context 관련 import

**예시**:
```javascript
// ❌ 삭제 대상
const DialogContext = React.createContext({});
function Dialog({ children }) {
  const id = useId();
  return (
    <DialogContext.Provider value={{ titleId: id }}>
      {children}
    </DialogContext.Provider>
  );
}
function DialogTitle() {
  const { titleId } = useContext(DialogContext);
  return <h2 id={titleId}>...</h2>;
}

// ✅ 단순화 결과
function Dialog({ children, 'aria-labelledby': ariaLabelledBy }) {
  return <div role="dialog" aria-labelledby={ariaLabelledBy}>{children}</div>;
}
```

---

> 공통 삭제 패턴(Disable/Enable Props, Ref 처리, 브라우저 호환성, Interval/Polling, 특수 케이스, 알고리즘, 유틸리티 함수, Deprecated Props, 메타데이터)은 `../format/common-patterns.md`를 참고하세요.
