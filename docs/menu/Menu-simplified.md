# Menu 컴포넌트

> Popover + MenuList 조합으로 드롭다운 메뉴를 구현하는 최소 단순화 컴포넌트

---

## 무슨 기능을 하는가?

Menu는 **버튼이나 다른 요소를 클릭했을 때 나타나는 메뉴 목록 오버레이** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **Popover + MenuList 조합** - 두 컴포넌트를 조합하여 메뉴 구현
2. **Anchor 기반 위치** - anchorEl 요소를 기준으로 메뉴 표시
3. **Tab 키 처리** - Tab 키로 메뉴 닫기
4. **고정된 위치 전략** - 왼쪽 하단에 메뉴 표시 (LTR 고정)

> **제거된 기능**: autoFocus, PaperProps (maxHeight, WebkitOverflowScrolling), Slot 시스템, Theme 시스템, Transition, RTL 지원, variant, styled 컴포넌트, PropTypes

---

## 핵심 학습 포인트

### 1. Composition Pattern (조합 패턴)

```javascript
const Menu = React.forwardRef(function Menu(props, ref) {
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
>
```

**학습 가치**:
- `anchorEl`: 메뉴 위치의 기준점 (보통 버튼)
- `anchorOrigin`: anchorEl의 어느 부분을 기준으로 할지
  - `{ vertical: 'bottom', horizontal: 'left' }` → 왼쪽 하단 모서리
- `transformOrigin`: 메뉴의 어느 부분을 기준점에 붙일지
  - `{ vertical: 'top', horizontal: 'left' }` → 메뉴의 왼쪽 상단 모서리
- 결과: 버튼 왼쪽 하단에 메뉴가 나타남 (드롭다운 효과)

### 3. 이벤트 핸들러 래핑

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

### 4. Props Spreading과 제어된 Props

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

### 5. React.forwardRef 패턴

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
- React의 표준 패턴 (재사용 가능한 컴포넌트에 필수)

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/menu/Menu/Menu.js (약 45줄, 원본 383줄)
Menu
  └─> Popover
       └─> MenuList
            └─> children (MenuItem들)
```

### 2. 전체 코드

```javascript
'use client';
import * as React from 'react';
import MenuList from '../MenuList';
import Popover from '../../modal/Popover';

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
      open={open}
      ref={ref}
      className={className}
      {...other}
    >
      <MenuList
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

### 3. Props (4개)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | 메뉴 표시 여부 |
| `onClose` | func | - | 메뉴 닫기 콜백 (reason: 'tabKeyDown', 'escapeKeyDown', 'backdropClick') |
| `children` | ReactNode | - | 메뉴 항목들 (MenuItem) |
| `className` | string | - | Popover의 root에 전달되는 클래스 |
| `...other` | - | - | Popover에 전달되는 모든 props (anchorEl 등) |

---

## 커밋 히스토리로 보는 단순화 과정

Menu는 **12개의 커밋**을 통해 단순화되었습니다. (이전 10개 + 추가 2개)

### 1-10단계: 이전 단순화 (10개 커밋)
- Slot 시스템 삭제, Transition 제거, variant prop 제거, RTL 지원 제거, autoFocus 로직 제거, Deprecated props 제거, MenuListActions ref 제거, Theme 시스템 제거, Style 시스템 제거, PropTypes 제거

### 11단계: autoFocus 제거
- `b18d21dc` - [Menu 단순화 1/2] autoFocus 제거

**왜 불필요한가**:
- **학습 목적**: Menu의 핵심은 "드롭다운 메뉴"이지 "자동 포커스"가 아님
- **일관성**: MenuList에서 이미 autoFocus를 제거했음 (Commit f9123923)
- **대안**: 사용자가 ref로 직접 focus() 호출 가능

**삭제 대상**:
- `autoFocus` prop (MenuList에 전달)

### 12단계: PaperProps 스타일 간소화
- `2b27c3a7` - [Menu 단순화 2/2] PaperProps 스타일 간소화

**왜 불필요한가**:
- **학습 목적**: maxHeight, WebkitOverflowScrolling은 학습과 무관한 상세 구현
- **복잡도**: PaperProps는 Popover의 복잡한 prop 전달 방식
- **단순화**: 기본 스타일만으로도 충분
- **대안**: 사용자가 Popover에 직접 PaperProps 전달 가능

**삭제 대상**:
- `PaperProps` prop
- `maxHeight: 'calc(100% - 96px)'`
- `WebkitOverflowScrolling: 'touch'`

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 383줄 | 약 45줄 (88% 감소) |
| **Props 개수** | 15개 | 4개 (+ ...other) |
| **Import 개수** | 14개 | 2개 (React, MenuList, Popover) |
| **autoFocus** | ✅ 제어 가능 | ❌ |
| **PaperProps** | ✅ maxHeight, iOS 스크롤 | ❌ |
| **Slot 시스템** | ✅ useSlot() 2번 | ❌ 고정된 구조 |
| **Transition** | ✅ Fade 애니메이션 | ❌ 즉시 표시/숨김 |
| **Theme 통합** | ✅ useDefaultProps, classes | ❌ 하드코딩 |
| **Styled** | ✅ styled(), 3개 컴포넌트 | ❌ 직접 조합 |
| **PropTypes** | ✅ 60줄 | ❌ |
| **RTL 지원** | ✅ useRtl() | ❌ LTR 고정 |
| **variant** | ✅ menu, selectedMenu | ❌ |

---

## 학습 후 다음 단계

Menu를 이해했다면:

1. **MenuItem** - Menu의 개별 항목 컴포넌트
2. **Select** - Menu를 사용하는 셀렉트 박스

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
