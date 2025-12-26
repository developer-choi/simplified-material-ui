# MenuItem 컴포넌트

> Menu, Select 등에서 사용되는 클릭 가능한 목록 항목을 ButtonBase 기반으로 단순하게 구현

---

## 무슨 기능을 하는가?

단순화된 MenuItem은 **Menu나 Select 내부에서 사용되는 클릭 가능한 목록 항목**을 제공하는 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **클릭 가능한 항목** - ButtonBase를 래핑하여 클릭 이벤트 처리
2. **선택 상태 표시** - `selected` prop으로 간단한 배경색 표시
3. **비활성화 상태** - `disabled` prop으로 opacity 조절

> **💡 작성 주의**: MenuItem 자체는 ButtonBase를 래핑하여 스타일을 적용하는 간단한 래퍼입니다. Menu나 Select의 드롭다운 기능은 상위 컴포넌트의 책임입니다.

---

## 핵심 학습 포인트

### 1. ButtonBase 래핑 패턴

```javascript
const MenuItem = React.forwardRef(function MenuItem(props, ref) {
  const {
    className,
    selected,
    disabled,
    children,
    style,
    ...other
  } = props;

  const baseStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    // ... 스타일 정의
    backgroundColor: selected ? '#e3f2fd' : 'transparent',
    opacity: disabled ? 0.38 : 1,
    ...style,
  };

  return (
    <ButtonBase
      ref={ref}
      role="menuitem"
      component="li"
      className={className}
      style={baseStyle}
      disabled={disabled}
      {...other}
    >
      {children}
    </ButtonBase>
  );
});
```

**학습 가치**:
- ButtonBase를 래핑하여 특정 용도의 컴포넌트를 만드는 패턴
- Props를 구조 분해하여 필요한 것만 추출하고 나머지는 spread
- 인라인 스타일로 조건부 스타일링 (`selected`, `disabled`)
- `forwardRef`로 ref를 하위 컴포넌트에 전달

### 2. 조건부 스타일링

```javascript
const baseStyle = {
  // ... 기본 스타일
  backgroundColor: selected ? '#e3f2fd' : 'transparent',
  opacity: disabled ? 0.38 : 1,
  ...style,  // 사용자 스타일 오버라이드 허용
};
```

**학습 가치**:
- 삼항 연산자로 간단한 조건부 스타일
- `...style`을 마지막에 배치하여 사용자 커스터마이징 허용
- 복잡한 theme.alpha() 계산 대신 하드코딩된 값 사용

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/MenuItem/MenuItem.js (54줄, 원본 315줄)
MenuItem (forwardRef)
  └─> ButtonBase (component="li", role="menuitem")
       └─> children
```

### 2. 간소화된 스타일링

**원본**: styled component + memoTheme + variants + theme.alpha() 계산
**수정본**: 인라인 style 객체

```javascript
const baseStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  position: 'relative',
  textDecoration: 'none',
  minHeight: 48,
  paddingTop: 6,
  paddingBottom: 6,
  paddingLeft: 16,
  paddingRight: 16,
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  fontSize: '1rem',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  lineHeight: 1.5,
  letterSpacing: '0.00938em',
  backgroundColor: selected ? '#e3f2fd' : 'transparent',
  opacity: disabled ? 0.38 : 1,
  ...style,
};
```

> **💡 원본과의 차이**:
> - ❌ `styled()` 시스템 제거 → 인라인 스타일로 대체
> - ❌ `memoTheme()` 제거 → 하드코딩된 값 사용
> - ❌ `theme.alpha()` 계산 제거 → 단순 배경색 (#e3f2fd)
> - ❌ variants 배열 제거 → 조건부 스타일은 삼항 연산자로
> - ❌ hover, focusVisible 복잡한 조합 제거 → ButtonBase 기본 동작에 위임

### 3. 제거된 기능들

**autoFocus 제거**:
- ❌ `useEnhancedEffect` + `menuItemRef` 제거
- 자동 포커스는 상위 Menu 컴포넌트의 책임

**ListContext 제거**:
- ❌ `ListContext.Provider` 제거
- ❌ `childContext` 메모이제이션 제거
- ListItemIcon, ListItemText와의 통신 불필요

**Theme 시스템 제거**:
- ❌ `useDefaultProps` 제거
- ❌ `useUtilityClasses` 제거
- ❌ `composeClasses` 제거

### 4. Props (5개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 메뉴 항목 내용 |
| `className` | string | - | 추가 CSS 클래스 |
| `selected` | boolean | false | 선택 상태 (#e3f2fd 배경색) |
| `disabled` | boolean | false | 비활성화 상태 (opacity 0.38) |
| `style` | object | - | 인라인 스타일 오버라이드 |

---

## 커밋 히스토리로 보는 단순화 과정

MenuItem은 **13개의 커밋**을 통해 단순화되었습니다.

### 1단계: Props 제거 (Commit 1-4)
- `5486355a` - autoFocus 기능 제거
  - **이유**: MenuItem의 핵심은 "메뉴 항목"이지 "자동 포커스"가 아님. useEnhancedEffect 등 복잡한 로직 불필요.
- `c87beb0a` - dense prop 제거
  - **이유**: 두 가지 크기 모드는 학습에 불필요. 하나의 크기만으로도 충분히 이해 가능.
- `73e4cabe` - divider prop 제거
  - **이유**: Divider 컴포넌트를 별도로 사용하면 됨. 메뉴 항목 자체의 책임이 아님.
- `e672ab63` - disableGutters prop 제거
  - **이유**: 기본 패딩이 있는 상태가 일반적. 패딩 제거는 특수 케이스.

### 2단계: 스타일링 단순화 (Commit 5-6)
- `cb0524d0` - selected 복잡한 스타일 조합 단순화
  - **이유**: theme.alpha() 계산, selected+hover 조합, 미디어 쿼리 등은 학습에 과함. 간단한 배경색만으로도 충분.
- `926891d7` - focusVisibleClassName 제거
  - **이유**: CSS :focus-visible 폴리필 관련 고급 기능. MenuItem 이해에 불필요.

### 3단계: Context 및 고정값 (Commit 7-9)
- `c3a3e43b` - ListContext 제거
  - **이유**: Context는 React의 별도 주제. dense, disableGutters를 제거했으므로 전달할 값도 없음.
- `8c811049` - component prop 제거
  - **이유**: MenuItem은 항상 `<li>` 태그를 사용하는 것이 시맨틱. 고정값으로 충분.
- `4159f615` - role, tabIndex props 제거
  - **이유**: role="menuitem"이 항상 적절. tabIndex는 ButtonBase가 자동 처리.

### 4단계: 시스템 제거 (Commit 10-13)
- `7c12e5f5` - Theme 시스템 제거
  - **이유**: useDefaultProps, useUtilityClasses, composeClasses 등 테마 시스템은 Material-UI 전체의 주제. 하드코딩된 값으로 충분.
- `a96fe6e2` - useForkRef 제거
  - **이유**: ref 병합은 React 고급 주제. 하나의 ref로 충분.
- `9b03cba9` - styled component 시스템 제거
  - **이유**: CSS-in-JS는 별도 학습 주제. 인라인 스타일로도 똑같이 동작하며 코드 가독성 향상.
- `9b8c0197` - PropTypes 제거
  - **이유**: PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님. TypeScript로 타입 검증 가능.

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 315줄 | 54줄 (83% 감소) |
| **Props 개수** | 10개+ | 5개 |
| **autoFocus** | ✅ useEnhancedEffect | ❌ |
| **dense** | ✅ 밀집 모드 | ❌ 일반 모드 고정 |
| **divider** | ✅ 하단 구분선 | ❌ |
| **disableGutters** | ✅ 패딩 제거 가능 | ❌ 16px 고정 |
| **selected 스타일** | ✅ theme.alpha() 계산 | ✅ 간단한 #e3f2fd |
| **ListContext** | ✅ 하위 전달 | ❌ |
| **component** | ✅ 커스터마이징 | ❌ li 고정 |
| **role, tabIndex** | ✅ 커스터마이징 | ❌ 고정값 |
| **Theme 시스템** | ✅ useDefaultProps 등 | ❌ |
| **styled() 시스템** | ✅ CSS-in-JS | ❌ 인라인 스타일 |
| **PropTypes** | ✅ 78줄 | ❌ |

---

## 학습 후 다음 단계

MenuItem을 이해했다면:

1. **ButtonBase** - MenuItem이 래핑하는 기본 컴포넌트. 클릭, 포커스, 접근성 처리 방법 학습
2. **Menu** - MenuItem을 포함하는 컨테이너. 드롭다운, 위치 지정, 키보드 탐색 학습
3. **Select** - MenuItem을 사용하는 또 다른 예시. 선택 값 관리 방법 학습
4. **실전 응용** - 커스텀 메뉴 항목 만들기 (아이콘, 체크박스, 복잡한 레이아웃)

**예시: 기본 사용법**
```javascript
import MenuItem from './MenuItem';
import Menu from './Menu';

function MyMenu() {
  return (
    <Menu open={true}>
      <MenuItem>프로필</MenuItem>
      <MenuItem>설정</MenuItem>
      <MenuItem disabled>비활성화</MenuItem>
      <MenuItem selected>선택됨</MenuItem>
    </Menu>
  );
}
```

**예시: 커스터마이징**
```javascript
<MenuItem
  selected={true}
  style={{
    backgroundColor: '#ffeb3b',  // 노란색 배경
    fontWeight: 'bold'
  }}
>
  강조된 항목
</MenuItem>
```

**예시: 아이콘과 함께**
```javascript
import DeleteIcon from '@mui/icons-material/Delete';

<MenuItem>
  <DeleteIcon style={{ marginRight: 8 }} />
  삭제
</MenuItem>
```
