# Menu 컴포넌트

> Material-UI의 Menu 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Menu는 **버튼이나 다른 요소를 클릭했을 때 나타나는 메뉴 목록 오버레이** 컴포넌트입니다.

### 핵심 기능
1. **Anchor 기반 위치 결정** - anchorEl 요소를 기준으로 메뉴 위치 자동 계산
2. **메뉴 항목 목록** - MenuList + MenuItem으로 선택 가능한 항목들 표시
3. **키보드 내비게이션** - 화살표 키로 항목 이동, Tab 키로 메뉴 닫기
4. **자동 포커스** - 메뉴 열릴 때 선택된 항목 또는 첫 번째 항목에 포커스
5. **Popover 기반** - Popover를 래핑하여 오버레이, 위치 결정, 애니메이션 제공

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Menu/Menu.js (383줄)
Menu
  └─> MenuRoot (Popover)
       └─> PaperSlot (MenuPaper)
            └─> ListSlot (MenuMenuList)
                 └─> children (MenuItem들)
```

### 2. Styled Components

#### MenuRoot (Popover 래퍼)
```javascript
const MenuRoot = styled(Popover, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiMenu',
  slot: 'Root',
})({});
```

**역할**:
- Popover를 감싸서 테마 시스템과 통합
- `classes` prop이 Popover에 전달되도록 허용
- 스타일 오버라이드를 위한 슬롯 시스템

#### MenuPaper (PopoverPaper 래퍼)
```javascript
export const MenuPaper = styled(PopoverPaper, {
  name: 'MuiMenu',
  slot: 'Paper',
})({
  maxHeight: 'calc(100% - 96px)',
  WebkitOverflowScrolling: 'touch',
});
```

**역할**:
- 메뉴 높이를 화면 높이보다 96px 작게 제한 (Material Design 스펙)
- iOS에서 momentum 스크롤링 활성화

#### MenuMenuList (MenuList 래퍼)
```javascript
const MenuMenuList = styled(MenuList, {
  name: 'MuiMenu',
  slot: 'List',
})({
  outline: 0,
});
```

**역할**:
- 포커스 아웃라인 제거 (키보드 내비게이션 시 시각적 중복 방지)

### 3. RTL (Right-to-Left) 지원

```javascript
const RTL_ORIGIN = {
  vertical: 'top',
  horizontal: 'right',
};

const LTR_ORIGIN = {
  vertical: 'top',
  horizontal: 'left',
};

const isRtl = useRtl();

<MenuRoot
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: isRtl ? 'right' : 'left',
  }}
  transformOrigin={isRtl ? RTL_ORIGIN : LTR_ORIGIN}
/>
```

**역할**:
- 아랍어, 히브리어 등 RTL 언어에서 메뉴가 오른쪽에서 열림
- `useRtl()` 훅으로 현재 텍스트 방향 감지
- anchorOrigin, transformOrigin을 조건부로 변경

### 4. activeItemIndex 계산 (variant 기반)

```javascript
let activeItemIndex = -1;
React.Children.map(children, (child, index) => {
  if (!React.isValidElement(child)) {
    return;
  }

  if (!child.props.disabled) {
    if (variant === 'selectedMenu' && child.props.selected) {
      activeItemIndex = index;
    } else if (activeItemIndex === -1) {
      activeItemIndex = index;
    }
  }
});
```

**역할**:
- `variant='selectedMenu'`: 선택된(selected) MenuItem에 포커스
- `variant='menu'`: 첫 번째 유효한 MenuItem에 포커스
- disabled 항목은 건너뜀
- Fragment 사용 시 경고 출력

### 5. Slot 시스템

```javascript
const externalForwardedProps = {
  slots,
  slotProps: {
    list: MenuListProps,
    transition: TransitionProps,
    paper: PaperProps,
    ...slotProps,
  },
};

const [PaperSlot, paperSlotProps] = useSlot('paper', {
  className: classes.paper,
  elementType: MenuPaper,
  externalForwardedProps,
  shouldForwardComponentProp: true,
  ownerState,
});

const [ListSlot, listSlotProps] = useSlot('list', {
  className: clsx(classes.list, MenuListProps.className),
  elementType: MenuMenuList,
  shouldForwardComponentProp: true,
  externalForwardedProps,
  getSlotProps: (handlers) => ({
    ...handlers,
    onKeyDown: (event) => {
      handleListKeyDown(event);
      handlers.onKeyDown?.(event);
    },
  }),
  ownerState,
});
```

**역할**:
- `paper`, `list` 슬롯을 사용자가 교체 가능
- deprecated props (`MenuListProps`, `PaperProps`)와 새 API (`slotProps`) 병합
- `useSlot()` 훅이 props 병합 및 컴포넌트 결정

### 6. Transition 통합

```javascript
const handleEntering = (element, isAppearing) => {
  if (menuListActionsRef.current) {
    menuListActionsRef.current.adjustStyleForScrollbar(element, {
      direction: isRtl ? 'rtl' : 'ltr',
    });
  }

  if (onEntering) {
    onEntering(element, isAppearing);
  }
};

<MenuRoot
  transitionDuration={transitionDuration}
  slotProps={{
    transition: {
      ...resolvedTransitionProps,
      onEntering: (...args) => {
        handleEntering(...args);
        resolvedTransitionProps?.onEntering?.(...args);
      },
    },
  }}
/>
```

**역할**:
- `transitionDuration` prop으로 애니메이션 속도 제어
- `onEntering` 콜백에서 스크롤바 스타일 조정
- `menuListActionsRef`로 MenuList의 `adjustStyleForScrollbar` 메서드 호출

### 7. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `anchorEl` | Element \| func | - | 메뉴 위치 기준 요소 (Popover에 전달) |
| `open` | boolean | **required** | 메뉴 표시 여부 |
| `onClose` | func | - | 메뉴 닫기 콜백 |
| `children` | ReactNode | - | 메뉴 항목들 (MenuItem) |
| `autoFocus` | boolean | `true` | 메뉴 열릴 때 자동으로 포커스 |
| `disableAutoFocusItem` | boolean | `false` | 항목에 자동 포커스 비활성화 |
| `variant` | 'menu' \| 'selectedMenu' | `'selectedMenu'` | 포커스 전략 (selected 항목 vs 첫 항목) |
| `MenuListProps` | object | `{}` | *deprecated* MenuList에 전달할 props |
| `PaperProps` | object | `{}` | *deprecated* Paper에 전달할 props |
| `TransitionProps` | object | `{}` | *deprecated* Transition에 전달할 props |
| `transitionDuration` | number \| 'auto' | `'auto'` | 애니메이션 지속 시간 |
| `slots` | object | `{}` | 커스텀 컴포넌트 (root, paper, list, backdrop, transition) |
| `slotProps` | object | `{}` | 슬롯별 추가 props |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `PopoverClasses` | object | - | Popover에 전달할 클래스 |

### 8. Theme 시스템 통합

```javascript
// 1. 테마에서 기본 props 병합
const props = useDefaultProps({ props: inProps, name: 'MuiMenu' });

// 2. ownerState 생성 (props를 스타일 시스템에 전달)
const ownerState = {
  ...props,
  autoFocus,
  disableAutoFocusItem,
  MenuListProps,
  onEntering,
  PaperProps,
  transitionDuration,
  TransitionProps,
  variant,
};

// 3. 클래스 이름 생성
const classes = useUtilityClasses(ownerState);
// → { root: 'MuiMenu-root', paper: 'MuiMenu-paper', list: 'MuiMenu-list' }
```

**역할**:
- Theme Provider에서 컴포넌트별 기본 props 주입
- `ownerState`로 props를 styled 시스템에 전달
- 클래스 이름으로 테마 스타일 적용 가능

---

## 설계 패턴

1. **Composition Pattern**
   - Menu = Popover + MenuList의 조합
   - Popover: 위치 결정, 오버레이, 애니메이션
   - MenuList: 항목 관리, 키보드 내비게이션
   - Menu는 두 컴포넌트를 연결하고 기본값 제공

2. **Slot Pattern**
   - `useSlot()` 훅으로 하위 컴포넌트 동적 교체
   - `paper`, `list`, `root`, `backdrop`, `transition` 슬롯 제공
   - deprecated API와 새 API 모두 지원 (하위 호환성)

3. **Compound Component Pattern**
   - `styled()` 함수로 스타일과 로직 분리
   - MenuRoot, MenuPaper, MenuMenuList는 독립적인 styled 컴포넌트
   - `ownerState`로 props를 스타일에 주입

4. **Render Props Pattern**
   - `useSlot()`이 `[Component, props]` 튜플 반환
   - props 병합 로직을 훅 내부에 캡슐화
   - `getSlotProps` 함수로 이벤트 핸들러 병합

---

## 복잡도의 이유

Menu는 **383줄**이며, 복잡한 이유는:

1. **Slot 시스템** (약 50줄)
   - `useSlot()` 훅 2번 호출 (paper, list)
   - `useSlotProps()` 호출 (root)
   - deprecated API와 새 API 병합 로직
   - `externalForwardedProps` 객체 생성 및 전달

2. **Theme 통합** (약 30줄)
   - `useDefaultProps()`: 테마에서 기본 props 가져오기
   - `useUtilityClasses()`: 클래스 이름 생성 함수
   - `composeClasses()`: 여러 클래스 병합
   - `ownerState`: props를 스타일에 전달하는 중간 객체

3. **Styled 시스템** (약 35줄)
   - `styled()` 함수로 3개의 컴포넌트 생성
   - MenuRoot, MenuPaper, MenuMenuList
   - `shouldForwardProp`, `rootShouldForwardProp`

4. **RTL 지원** (약 15줄)
   - `useRtl()` 훅
   - RTL_ORIGIN, LTR_ORIGIN 상수
   - 조건부 origin 계산

5. **variant 기반 포커스 로직** (약 30줄)
   - `activeItemIndex` 계산
   - `React.Children.map`으로 children 순회
   - selected prop 확인
   - disabled 항목 제외
   - Fragment 검증

6. **Transition 통합** (약 20줄)
   - `handleEntering` 함수
   - `menuListActionsRef`로 스크롤바 조정
   - `resolvedTransitionProps` 계산
   - TransitionProps 병합

7. **PropTypes** (약 120줄)
   - 런타임 타입 검증
   - JSDoc 주석으로 상세한 설명
   - 실제 로직(180줄)보다 PropTypes가 적지만 여전히 많음

8. **하위 호환성** (약 20줄)
   - `MenuListProps`, `PaperProps`, `TransitionProps` (deprecated)
   - `slots`, `slotProps` (새 API)
   - 두 API를 병합하는 로직

---

## 비교: Menu vs Select의 메뉴

Material-UI의 Select 컴포넌트도 내부적으로 메뉴를 사용하지만, Menu 컴포넌트와는 다릅니다.

| 기능 | Menu | Select의 Menu |\n|------|---------|----------------|\n| **독립 사용** | ✅ 가능 | ❌ Select 내부용 |\n| **anchorEl** | ✅ 필수 | ❌ Select가 자동 관리 |\n| **variant** | ✅ menu, selectedMenu | ❌ 고정 |\n| **Slot 시스템** | ✅ | ✅ |\n| **사용 사례** | 독립적인 메뉴 (AppBar, ContextMenu 등) | Select의 옵션 목록 |\n\n**핵심 차이**:
- `Menu`는 범용 메뉴 컴포넌트로 설계
- Select는 Menu를 내부에서 사용하되 자체 로직으로 제어
