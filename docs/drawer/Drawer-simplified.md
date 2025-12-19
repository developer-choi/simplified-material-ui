# Drawer 컴포넌트

> Drawer를 최소한의 구조로 단순화 - Modal의 얇은 래퍼

---

## 무슨 기능을 하는가?

수정된 Drawer는 **Modal을 감싸서 왼쪽에서 나타나는 고정된 서랍을 제공하는 단순한 래퍼**입니다.

### 핵심 기능 (남은 것)
1. **Modal 래핑** - Modal의 기능 그대로 사용
2. **왼쪽 고정** - 항상 왼쪽에서 나타남
3. **Paper 스타일** - 고정된 카드 디자인
4. **ARIA 속성** - role="dialog", aria-modal="true"

### 제거된 기능
1. ❌ Variant (persistent, permanent) - temporary만 유지
2. ❌ Anchor (right, top, bottom) - left만 유지
3. ❌ RTL 지원 (isHorizontal, getAnchor 함수)
4. ❌ Slide 애니메이션 - 즉시 표시/숨김
5. ❌ Slot 시스템 (slots, slotProps)
6. ❌ Props 커스터마이징 (elevation, hideBackdrop, ModalProps 등)
7. ❌ Deprecated Props (PaperProps, SlideProps, BackdropProps)
8. ❌ 테마 통합 (useDefaultProps, useTheme, memoTheme)
9. ❌ Styled 컴포넌트 - inline style로 대체
10. ❌ Utility classes (useUtilityClasses, composeClasses)
11. ❌ PropTypes - 타입 체크 없음

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Drawer/Drawer.js (50줄, 원본 453줄)

Drawer
  └─> Modal (inline style)
       └─> Paper (inline style)
            └─> children
```

### 2. 전체 코드 (50줄)

```javascript
'use client';
import * as React from 'react';
import Modal from '../Modal';
import Paper from '../Paper';

const Drawer = React.forwardRef(function Drawer(inProps, ref) {
  const {
    children,
    className,
    onClose,
    open = false,
    ...other
  } = inProps;

  return (
    <Modal
      ref={ref}
      className={className}
      open={open}
      onClose={onClose}
      style={{ zIndex: 1200 }}
      {...other}
    >
      <Paper
        elevation={16}
        square
        role="dialog"
        aria-modal="true"
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flex: '1 0 auto',
          zIndex: 1200,
          WebkitOverflowScrolling: 'touch',
          position: 'fixed',
          top: 0,
          left: 0,
          outline: 0,
        }}
      >
        {children}
      </Paper>
    </Modal>
  );
});

export default Drawer;
```

### 3. Props (4개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | false | 서랍 표시 여부 |
| `onClose` | function | - | 닫기 콜백 |
| `children` | node | - | 서랍 내용 |
| `className` | string | - | CSS 클래스 |

### 4. 고정된 스타일

**Modal**:
- `zIndex: 1200` (theme.zIndex.drawer의 기본값)

**Paper**:
- `elevation: 16` (고정)
- `position: fixed`
- `top: 0`
- `left: 0` (항상 왼쪽)
- `zIndex: 1200`
- `overflowY: auto`
- `display: flex`
- `flexDirection: column`
- `height: 100%`
- `outline: 0`

---

## 커밋 히스토리로 보는 단순화 과정

Drawer는 **22개의 커밋**을 통해 단순화되었습니다.

### Phase 1: Variant Props 제거 (커밋 1-3)

**1. permanent variant 삭제**
```javascript
// REMOVED (319-321줄):
if (variant === 'permanent') {
  return <DockedSlot {...dockedSlotProps}>{drawer}</DockedSlot>;
}
```
- permanent variant는 항상 표시되는 서랍
- 학습 목적에는 불필요한 복잡도

**2. persistent variant 삭제**
```javascript
// REMOVED (322-324줄):
if (variant === 'persistent') {
  return <DockedSlot {...dockedSlotProps}>{slidingDrawer}</DockedSlot>;
}
```
- persistent variant는 backdrop 없는 서랍
- temporary만으로 충분

**3. variant prop 삭제 (temporary 고정)**
```javascript
// ADDED:
const variant = 'temporary';

// REMOVED:
const DrawerDockedRoot = styled('div', {
  name: 'MuiDrawer',
  slot: 'Docked',
  // ...
})({
  flex: '0 0 auto',
});
```
- variant를 'temporary'로 고정
- DrawerDockedRoot styled 컴포넌트 제거
- useUtilityClasses에서 variant 관련 로직 제거
- PaperSlot additionalProps 단순화

### Phase 2: Anchor Props 제거 (커밋 4-6)

**4. top, bottom anchor 삭제**
```javascript
// REMOVED DrawerPaper variants:
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
}

// REMOVED from oppositeDirection:
top: 'down',
bottom: 'up',
```

**5. right anchor 삭제**
```javascript
// REMOVED DrawerPaper variant:
{
  props: { anchor: 'right' },
  style: { right: 0 },
}

// REMOVED from oppositeDirection:
right: 'left',
```

**6. anchor prop 삭제 (left 고정)**
```javascript
// ADDED:
const anchor = 'left';

// REMOVED:
anchor: anchorProp = 'left',
const anchorInvariant = getAnchor({ direction: isRtl ? 'rtl' : 'ltr' }, anchorProp);
const anchor = anchorProp;

// REMOVED functions:
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
};
```
- anchor를 'left'로 고정
- RTL 관련 함수 모두 제거
- useUtilityClasses, DrawerPaper overridesResolver 단순화
- Slide direction을 'right'로 고정

### Phase 3: RTL 지원 제거 (커밋 7)

**7. RTL 지원 제거**
```javascript
// REMOVED import:
import { useRtl } from '@mui/system/RtlProvider';

// REMOVED:
const isRtl = useRtl();
```
- anchor가 'left'로 고정되어 RTL 처리 불필요

### Phase 4: Transition 제거 (커밋 8-9)

**8. transitionDuration prop 삭제**
```javascript
// REMOVED:
transitionDuration = defaultTransitionDuration,
const defaultTransitionDuration = {
  enter: theme.transitions.duration.enteringScreen,
  exit: theme.transitions.duration.leavingScreen,
};

// CHANGED in TransitionSlot:
timeout: transitionDuration,  // → timeout: 225,
```
- transitionDuration을 225ms로 고정
- defaultTransitionDuration 계산 제거

**9. Slide transition 삭제**
```javascript
// REMOVED import:
import Slide from '../Slide';

// REMOVED props:
SlideProps,
TransitionComponent,

// REMOVED:
const mounted = React.useRef(false);
React.useEffect(() => {
  mounted.current = true;
}, []);

const [TransitionSlot, transitionSlotProps] = useSlot('transition', {
  elementType: Slide,
  ownerState,
  externalForwardedProps,
  additionalProps: {
    in: open,
    direction: 'right',
    timeout: 225,
    appear: mounted.current,
  },
});

const slidingDrawer = <TransitionSlot {...transitionSlotProps}>{drawer}</TransitionSlot>;

// CHANGED to:
const drawer = <PaperSlot {...paperSlotProps}>{children}</PaperSlot>;
return <RootSlot {...rootSlotProps}>{drawer}</RootSlot>;
```
- Slide 애니메이션 완전 제거
- mounted ref 제거
- drawer 직접 렌더링

### Phase 5: Deprecated Props 제거 (커밋 10)

**10. deprecated PaperProps, SlideProps, BackdropProps 삭제**
```javascript
// REMOVED props:
BackdropProps,
PaperProps = {},

// REMOVED from externalForwardedProps.slotProps:
paper: PaperProps,

// CHANGED:
backdrop: slotProps.backdrop || { ...BackdropProps, ...BackdropPropsProp },
// → backdrop: slotProps.backdrop || BackdropPropsProp,

// REMOVED from PaperSlot className:
className: clsx(classes.paper, PaperProps.className),
// → className: classes.paper,
```

### Phase 6: Slot 시스템 제거 (커밋 11)

**11. Slot 시스템 삭제**
```javascript
// REMOVED imports:
import useSlot from '../utils/useSlot';
import { mergeSlotProps } from '../utils';

// REMOVED props:
slots = {},
slotProps = {},

// REMOVED:
const externalForwardedProps = {
  slots: {
    transition: TransitionComponent,
    ...slots,
  },
  slotProps: {
    paper: PaperProps,
    transition: SlideProps,
    ...slotProps,
    backdrop: slotProps.backdrop || BackdropPropsProp,
  },
};

const [RootSlot, rootSlotProps] = useSlot('root', { ... });
const [PaperSlot, paperSlotProps] = useSlot('paper', { ... });

// CHANGED to direct JSX:
return (
  <DrawerRoot
    ref={ref}
    className={clsx(classes.root, classes.modal, className)}
    ownerState={ownerState}
    open={open}
    onClose={onClose}
    hideBackdrop={hideBackdrop}
    slotProps={{ backdrop: BackdropPropsProp }}
    {...other}
    {...ModalProps}
  >
    <DrawerPaper
      className={classes.paper}
      ownerState={ownerState}
      elevation={elevation}
      square
      role="dialog"
      aria-modal="true"
    >
      {children}
    </DrawerPaper>
  </DrawerRoot>
);
```
- useSlot 호출을 직접 JSX로 변경
- 가독성 대폭 향상

### Phase 7: Props 단순화 (커밋 12-14)

**12. elevation prop 삭제 (16 고정)**
```javascript
// REMOVED prop:
elevation = 16,

// REMOVED from ownerState:
elevation,

// CHANGED in DrawerPaper:
elevation={elevation}  // → elevation={16}
```

**13. hideBackdrop prop 삭제**
```javascript
// REMOVED prop:
hideBackdrop = false,

// REMOVED from DrawerRoot:
hideBackdrop={hideBackdrop}
```
- Modal의 기본값(false) 사용

**14. ModalProps prop 삭제**
```javascript
// REMOVED prop:
ModalProps: { BackdropProps: BackdropPropsProp, ...ModalProps } = {},

// REMOVED from DrawerRoot:
slotProps={{ backdrop: BackdropPropsProp }}
{...ModalProps}
```

### Phase 8: 테마 시스템 제거 (커밋 15-17)

**15. useDefaultProps 삭제**
```javascript
// REMOVED import:
import { useDefaultProps } from '../DefaultPropsProvider';

// REMOVED:
const props = useDefaultProps({ props: inProps, name: 'MuiDrawer' });

// CHANGED to:
const { children, className, onClose, open = false, ...other } = inProps;
const ownerState = { ...inProps, anchor, open, variant, ...other };
```

**16. useUtilityClasses, composeClasses 삭제**
```javascript
// REMOVED imports:
import composeClasses from '@mui/utils/composeClasses';
import capitalize from '../utils/capitalize';
import { getDrawerUtilityClass } from './drawerClasses';

// REMOVED:
const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;
  const slots = {
    root: ['root', 'anchorLeft'],
    modal: ['modal'],
    paper: ['paper', 'paperAnchorLeft'],
  };
  return composeClasses(slots, getDrawerUtilityClass, classes);
};

const classes = useUtilityClasses(ownerState);

// CHANGED in DrawerRoot:
className={clsx(classes.root, classes.modal, className)}
// → className={className}
```

**17. useTheme, memoTheme 삭제**
```javascript
// REMOVED imports:
import { styled, useTheme } from '../zero-styled';
import memoTheme from '../utils/memoTheme';

// REMOVED:
const theme = useTheme();

// CHANGED DrawerRoot:
const DrawerRoot = styled(Modal, {
  name: 'MuiDrawer',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    zIndex: (theme.vars || theme).zIndex.drawer,
  })),
);
// →
const DrawerRoot = styled(Modal, {
  name: 'MuiDrawer',
  slot: 'Root',
  overridesResolver,
})({
  zIndex: 1200,
});

// CHANGED DrawerPaper:
memoTheme(({ theme }) => ({
  zIndex: (theme.vars || theme).zIndex.drawer,
  // ...
}))
// →
{
  zIndex: 1200,
  // ...
}
```
- theme.zIndex.drawer를 1200으로 하드코딩

### Phase 9: Styled 제거 (커밋 18)

**18. styled 함수 제거**
```javascript
// REMOVED imports:
import { styled } from '../zero-styled';
import rootShouldForwardProp from '../styles/rootShouldForwardProp';

// REMOVED:
const overridesResolver = (props, styles) => {
  return [
    styles.root,
    styles.modal,
  ];
};

const DrawerRoot = styled(Modal, {
  name: 'MuiDrawer',
  slot: 'Root',
  overridesResolver,
})({
  zIndex: 1200,
});

const DrawerPaper = styled(Paper, {
  name: 'MuiDrawer',
  slot: 'Paper',
  overridesResolver: (props, styles) => {
    return [
      styles.paper,
      styles.paperAnchorLeft,
    ];
  },
})({
  overflowY: 'auto',
  display: 'flex',
  // ...
  left: 0,
  outline: 0,
});

// CHANGED to direct components with inline styles:
return (
  <Modal
    ref={ref}
    className={className}
    open={open}
    onClose={onClose}
    style={{ zIndex: 1200 }}
    {...other}
  >
    <Paper
      elevation={16}
      square
      role="dialog"
      aria-modal="true"
      style={{
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: '1 0 auto',
        zIndex: 1200,
        WebkitOverflowScrolling: 'touch',
        position: 'fixed',
        top: 0,
        left: 0,
        outline: 0,
      }}
    >
      {children}
    </Paper>
  </Modal>
);
```
- styled 컴포넌트를 inline style로 완전히 변환
- 가장 큰 코드 감소 (51줄 제거)

### Phase 10: 메타데이터 제거 (커밋 19-21)

**19. classes, sx, ownerState 삭제**
```javascript
// REMOVED import:
import clsx from 'clsx';

// REMOVED:
const variant = 'temporary';
const anchor = 'left';

const ownerState = {
  ...inProps,
  anchor,
  open,
  variant,
  ...other,
};
```
- ownerState 객체 제거
- 더 이상 필요 없는 메타데이터 정리

**20. Drawer 구현 단순화**
```javascript
// REMOVED JSDoc comment:
/**
 * The props of the [Modal](/material-ui/api/modal/) component are available
 * when `variant="temporary"` is set.
 */
```
- 불필요한 주석 제거
- 공백 정리

**21. PropTypes 삭제**
```javascript
// REMOVED imports:
import PropTypes from 'prop-types';
import integerPropType from '@mui/utils/integerPropType';

// REMOVED (117줄):
Drawer.propTypes = {
  anchor: PropTypes.oneOf(['bottom', 'left', 'right', 'top']),
  BackdropProps: PropTypes.object,
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  elevation: integerPropType,
  hideBackdrop: PropTypes.bool,
  ModalProps: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  PaperProps: PropTypes.object,
  SlideProps: PropTypes.object,
  slotProps: PropTypes.shape({ ... }),
  slots: PropTypes.shape({ ... }),
  sx: PropTypes.oneOfType([ ... ]),
  transitionDuration: PropTypes.oneOfType([ ... ]),
  variant: PropTypes.oneOf(['permanent', 'persistent', 'temporary']),
};
```
- PropTypes 정의 전체 삭제 (117줄)
- 가장 많은 코드가 제거된 단계

**22. 불필요한 import 정리**
- 모든 import가 사용 중임을 확인
- 최종 검증

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 453줄 | 50줄 (89% 감소) |
| **Props 개수** | 14개 | 4개 |
| **variant** | temporary/persistent/permanent | temporary (고정) |
| **anchor** | left/right/top/bottom | left (고정) |
| **RTL 지원** | ✅ | ❌ |
| **Transition** | ✅ Slide | ❌ (즉시 표시) |
| **Slot 시스템** | ✅ 5개 슬롯 | ❌ |
| **테마 통합** | ✅ | ❌ |
| **Styled 컴포넌트** | ✅ 3개 | ❌ (inline style) |
| **Utility Classes** | ✅ | ❌ |
| **PropTypes** | ✅ 117줄 | ❌ |
| **elevation** | 0~24 커스터마이징 | 16 (고정) |
| **hideBackdrop** | ✅ | ❌ (항상 표시) |
| **ModalProps** | ✅ | ❌ |

---

## 스타일 비교

### 원본 (Styled + 테마)
```javascript
const DrawerPaper = styled(Paper, {
  name: 'MuiDrawer',
  slot: 'Paper',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.paper,
      styles[`paperAnchor${capitalize(ownerState.anchor)}`],
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
      {
        props: { anchor: 'left' },
        style: { left: 0 },
      },
      // ... 4가지 anchor별 스타일
    ],
  })),
);
```

### 수정본 (Inline Style)
```javascript
<Paper
  style={{
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: '1 0 auto',
    zIndex: 1200,  // 하드코딩
    WebkitOverflowScrolling: 'touch',
    position: 'fixed',
    top: 0,
    left: 0,  // 하드코딩
    outline: 0,
  }}
>
```

---

## 설계 철학의 변화

### 원본: "모든 사용 사례 지원"
- 3가지 variant (temporary, persistent, permanent)
- 4가지 anchor (left, right, top, bottom)
- RTL 언어 지원
- Slide 애니메이션
- Slot 시스템으로 모든 부분 커스터마이징
- 테마 시스템 통합
- PropTypes로 타입 검증

### 수정본: "최소한의 서랍"
- variant: temporary 고정
- anchor: left 고정
- RTL 없음
- 애니메이션 없음 (즉시 표시)
- Slot 없음
- 테마 없음 (하드코딩)
- PropTypes 없음
- **Modal과 Paper의 얇은 래퍼**

---

## 사용 예시

```javascript
import Drawer from './Drawer';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Drawer</button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
      >
        <List>
          <ListItem button>메뉴 1</ListItem>
          <ListItem button>메뉴 2</ListItem>
          <ListItem button>메뉴 3</ListItem>
        </List>
      </Drawer>
    </>
  );
}
```

---

## 제한 사항

1. **방향 고정** - 항상 왼쪽에서만 나타남
2. **Variant 고정** - temporary만 지원 (persistent, permanent 불가)
3. **애니메이션 없음** - 즉시 표시/숨김
4. **RTL 미지원** - Right-to-Left 언어 지원 안 됨
5. **커스터마이징 불가** - elevation, hideBackdrop 등 변경 불가
6. **Slot 없음** - 내부 컴포넌트 교체 불가
7. **테마 없음** - zIndex 등이 하드코딩
8. **PropTypes 없음** - 런타임 타입 검증 안 됨

---

## 장단점

### 장점
- ✅ 극도로 단순함 (50줄)
- ✅ Modal의 모든 기능 사용 가능
- ✅ ARIA 속성 자동 처리
- ✅ 학습 곡선 거의 없음
- ✅ 코드 이해하기 쉬움

### 단점
- ❌ 커스터마이징 불가
- ❌ 왼쪽에서만 나타남
- ❌ persistent, permanent variant 미지원
- ❌ 애니메이션 없음
- ❌ 프로덕션 부적합

---

## 코드 감소율

| 단계 | 커밋 | 라인 수 | 감소율 |
|------|------|---------|--------|
| 원본 | - | 453줄 | - |
| Variant 제거 | 1-3 | ~430줄 | 5% |
| Anchor 제거 | 4-6 | ~400줄 | 12% |
| RTL 제거 | 7 | ~395줄 | 13% |
| Transition 제거 | 8-9 | ~365줄 | 19% |
| Props 제거 | 10-14 | ~330줄 | 27% |
| 테마 제거 | 15-17 | ~280줄 | 38% |
| Styled 제거 | 18 | ~230줄 | 49% |
| 메타데이터 제거 | 19-21 | ~170줄 | 62% |
| PropTypes 제거 | 21 | **50줄** | **89%** |

---

*분석 일자: 2025-12-19*
*브랜치: fix/drawer*
*파일: packages/mui-material/src/Drawer/Drawer.js*
*커밋 수: 22개*
*코드 감소: 403줄 (-89%)*
*최종 라인: 50줄*
