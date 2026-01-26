# ListItem 컴포넌트

> List 내의 개별 목록 아이템을 렌더링하는 최소 단순화 컴포넌트

---

## 무슨 기능을 하는가?

수정된 ListItem은 **목록 아이템을 렌더링하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **목록 아이템 렌더링** - `<li>` 요소로 개별 아이템 표시

> **제거된 기능**: Context 소비/제공, dense 모드, secondaryAction, alignItems, divider, disablePadding, disableGutters, styled 컴포넌트, useUtilityClasses, useDefaultProps, PropTypes, slots/slotProps 시스템

---

## 핵심 학습 포인트

### 1. React.forwardRef 패턴

```javascript
const ListItem = React.forwardRef(function ListItem(props, ref) {
  return <Component ref={ref} ... />;
});
```

**학습 가치**:
- `forwardRef`: 부모 컴포넌트가 자식의 DOM 요소에 직접 접근 가능
- ref 전달을 위한 표준 React 패턴
- 함수 컴포넌트에서 ref 사용 방법

### 2. 기본 스타일과 사용자 스타일 병합

```javascript
const baseStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  position: 'relative',
  textDecoration: 'none',
  width: '100%',
  boxSizing: 'border-box',
  textAlign: 'left',
};

const computedStyle = {
  ...baseStyle,  // 기본 flex 레이아웃
  ...style,      // 사용자 스타일 오버라이드
};
```

**학습 가치**:
- 스프레드 연산자로 객체 병합
- `...style`이 나중에 적용되어 사용자 값이 우선
- 기본값과 오버라이드 패턴

### 3. component prop으로 루트 요소 변경

```javascript
const {
  component: Component = 'li',  // 기본값 'li'
  ...other
} = props;

return <Component ...>;
```

**학습 가치**:
- `component` prop으로 HTML 태그 동적 변경
- 대문자로 변수명 지정 (`Component`) - JSX 규칙
- `<ListItem component="div">`처럼 사용 가능

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/data-display/ListItem/ListItem.js (48줄, 원본 437줄)
ListItem (React.forwardRef)
  └─> Component (기본: li)
       └─> children
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `Component` | 루트 요소 타입 (기본: 'li') |
| `computedStyle` | 기본 스타일과 사용자 스타일 병합 |

### 3. Props (4개)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 자식 요소 |
| `className` | string | - | 외부 클래스 |
| `component` | elementType | 'li' | 루트 요소 타입 |
| `style` | object | - | 인라인 스타일 |

---

## 커밋 히스토리로 보는 단순화 과정

ListItem은 **총 9개의 커밋**을 통해 단순화되었습니다.

### 1단계: 초기 단순화 (4개 커밋)
- `cbd4a93d` - [ListItem 단순화 1/4] useUtilityClasses 제거
- `3e2f4bf1` - [ListItem 단순화 2/4] useDefaultProps 제거
- `4c02d236` - [ListItem 단순화 3/4] styled 시스템 및 deprecated API 제거
- `32bc0a5f` - [ListItem 단순화 4/4] PropTypes 제거

### 2단계: 추가 단순화 (5개 커밋)
- `171fc3bb` - [List&ListItem 단순화 1/5] secondaryAction 제거
- `e1a64f7f` - [List&ListItem 단순화 2/5] disablePadding, disableGutters 제거
- `58a72daf` - [List&ListItem 단순화 3/5] divider 제거
- `b4594181` - [List&ListItem 단순화 4/5] alignItems 제거
- `91ca515d` - [List&ListItem 단순화 5/5] dense 및 Context 시스템 제거

**왜 불필요한가**:
- **secondaryAction**: `@mui/material` 외부 의존, 리스트 아이템 전체가 클릭 가능한 환경에서 불필요
- **dense**: 패딩 값만 다른데 별도 prop과 Context로 관리하는 과잉 설계
- **alignItems**: 그냥 CSS 속성, `style={{ alignItems: 'flex-start' }}`로 대체 가능
- **divider**: 그냥 border-bottom CSS
- **disablePadding, disableGutters**: padding 제어를 위한 전용 prop이 과함
- **Context 시스템**: 전달할 상태가 없어서 불필요

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 437줄 | 48줄 (89% 감소) |
| **Props 개수** | 14개 | 4개 (-10개) |
| **Context 시스템** | ListContext 사용 | 제거됨 |
| **styled 컴포넌트** | ListItemRoot, ListItemContainer | Component + 인라인 스타일 |
| **deprecated API** | hasSecondaryAction, ContainerComponent 등 | 제거됨 |
| **slots 시스템** | slots, slotProps, useSlot | 제거됨 |
| **useUtilityClasses** | 자동 클래스 생성 | 제거됨 |
| **PropTypes** | 136줄 | 제거됨 |

---

## 학습 후 다음 단계

ListItem을 이해했다면:

1. **ListItemButton** - 클릭 가능한 목록 아이템
2. **ListItemText** - 목록 아이템의 텍스트
3. **ListItemIcon** - 목록 아이템의 아이콘

**예시: 기본 사용**
```javascript
import List from './List';
import ListItem from './ListItem';

<List>
  <ListItem>항목 1</ListItem>
  <ListItem>항목 2</ListItem>
</List>
```

**예시: component prop 변경**
```javascript
<List component="nav">
  <ListItem component="a" href="/home">홈</ListItem>
  <ListItem component="a" href="/about">소개</ListItem>
</List>
```

**예시: 스타일 직접 제어**
```javascript
// padding이 필요하면 style로 직접 지정
<List>
  <ListItem style={{ padding: '8px 16px' }}>항목</ListItem>
</List>

// 구분선이 필요하면 style로 직접 지정
<List>
  <ListItem style={{ borderBottom: '1px solid #eee' }}>
    구분선 있는 항목
  </ListItem>
</List>

// 정렬이 필요하면 style로 직접 지정
<List>
  <ListItem style={{ alignItems: 'flex-start' }}>
    <Avatar />
    <div>
      <div>제목</div>
      <div>설명</div>
    </div>
  </ListItem>
</List>
```
