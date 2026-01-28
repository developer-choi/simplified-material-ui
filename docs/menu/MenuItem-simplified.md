# MenuItem 컴포넌트

> 메뉴의 옵션 아이템을 렌더링하는 최소 단순화 컴포넌트

---

## 무슨 기능을 하는가?

MenuItem은 **메뉴 내에서 클릭 가능한 옵션 아이템을 렌더링하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **메뉴 아이템 렌더링** - `<li>` 요소로 옵션 표시
2. **disabled 상태** - 비활성화 지원 (opacity)
3. **기본 스타일** - flex 레이아웃, 패딩

> **제거된 기능**: ButtonBase, selected, Context, styled 컴포넌트, useUtilityClasses, useDefaultProps, PropTypes

---

## 핵심 학습 포인트

### 1. React.forwardRef 패턴

```javascript
const MenuItem = React.forwardRef(function MenuItem(props, ref) {
  return <li ref={ref} ... />;
});
```

**학습 가치**:
- `forwardRef`: 부모 컴포넌트가 자식의 DOM 요소에 직접 접근 가능
- ref 전달을 위한 표준 React 패턴
- Menu 컴포넌트가 포커스 관리를 위해 ref 사용

### 2. 기본 스타일과 사용자 스타일 병합

```javascript
const baseStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  // ... 기본 스타일
  opacity: disabled ? 0.38 : 1,
  ...style,
};
```

**학습 가치**:
- `...(조건 && 값)` 패턴으로 조건부 스타일 추가
- disabled일 때 opacity 0.38 (Material Design 표준)
- 사용자 style이 기본 스타일을 덮어씀

### 3. 접근성 속성

```javascript
<li
  ref={ref}
  role="menuitem"
  {...other}
>
```

**학습 가치**:
- `role="menuitem"`으로 메뉴 아이템임을 표시
- 스크린 리더기에서 "메뉴 아이템"으로 인식
- 키보드 네비게이션 지원

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/menu/MenuItem/MenuItem.js (35줄, 원본 54줄)
MenuItem (React.forwardRef)
  └─> li
       └─> children
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `baseStyle` | 기본 스타일 + disabled 조건부 스타일 + 사용자 style |

### 3. Props (4개)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 자식 요소 |
| `className` | string | - | 외부 클래스 |
| `disabled` | bool | false | 비활성화 |
| `style` | object | - | 인라인 스타일 |

---

## 커밋 히스토리로 보는 단순화 과정

MenuItem은 **3개의 커밋**을 통해 단순화되었습니다.

### 1단계: selected prop 제거
- `9ae5e159` - [MenuItem 단순화 1/2] selected 제거
- **왜 불필요한가**:
  - 선택 상태는 사용자가 style로 구현 가능
  - 배경색 `#e3f2fd`는 하드코딩된 값
  - MenuItem의 핵심 기능이 아님

### 2단계: ButtonBase 제거
- `77a985c7` - [MenuItem 단순화 2/2] ButtonBase 제거
- **왜 불필요한가**:
  - ButtonBase는 복잡한 컴포넌트 (Ripple, 포커스 관리 등)
  - MenuItem의 핵심은 "옵션 아이템"이지 "버튼 기능"이 아님
  - 외부 의존 제거

### 3단계: selected 관련 backgroundColor 로직 제거
- `4e6a18a2` - [MenuItem 단순화 3/3] selected 관련 backgroundColor 로직 제거
- **왜 불필요한가**:
  - selected prop은 제거되었으나 backgroundColor 로직이 남아있어서 ReferenceError 발생
  - 완전히 제거 필요

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 54줄 | 35줄 (35% 감소) |
| **Props 개수** | 5개 | 4개 (-1개) |
| **외부 의존** | ButtonBase | 제거됨 |
| **상태 관리** | selected | 제거됨 |
| **루트 요소** | ButtonBase | li |

---

## 학습 후 다음 단계

MenuItem을 이해했다면:

1. **MenuList** - MenuItem을 감싸는 컨테이너
2. **Menu** - MenuList를 감싸는 드롭다운 메뉴

**예시: 기본 사용**
```javascript
import Menu from './Menu';
import MenuItem from './MenuItem';

<Menu>
  <MenuItem>옵션 1</MenuItem>
  <MenuItem>옵션 2</MenuItem>
  <MenuItem disabled>비활성화</MenuItem>
</Menu>
```

**예시: disabled**
```javascript
<MenuItem disabled>
  비활성화된 옵션
</MenuItem>
```

**예시: 스타일 직접 제어**
```javascript
// hover 효과를 CSS로 구현
<MenuItem
  style={{
    color: 'red',
  }}
  className="menu-item"  // CSS에서 &:hover 처리
>
  빨간색 옵션
</MenuItem>
```

**예시: 선택 상태 직접 구현**
```javascript
const [selected, setSelected] = useState('option1');

<Menu>
  <MenuItem
    style={{
      backgroundColor: selected === 'option1' ? '#e3f2fd' : 'transparent',
    }}
    onClick={() => setSelected('option1')}
  >
    옵션 1
  </MenuItem>
  <MenuItem
    style={{
      backgroundColor: selected === 'option2' ? '#e3f2fd' : 'transparent',
    }}
    onClick={() => setSelected('option2')}
  >
    옵션 2
  </MenuItem>
</Menu>
```
