# Menu 컴포넌트

> 학습 목적으로 단순화된 Menu - Popover + MenuList 조합 패턴의 핵심 개념에 집중

---

## 무슨 기능을 하는가?

수정된 Menu는 **버튼이나 다른 요소를 클릭했을 때 나타나는 메뉴 목록 오버레이** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **Popover + MenuList 조합** - 두 컴포넌트를 조합하여 메뉴 구현
2. **Anchor 기반 위치** - anchorEl 요소를 기준으로 메뉴 표시
3. **키보드 내비게이션** - Tab 키로 메뉴 닫기
4. **고정된 위치 전략** - 왼쪽 하단에 메뉴 표시 (LTR 고정)
5. **maxHeight 제한** - 화면 높이보다 96px 작게 제한

> **💡 작성 주의**: Menu 자체는 Popover와 MenuList를 연결하는 역할만 합니다. 백드롭/포커스 트랩/포지셔닝은 Popover가, 항목 관리/키보드 내비게이션은 MenuList가 담당합니다.

---

## 핵심 학습 포인트

### 1. Composition Pattern (조합 패턴)

```javascript
const Menu = React.forwardRef(function Menu(props, ref) {
  // ...
  return (
    <Popover {...popoverProps}>
      <MenuList {...menuListProps}>
        {children}
      </MenuList>
    </Popover>
  );
});
```

**학습 가치**:
- Menu는 직접 DOM을 렌더링하지 않음
- Popover + MenuList를 조합하여 새로운 컴포넌트 생성
- 각 컴포넌트의 역할이 명확히 분리:
  - **Popover**: 위치 결정, 백드롭, 포커스 트랩, 오버레이
  - **MenuList**: 항목 관리, 키보드 내비게이션 (↑↓ 키)
  - **Menu**: 두 컴포넌트를 연결하고 기본값 제공
- 코드 재사용성 증가 (Popover는 Dialog, Tooltip 등에서도 사용)

### 2. Anchor 기반 포지셔닝

```javascript
<Popover
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'left',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'left',
  }}
  {...other}  // anchorEl은 여기에 포함
>
```

**학습 가치**:
- `anchorEl`: 메뉴 위치의 기준점 (보통 버튼)
- `anchorOrigin`: anchorEl의 어느 부분을 기준으로 할지
  - `{ vertical: 'bottom', horizontal: 'left' }` → 왼쪽 하단 모서리
- `transformOrigin`: 메뉴의 어느 부분을 기준점에 붙일지
  - `{ vertical: 'top', horizontal: 'left' }` → 메뉴의 왼쪽 상단 모서리
- 결과: 버튼 왼쪽 하단에 메뉴가 나타남 (드롭다운 효과)

### 3. PaperProps를 통한 스타일 전달

```javascript
<Popover
  PaperProps={{
    style: {
      maxHeight: 'calc(100% - 96px)',
      WebkitOverflowScrolling: 'touch',
    },
  }}
>
```

**학습 가치**:
- Popover 내부의 Paper 컴포넌트에 props 전달하는 패턴
- `maxHeight: calc(100% - 96px)`: Material Design 스펙
  - 메뉴가 화면을 완전히 덮지 않도록 96px 여백 확보
  - 사용자가 메뉴 바깥을 클릭하여 닫을 수 있는 영역 보장
- `WebkitOverflowScrolling: 'touch'`: iOS momentum 스크롤링
- 중첩된 컴포넌트에 props 전달하는 일반적인 React 패턴

### 4. 이벤트 핸들러 래핑

```javascript
const handleListKeyDown = (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    if (onClose) {
      onClose(event, 'tabKeyDown');
    }
  }
};

<MenuList
  onKeyDown={handleListKeyDown}
>
```

**학습 가치**:
- 하위 컴포넌트의 이벤트를 가로채서 추가 로직 실행
- Tab 키 특별 처리:
  - `preventDefault()`: 기본 포커스 이동 방지
  - `onClose()`: 메뉴 닫기 (reason: 'tabKeyDown')
- 접근성(Accessibility) 개선:
  - Tab은 "메뉴 벗어나기" 의도로 해석
  - Escape는 Popover가 처리 (backdropClick과 함께)
- 이벤트 위임 패턴 학습

### 5. Props Spreading과 제어된 Props

```javascript
const Menu = React.forwardRef(function Menu(props, ref) {
  const {
    children,
    className,
    onClose,
    open,
    ...other  // anchorEl 포함
  } = props;

  return (
    <Popover
      onClose={onClose}
      open={open}
      className={className}
      {...other}  // 나머지 props 전달 (anchorEl 등)
    >
```

**학습 가치**:
- 명시적으로 처리할 props는 destructuring으로 추출
- 나머지는 `...other`로 하위 컴포넌트에 전달
- 이렇게 하면:
  - `anchorEl`처럼 Popover에 필요한 props를 자동으로 전달
  - Menu가 Popover의 모든 props를 지원 (문서화 없이도)
  - 유연성과 확장성 확보
- 하지만 주의:
  - 어떤 props가 전달되는지 명확하지 않을 수 있음
  - TypeScript에서는 명시적으로 타입 정의 필요

### 6. forwardRef 패턴

```javascript
const Menu = React.forwardRef(function Menu(props, ref) {
  return (
    <Popover ref={ref} ...>
  );
});
```

**학습 가치**:
- `ref`를 Popover에 전달하여 DOM 접근 가능
- 부모 컴포넌트가 Menu의 DOM을 직접 조작 가능
- 예: 프로그래밍 방식으로 메뉴 위치 조정, 포커스 제어 등
- React의 표준 패턴 (재사용 가능한 컴포넌트에 필수)

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Menu/Menu.js (59줄, 원본 383줄)
Menu
  └─> Popover
       └─> MenuList
            └─> children (MenuItem들)
```

**변경 사항**:
- ❌ MenuRoot, MenuPaper, MenuMenuList (styled components) 제거
- ❌ Slot 시스템 제거 (useSlot 훅)
- ✅ Popover + MenuList 직접 조합

### 2. 전체 코드

```javascript
'use client';
import * as React from 'react';
import MenuList from '../MenuList';
import Popover from '../Popover';

const Menu = React.forwardRef(function Menu(props, ref) {
  const {
    children,
    className,
    onClose,
    open,
    ...other
  } = props;

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();

      if (onClose) {
        onClose(event, 'tabKeyDown');
      }
    }
  };

  return (
    <Popover
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        style: {
          maxHeight: 'calc(100% - 96px)',
          WebkitOverflowScrolling: 'touch',
        },
      }}
      open={open}
      ref={ref}
      className={className}
      {...other}
    >
      <MenuList
        autoFocus
        onKeyDown={handleListKeyDown}
        style={{ outline: 0 }}
      >
        {children}
      </MenuList>
    </Popover>
  );
});

export default Menu;
```

> **💡 원본과의 차이**:
> - ❌ `styled()` 제거 → Popover, MenuList 직접 사용
> - ❌ `useSlot()` 제거 → 고정된 구조
> - ❌ `useDefaultProps()` 제거 → 함수 파라미터 기본값
> - ❌ `useUtilityClasses()` 제거 → 클래스 이름 불필요
> - ❌ `useRtl()` 제거 → LTR 고정
> - ❌ `activeItemIndex` 계산 제거 → 항상 autoFocus
> - ❌ Transition 제거 → 즉시 표시/숨김

### 3. Props (5개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | 메뉴 표시 여부 |
| `onClose` | func | - | 메뉴 닫기 콜백 (reason: 'tabKeyDown', 'escapeKeyDown', 'backdropClick') |
| `children` | ReactNode | - | 메뉴 항목들 (MenuItem) |
| `className` | string | - | Popover의 root에 전달되는 클래스 |
| `...other` | - | - | Popover에 전달되는 모든 props (anchorEl 등) |

**제거된 props** (10개):
- ❌ `autoFocus` - 항상 `true`
- ❌ `disableAutoFocusItem` - 항상 항목에 autoFocus
- ❌ `variant` - 항상 autoFocus (selectedMenu 로직 제거)
- ❌ `MenuListProps` (deprecated) - MenuList에 직접 props 전달
- ❌ `PaperProps` (deprecated) - PaperProps.style로 대체
- ❌ `TransitionProps` (deprecated) - Transition 제거
- ❌ `transitionDuration` - Transition 제거
- ❌ `slots` - Slot 시스템 제거
- ❌ `slotProps` - Slot 시스템 제거
- ❌ `classes` - Theme 시스템 제거
- ❌ `PopoverClasses` - Theme 시스템 제거

---

## 커밋 히스토리로 보는 단순화 과정

Menu는 **10개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 삭제
- `f7e0414d` - [Menu 단순화 1/10] Slot 시스템 삭제

**왜 불필요한가**:
- **학습 목적**: Menu의 핵심은 "Popover + MenuList 조합"이지 "커스터마이징 시스템"이 아님
- **복잡도**: `useSlot()` 훅 2번 호출 (paper, list), `useSlotProps()` 호출 (root), props 병합 로직
- **일관성**: Dialog, Modal, Backdrop 등 다른 단순화된 컴포넌트에서도 Slot 제거

**삭제 대상**:
- `slots`, `slotProps` prop
- `useSlot()` 훅 호출 (paper, list)
- `useSlotProps()` 호출 (root)
- `externalForwardedProps` 객체
- MenuRoot, MenuPaper, MenuMenuList를 직접 사용

### 2단계: Transition 제거
- `5b2085a1` - [Menu 단순화 2/10] Transition 제거

**왜 불필요한가**:
- **학습 목적**: Menu의 핵심은 "앵커 기반 메뉴 표시"이지 "애니메이션"이 아님
- **복잡도**: `TransitionProps` prop, `transitionDuration` prop, `onEntering` 콜백, `handleEntering` 함수
- **일관성**: Dialog, Modal, Backdrop에서도 Transition 제거됨

**삭제 대상**:
- `transitionDuration` prop
- `TransitionProps` prop (deprecated)
- `onEntering` 콜백
- `handleEntering` 함수 (스크롤바 조정 로직)
- `resolvedTransitionProps` 계산
- → Popover가 즉시 표시/숨김

### 3단계: variant prop 제거
- `bf49da95` - [Menu 단순화 3/10] variant prop 제거

**왜 불필요한가**:
- **학습 목적**: Menu의 핵심은 "항목 목록 표시"이지 "복잡한 포커스 전략"이 아님
- **복잡도**: `variant` prop 처리, `activeItemIndex` 계산 로직 (28줄), `React.Children.map` 순회, selected prop 확인
- **현실**: 항상 autoFocus로도 충분히 사용 가능

**삭제 대상**:
- `variant` prop (기본값: 'selectedMenu')
- `activeItemIndex` 계산 로직 (134-161줄)
- `React.Children.map` 순회
- `isFragment` import 및 검증
- → MenuList에 항상 autoFocus={true} 전달

### 4단계: RTL 지원 제거
- `2cb90729` - [Menu 단순화 4/10] RTL 지원 제거

**왜 불필요한가**:
- **학습 목적**: Menu의 핵심은 "메뉴 표시"이지 "국제화"가 아님
- **복잡도**: `useRtl()` 훅, `RTL_ORIGIN`, `LTR_ORIGIN` 상수, 조건부 origin 계산
- **현실**: 대부분 웹사이트는 LTR 언어 사용

**삭제 대상**:
- `useRtl` import
- `isRtl` 변수
- `RTL_ORIGIN`, `LTR_ORIGIN` 상수
- 조건부 origin 계산
- → anchorOrigin, transformOrigin 고정값 사용 (LTR)

### 5-7단계: autoFocus 로직, Deprecated props, MenuListActions ref 제거
- `ff5a5743` - [Menu 단순화 5-7/10] autoFocus 로직, Deprecated props, MenuListActions ref 제거

**왜 불필요한가**:

**5단계 - autoFocus 로직**:
- **학습 목적**: 항상 자동 포커스로도 충분
- **복잡도**: `autoFocus`, `disableAutoFocusItem` prop, `autoFocusItem` 계산

**6단계 - Deprecated Props**:
- **학습 목적**: 하위 호환성은 프로덕션 라이브러리의 책임
- **복잡도**: `MenuListProps`, `PaperProps`, `TransitionProps` (deprecated)

**7단계 - MenuListActions ref**:
- **학습 목적**: 스크롤바 조정은 세밀한 UX 개선
- **복잡도**: `menuListActionsRef` ref, adjustStyleForScrollbar 호출

**삭제 대상**:
- `autoFocus`, `disableAutoFocusItem` prop
- `MenuListProps`, `PaperProps`, `TransitionProps` (deprecated)
- `menuListActionsRef` ref
- → 항상 autoFocus={true}, PaperProps.style 사용

### 8단계: Theme 시스템 제거
- `1a5b5899` - [Menu 단순화 8/10] Theme 시스템 제거

**왜 불필요한가**:
- **학습 목적**: 테마 시스템은 Material-UI 전체의 주제로 Menu 학습에는 과함
- **복잡도**: `useDefaultProps()`, `useUtilityClasses()`, `composeClasses()`, `ownerState` 객체
- **대안**: 하드코딩된 값으로도 Menu 동작 완벽히 이해 가능

**삭제 대상**:
- `useDefaultProps()` 호출 → 함수 파라미터 기본값으로 대체
- `useUtilityClasses()` 함수 전체
- `composeClasses`, `getMenuUtilityClass` import
- `ownerState` 객체
- `classes`, `PopoverClasses` prop

### 9단계: Style 시스템 제거
- `edad0c7f` - [Menu 단순화 9/10] Style 시스템 제거

**왜 불필요한가**:
- **학습 목적**: 컴포넌트 구조를 배우는 것이지 CSS-in-JS를 배우는 게 아님
- **복잡도**: `styled()` API, `MenuRoot`, `MenuPaper`, `MenuMenuList` styled 컴포넌트
- **가독성**: Popover, MenuList 직접 사용이 더 명확

**삭제 대상**:
- `styled()` 함수 사용
- `MenuRoot`, `MenuPaper`, `MenuMenuList` styled 컴포넌트
- → Popover, MenuList 직접 사용
- `styled`, `rootShouldForwardProp` import
- `clsx` import
- `PopoverPaper` import

### 10단계: PropTypes 제거
- `ba9d59c7` - [Menu 단순화 10/10] PropTypes 제거

**왜 불필요한가**:
- **학습 목적**: PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님
- **복잡도**: PropTypes 정의 약 60줄, 실제 로직보다 많음
- **프로덕션**: TypeScript가 빌드 타임에 검증하므로 런타임 검증 불필요

**삭제 대상**:
- `PropTypes` import
- `HTMLElementType` import
- `Menu.propTypes` 전체 (약 60줄)
- JSDoc 주석

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 383줄 | 59줄 (85% 감소) |
| **Props 개수** | 15개 | 5개 (10개 제거) |
| **Import 개수** | 14개 | 3개 (React, MenuList, Popover만) |
| **Slot 시스템** | ✅ useSlot() 2번 | ❌ 고정된 구조 |
| **Transition** | ✅ Fade 애니메이션 | ❌ 즉시 표시/숨김 |
| **Theme 통합** | ✅ useDefaultProps, classes | ❌ 하드코딩 |
| **Styled** | ✅ styled(), 3개 컴포넌트 | ❌ 직접 조합 |
| **PropTypes** | ✅ 60줄 | ❌ 제거 |
| **RTL 지원** | ✅ useRtl() | ❌ LTR 고정 |
| **variant** | ✅ menu, selectedMenu | ❌ 항상 autoFocus |
| **autoFocus 제어** | ✅ 복잡한 로직 | ❌ 항상 true |
| **커스터마이징** | ✅ 광범위 (slots, sx 등) | ✅ 최소 (style, ...other) |

---

## 학습 후 다음 단계

Menu를 이해했다면:

1. **MenuItem** - Menu의 개별 항목 컴포넌트 학습
2. **MenuList** - 키보드 내비게이션과 항목 관리 학습
3. **Popover** - 위치 결정과 오버레이 시스템 학습
4. **실전 응용** - AppBar 메뉴, Context Menu 등 직접 만들어보기

**예시: 간단한 메뉴**
```javascript
const [anchorEl, setAnchorEl] = React.useState(null);

const handleClick = (event) => {
  setAnchorEl(event.currentTarget);
};

const handleClose = () => {
  setAnchorEl(null);
};

<Button onClick={handleClick}>
  Open Menu
</Button>
<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleClose}
>
  <MenuItem onClick={handleClose}>Profile</MenuItem>
  <MenuItem onClick={handleClose}>My account</MenuItem>
  <MenuItem onClick={handleClose}>Logout</MenuItem>
</Menu>
```

**예시: anchorOrigin 커스터마이징**
```javascript
<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleClose}
  anchorOrigin={{
    vertical: 'top',    // 버튼 위에 표시
    horizontal: 'right', // 버튼 오른쪽에 정렬
  }}
  transformOrigin={{
    vertical: 'bottom',
    horizontal: 'right',
  }}
>
  {/* 메뉴가 버튼 위쪽에 나타남 */}
</Menu>
```
