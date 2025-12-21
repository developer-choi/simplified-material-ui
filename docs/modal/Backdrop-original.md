# Backdrop 컴포넌트

> Material-UI의 Backdrop 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Backdrop은 **Modal이나 Dialog가 열렸을 때 나타나는 반투명한 어두운 배경 오버레이** 컴포넌트입니다.

### 핵심 기능
1. **화면 전체 오버레이** - position: fixed로 뷰포트 전체를 덮는 레이어 생성
2. **반투명 배경** - rgba(0, 0, 0, 0.5)로 아래 콘텐츠가 약간 보이는 효과
3. **중앙 정렬 컨테이너** - Flexbox로 children을 화면 중앙에 배치
4. **Fade 애니메이션** - 부드럽게 나타나고 사라지는 전환 효과

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Backdrop/Backdrop.js (209줄)
Backdrop
  └─> TransitionSlot (Fade)
       └─> RootSlot (BackdropRoot)
            └─> children
```

### 2. Styled Component (BackdropRoot)

```javascript
const BackdropRoot = styled('div', {
  name: 'MuiBackdrop',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [styles.root, ownerState.invisible && styles.invisible];
  },
})({
  position: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  WebkitTapHighlightColor: 'transparent',
  variants: [
    {
      props: { invisible: true },
      style: {
        backgroundColor: 'transparent',
      },
    },
  ],
});
```

**역할**:
- `position: fixed` + 4방향 0으로 화면 전체 차지
- Flexbox로 children 중앙 정렬
- `invisible` prop에 따라 배경색 조건부 적용 (variants)

### 3. Slot 시스템

```javascript
const backwardCompatibleSlots = {
  transition: TransitionComponentProp,
  root: components.Root,
  ...slots,
};
const backwardCompatibleSlotProps = { ...componentsProps, ...slotProps };

const [RootSlot, rootProps] = useSlot('root', {
  elementType: BackdropRoot,
  externalForwardedProps,
  className: clsx(classes.root, className),
  ownerState,
});

const [TransitionSlot, transitionProps] = useSlot('transition', {
  elementType: Fade,
  externalForwardedProps,
  ownerState,
});
```

**역할**:
- `root` slot: BackdropRoot를 사용자가 교체 가능
- `transition` slot: Fade를 사용자가 교체 가능
- deprecated props(`components`, `componentsProps`)와 새 API(`slots`, `slotProps`) 병합

### 4. Transition 통합

```javascript
<TransitionSlot in={open} timeout={transitionDuration} {...other} {...transitionProps}>
  <RootSlot aria-hidden {...rootProps} classes={classes} ref={ref}>
    {children}
  </RootSlot>
</TransitionSlot>
```

**역할**:
- `TransitionSlot`(기본: Fade)으로 부드러운 등장/사라짐 효과
- `open` prop을 `in`으로 전달
- `transitionDuration`으로 애니메이션 속도 제어

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | Backdrop 표시 여부 |
| `children` | ReactNode | - | 중앙에 표시할 내용 |
| `invisible` | boolean | `false` | 배경을 투명하게 만들기 |
| `component` | elementType | `'div'` | Root 요소의 HTML 태그 |
| `TransitionComponent` | elementType | `Fade` | 애니메이션 컴포넌트 |
| `transitionDuration` | number \| object | - | 애니메이션 지속 시간 |
| `slots` | object | `{}` | 커스텀 컴포넌트 (root, transition) |
| `slotProps` | object | `{}` | slot별 추가 props |
| `components` | object | `{}` | *deprecated* 커스텀 컴포넌트 |
| `componentsProps` | object | `{}` | *deprecated* 컴포넌트별 props |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `sx` | object | - | Theme-aware 스타일 |

### 6. Theme 시스템 통합

```javascript
// 1. 테마에서 기본 props 병합
const props = useDefaultProps({ props: inProps, name: 'MuiBackdrop' });

// 2. 클래스 이름 생성
const classes = useUtilityClasses(ownerState);
// → { root: 'MuiBackdrop-root MuiBackdrop-invisible' }

// 3. styled()의 overridesResolver로 테마 스타일 적용
overridesResolver: (props, styles) => {
  const { ownerState } = props;
  return [styles.root, ownerState.invisible && styles.invisible];
}
```

**역할**:
- Theme Provider에서 컴포넌트별 기본 props 주입
- 클래스 이름으로 테마 스타일 적용 가능
- `sx` prop으로 인라인 테마 스타일 적용

---

## 설계 패턴

1. **Composition Pattern**
   - Backdrop은 직접 렌더링하지 않고 Transition + Root를 조합
   - `children`을 중앙에 배치하는 컨테이너 역할만 담당

2. **Slot Pattern**
   - `useSlot()` 훅으로 하위 컴포넌트를 동적으로 교체 가능
   - `root`, `transition` 두 개의 slot 제공
   - 하위 호환성: deprecated API(`components`)와 새 API(`slots`) 모두 지원

3. **Compound Component Pattern**
   - `styled()` 함수로 스타일과 로직 분리
   - `BackdropRoot`는 독립적인 styled component
   - `ownerState`로 props를 스타일에 주입

4. **Render Props Pattern**
   - `useSlot()`이 `[Component, props]` 튜플 반환
   - props 병합 로직을 훅 내부에 캡슐화

---

## 복잡도의 이유

Backdrop은 **209줄**이며, 복잡한 이유는:

1. **Slot 시스템** (약 30줄)
   - `useSlot()` 훅 2번 호출 (root, transition)
   - deprecated API와 새 API 병합 로직
   - `externalForwardedProps` 객체 생성 및 전달

2. **Theme 통합** (약 20줄)
   - `useDefaultProps()`: 테마에서 기본 props 가져오기
   - `useUtilityClasses()`: 클래스 이름 생성 함수
   - `composeClasses()`: 여러 클래스 병합
   - `ownerState`: props를 스타일에 전달하는 중간 객체

3. **Styled 시스템** (약 25줄)
   - `styled()` 함수로 BackdropRoot 생성
   - `overridesResolver`: 테마 오버라이드 지원
   - `variants`: `invisible` prop에 따른 조건부 스타일

4. **Transition 통합** (약 10줄)
   - Fade 컴포넌트로 감싸기
   - `TransitionComponent` prop으로 교체 가능
   - `transitionDuration` 전달

5. **PropTypes** (약 100줄)
   - 런타임 타입 검증
   - JSDoc 주석으로 상세한 설명
   - 실제 로직(50줄)보다 PropTypes가 더 많음

6. **하위 호환성** (약 15줄)
   - `components`, `componentsProps` (deprecated)
   - `slots`, `slotProps` (새 API)
   - 두 API를 병합하는 `backwardCompatibleSlots` 로직

---

## 비교: Backdrop vs ModalBackdrop

Material-UI에는 Modal 컴포넌트 내부에 `ModalBackdrop`이라는 간단한 backdrop도 있습니다.

| 기능 | Backdrop | ModalBackdrop (Modal 내부) |
|------|---------|----------------------------|
| **코드 라인** | 209줄 | 약 20줄 |
| **독립 사용** | ✅ 가능 | ❌ Modal 내부용 |
| **Transition** | ✅ Fade 애니메이션 | ❌ 즉시 표시 |
| **Slot 시스템** | ✅ | ❌ |
| **Theme 통합** | ✅ | ❌ |
| **커스터마이징** | ✅ 광범위 (12+ props) | ❌ 최소 (style만) |
| **사용 사례** | 독립적으로 사용 가능한 범용 Backdrop | Modal의 내부 구현용 |

**ModalBackdrop 예시**:
```javascript
// packages/mui-material/src/Modal/Modal.js
const ModalBackdrop = React.forwardRef(function ModalBackdrop(props, ref) {
  const { style, ...other } = props;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      {...other}
      style={{
        zIndex: -1,
        position: 'fixed',
        right: 0,
        bottom: 0,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    />
  );
});
```

**핵심 차이**:
- `Backdrop`은 공용 컴포넌트로 설계되어 확장성/커스터마이징 중시
- `ModalBackdrop`은 Modal 내부에서만 사용하는 간단한 구현
