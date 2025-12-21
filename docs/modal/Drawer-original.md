# Drawer 컴포넌트

> Material-UI의 Drawer 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Drawer는 **Modal을 감싸서 서랍(drawer) UI를 제공하는 고수준 컴포넌트**입니다.

### 핵심 기능
1. **Modal 기반** - Modal의 모든 기능 상속
2. **3가지 Variant** - temporary, persistent, permanent
3. **4가지 Anchor** - left, right, top, bottom (서랍이 나타나는 방향)
4. **Slide 애니메이션** - 부드러운 슬라이드 효과
5. **RTL 지원** - Right-to-Left 언어 지원
6. **Paper 스타일** - Material Design의 "종이" 메타포 구현
7. **Slot 시스템** - root, paper, backdrop, transition 등 커스터마이징
8. **테마 통합** - zIndex, transitions 등 테마 시스템과 연동

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Drawer/Drawer.js (453줄)

Drawer (고수준 API)
  └─> DrawerRoot (= styled(Modal))
       ├─> TransitionSlot (= Slide)
       │    └─> DockedSlot (variant: permanent/persistent)
       │         └─> DrawerPaper
       │              └─> children
       └─> TransitionSlot (variant: temporary)
            └─> DrawerPaper
                 └─> children
```

### 2. Styled Components

**DrawerRoot = styled(Modal)** (42-50줄):
```javascript
const DrawerRoot = styled(Modal, {
  name: 'MuiDrawer',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    zIndex: (theme.vars || theme).zIndex.drawer,
  })),
);
```

**DrawerDockedRoot** (57-65줄) - permanent/persistent variant용:
```javascript
const DrawerDockedRoot = styled('div', {
  name: 'MuiDrawer',
  slot: 'Docked',
  skipVariantsResolver: false,
  overridesResolver: (props, styles) => styles.docked,
})({
  flex: '0 0 auto',
});
```

**DrawerPaper** (67-206줄):
```javascript
const DrawerPaper = styled(Paper, {
  name: 'MuiDrawer',
  slot: 'Paper',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.paper,
      styles[`paperAnchor${capitalize(ownerState.anchor)}`],
      ownerState.variant !== 'temporary' && styles[`paperAnchorDocked${capitalize(ownerState.anchor)}`],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: '1 0 auto',
    zIndex: (theme.vars || theme).zIndex.drawer,
    WebkitOverflowScrolling: 'touch',
    position: 'fixed',
    top: 0,
    outline: 0,
    variants: [
      // anchor: left
      {
        props: { anchor: 'left' },
        style: { left: 0 },
      },
      // anchor: top
      {
        props: { anchor: 'top' },
        style: {
          top: 0,
          left: 0,
          right: 0,
          height: 'auto',
          maxHeight: '100%',
        },
      },
      // anchor: right
      {
        props: { anchor: 'right' },
        style: { right: 0 },
      },
      // anchor: bottom
      {
        props: { anchor: 'bottom' },
        style: {
          top: 'auto',
          left: 0,
          bottom: 0,
          right: 0,
          height: 'auto',
          maxHeight: '100%',
        },
      },
      // variant: permanent
      {
        props: { variant: 'permanent' },
        style: {
          position: 'relative',
        },
      },
      // variant: persistent (docked)
      {
        props: ({ ownerState }) =>
          ownerState.variant === 'persistent' && ownerState.anchor === 'left',
        style: {
          borderRight: `1px solid ${(theme.vars || theme).palette.divider}`,
        },
      },
      // ... 각 anchor 방향별 border 스타일
    ],
  })),
);
```

### 3. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `variant` | 'permanent'\\|'persistent'\\|'temporary' | 'temporary' | 서랍 동작 방식 |
| `anchor` | 'left'\\|'right'\\|'top'\\|'bottom' | 'left' | 서랍이 나타나는 방향 |
| `open` | boolean | **required** | 서랍 표시 여부 |
| `onClose` | function | - | 닫기 콜백 |
| `children` | node | - | 서랍 내용 |
| `elevation` | number | 16 | Paper의 그림자 깊이 |
| `hideBackdrop` | boolean | false | Backdrop 숨김 여부 |
| `ModalProps` | object | {} | Modal에 전달할 props |
| `PaperProps` | object | {} | Paper에 전달할 props (deprecated) |
| `SlideProps` | object | - | Slide에 전달할 props (deprecated) |
| `TransitionComponent` | elementType | Slide | 애니메이션 컴포넌트 |
| `transitionDuration` | number\\|object | theme.transitions.duration | 애니메이션 지속 시간 |
| `slots` | object | {} | 슬롯 컴포넌트 커스터마이징 |
| `slotProps` | object | {} | 슬롯 props 커스터마이징 |

### 4. Variant 종류

**temporary** (기본값):
- Backdrop 있음
- 클릭하면 닫힘
- Slide 애니메이션
- 모바일에 적합

**persistent**:
- Backdrop 없음
- 외부 클릭해도 안 닫힘
- 명시적으로 닫아야 함
- 데스크톱에 적합

**permanent**:
- 항상 표시
- 닫을 수 없음
- position: relative (문서 흐름 안에 포함)
- 데스크톱 레이아웃에 적합

### 5. RTL 지원

```javascript
export function isHorizontal(anchor) {
  return ['left', 'right'].includes(anchor);
}

export function getAnchor({ direction }, anchor) {
  return direction === 'rtl' && isHorizontal(anchor)
    ? oppositeDirection[anchor]
    : anchor;
}

const oppositeDirection = {
  left: 'right',
  right: 'left',
  top: 'down',
  bottom: 'up',
};
```

RTL 모드에서는:
- `anchor="left"` → 오른쪽에서 나타남
- `anchor="right"` → 왼쪽에서 나타남

### 6. Slide Transition

```javascript
const [TransitionSlot, transitionSlotProps] = useSlot('transition', {
  elementType: Slide,
  ownerState,
  externalForwardedProps,
  additionalProps: {
    in: open,
    direction: oppositeDirection[anchorInvariant],
    timeout: transitionDuration,
    appear: mounted.current,
  },
});
```

**슬라이드 방향**:
- anchor='left' → direction='right' (왼쪽에서 나옴)
- anchor='right' → direction='left' (오른쪽에서 나옴)
- anchor='top' → direction='down' (위에서 나옴)
- anchor='bottom' → direction='up' (아래에서 나옴)

### 7. Slot 시스템

Drawer는 5개의 슬롯을 제공합니다:

```javascript
<Drawer
  slots={{
    root: CustomModal,
    backdrop: CustomBackdrop,
    docked: CustomDocked,
    paper: CustomPaper,
    transition: CustomTransition,
  }}
  slotProps={{
    paper: { elevation: 8 },
    backdrop: { timeout: 1000 },
  }}
>
```

### 8. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, anchor, variant } = ownerState;

  const slots = {
    root: ['root', `anchor${capitalize(anchor)}`],
    docked: [variant !== 'temporary' && 'docked'],
    modal: ['modal'],
    paper: [
      'paper',
      `paperAnchor${capitalize(anchor)}`,
      variant !== 'temporary' && `paperAnchorDocked${capitalize(anchor)}`,
    ],
  };

  return composeClasses(slots, getDrawerUtilityClass, classes);
};
```

**생성되는 클래스 예시** (variant='temporary', anchor='left'):
- `.MuiDrawer-root`
- `.MuiDrawer-anchorLeft`
- `.MuiDrawer-modal`
- `.MuiDrawer-paper`
- `.MuiDrawer-paperAnchorLeft`

### 9. 렌더링 구조 (variant별 분기)

```javascript
const drawer = <PaperSlot {...paperSlotProps}>{children}</PaperSlot>;

const slidingDrawer = <TransitionSlot {...transitionSlotProps}>{drawer}</TransitionSlot>;

// variant === permanent
if (variant === 'permanent') {
  return <DockedSlot {...dockedSlotProps}>{drawer}</DockedSlot>;
}

// variant === persistent
if (variant === 'persistent') {
  return <DockedSlot {...dockedSlotProps}>{slidingDrawer}</DockedSlot>;
}

// variant === temporary
return <RootSlot {...rootSlotProps}>{slidingDrawer}</RootSlot>;
```

---

## 설계 패턴

### 1. Composition Pattern
Drawer = Modal + Paper + Slide + Docked

각 계층은 독립적이며, 필요시 교체 가능합니다.

### 2. Slot Pattern
모든 내부 컴포넌트를 슬롯으로 노출하여 커스터마이징 가능

### 3. Variant Pattern
3가지 variant로 다양한 사용 사례 지원

### 4. RTL Pattern
Right-to-Left 언어 자동 대응

---

## 복잡도의 이유

Drawer는 **453줄**이며, 복잡한 이유는:

1. **3가지 Variant** - temporary, persistent, permanent 각각 다른 렌더링 로직
2. **4가지 Anchor** - left, right, top, bottom 각각 다른 스타일
3. **RTL 지원** - isHorizontal, getAnchor, oppositeDirection 함수
4. **Slot 시스템** - 5개 슬롯 관리 (root, docked, paper, backdrop, transition)
5. **Transition 통합** - Slide 애니메이션 + mounted ref 처리
6. **테마 통합** - zIndex, transitions, palette 등
7. **Backward Compatibility** - PaperProps, SlideProps 등 deprecated props 지원
8. **PropTypes** - 약 170줄
