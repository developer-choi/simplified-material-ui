# ListItemButton 컴포넌트

> 클릭 가능한 목록 아이템을 렌더링하는 최소 단순화 컴포넌트

---

## 무슨 기능을 하는가?

수정된 ListItemButton은 **클릭 가능한 목록 아이템을 렌더링하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **클릭 가능한 아이템** - `<button>` 요소로 클릭 동작 지원
2. **disabled 상태** - 비활성화 지원

> **제거된 기능**: Context 시스템, dense 모드, alignItems, disableGutters, divider, autoFocus, focusVisibleClassName, selected, sx, classes, styled 컴포넌트, useUtilityClasses, useDefaultProps, PropTypes, ButtonBase 의존

---

## 핵심 학습 포인트

### 1. React.forwardRef 패턴

```javascript
const ListItemButton = React.forwardRef(function ListItemButton(props, ref) {
  return <Component ref={ref} ... />;
});
```

**학습 가치**:
- `forwardRef`: 부모 컴포넌트가 자식의 DOM 요소에 직접 접근 가능
- ref 전달을 위한 표준 React 패턴

### 2. 기본 스타일과 사용자 스타일 병합

```javascript
const baseStyle = {
  display: 'flex',
  flexGrow: 1,
  justifyContent: 'flex-start',
  alignItems: 'center',
  // ...
  cursor: 'pointer',
  transition: 'background-color 150ms',
};

const disabledStyle = {
  opacity: 0.5,
  cursor: 'default',
};

const computedStyle = {
  ...baseStyle,
  ...(disabled && disabledStyle),
  ...style,
};
```

**학습 가치**:
- `...(조건 && 객체)` 패턴으로 조건부 스타일 추가
- disabled일 때 opacity, cursor 변경
- 사용자 style이 우선 적용

### 3. component prop으로 루트 요소 변경

```javascript
const {
  component: Component = 'button',  // 기본값 'button'
  ...other
} = props;

return <Component disabled={disabled} {...other}>
```

**학습 가치**:
- `component` prop으로 HTML 태그 동적 변경
- 대문자로 변수명 지정 (`Component`) - JSX 규칙
- `<ListItemButton component="a">`처럼 사용 가능

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/data-display/ListItemButton/ListItemButton.js (48줄, 원본 300줄)
ListItemButton (React.forwardRef)
  └─> Component (기본: button)
       └─> children
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `Component` | 루트 요소 타입 (기본: 'button') |
| `computedStyle` | 기본 스타일과 사용자 스타일 병합 |

### 3. Props (5개)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 자식 요소 |
| `className` | string | - | 외부 클래스 |
| `component` | elementType | 'button' | 루트 요소 타입 |
| `disabled` | bool | false | 비활성화 |
| `style` | object | - | 인라인 스타일 |

---

## 커밋 히스토리로 보는 단순화 과정

ListItemButton은 **5개의 커밋**을 통해 단순화되었습니다.

### 1단계: Context 및 관련 props 제거
- `3ef7daba` - [ListItemButton 단순화 1/5] Context 및 관련 props 제거
- **왜 불필요한가**:
  - ListContext가 이미 제거됨 (dense, alignItems, disableGutters 제거)
  - 전달할 상태가 없음

### 2단계: 선택적 기능 제거
- `f8522be5` - [ListItemButton 단순화 2/5] 선택적 기능 제거
- **왜 불필요한가**:
  - autoFocus: 단순화 목적에 맞지 않음
  - focusVisibleClassName: 포커스 관련은 CSS로 충분
  - selected: 선택 상태는 사용자가 style로 구현 가능
  - sx: 시스템 prop은 학습 목적과 무관
  - classes: CSS 클래스 오버라이드 불필요

### 3단계: useUtilityClasses, useDefaultProps 제거
- `b4bd20bf` - [ListItemButton 단순화 3/5] useUtilityClasses, useDefaultProps 제거
- **왜 불필요한가**: CSS 클래스 자동 생성은 테마 커스터마이징용

### 4단계: styled 시스템 제거
- `25df0f82` - [ListItemButton 단순화 4/5] styled 시스템 제거
- **왜 불필요한가**:
  - styled-components, variants 시스템은 별도 학습 주제
  - 인라인 스타일이 더 직관적
  - ButtonBase 의존 제거

### 5단계: PropTypes, useDefaultProps 제거
- `54515c76` - [ListItemButton 단순화 5/5] PropTypes, useDefaultProps 제거
- **왜 불필요한가**: 런타임 타입 검증으로 컴포넌트 로직과 무관

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 300줄 | 48줄 (84% 감소) |
| **Props 개수** | 12개 | 5개 (-7개) |
| **Context 시스템** | ListContext 사용 | 제거됨 |
| **styled 컴포넌트** | ListItemButtonRoot | 기본 요소 + 인라인 스타일 |
| **ButtonBase** | 의존함 | 제거됨 |
| **useUtilityClasses** | 자동 클래스 생성 | 제거됨 |
| **useDefaultProps** | 테마 기반 기본값 | 파라미터 기본값 |
| **PropTypes** | 100+ 줄 | 제거됨 |

---

## 학습 후 다음 단계

ListItemButton을 이해했다면:

1. **ListItemText** - 목록 아이템의 텍스트
2. **ListItemIcon** - 목록 아이템의 아이콘

**예시: 기본 사용**
```javascript
import List from './List';
import ListItemButton from './ListItemButton';

<List>
  <ListItemButton onClick={() => console.log('clicked')}>
    항목 1
  </ListItemButton>
  <ListItemButton>
    항목 2
  </ListItemButton>
</List>
```

**예시: disabled**
```javascript
<ListItemButton disabled>
  비활성화된 항목
</ListItemButton>
```

**예시: component prop 변경**
```javascript
// 링크로 사용
<ListItemButton component="a" href="/home">
  홈으로 이동
</ListItemButton>
```

**예시: 스타일 직접 제어**
```javascript
// hover 효과를 CSS로 구현
<ListItemButton
  style={{
    backgroundColor: 'white',
  }}
  className="list-item-button"  // CSS에서 &:hover 처리
>
  항목
</ListItemButton>
```

**예시: ListItem과 함께 사용**
```javascript
import List from './List';
import ListItem from './ListItem';
import ListItemButton from './ListItemButton';

<List>
  <ListItem>
    <ListItemButton>
      클릭 가능한 아이템
    </ListItemButton>
  </ListItem>
</List>
```
