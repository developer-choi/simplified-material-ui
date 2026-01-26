# List 컴포넌트

> 목록 형태의 콘텐츠를 감싸는 최소 단순화 컨테이너 컴포넌트

---

## 무슨 기능을 하는가?

수정된 List는 **목록 아이템들을 감싸는 컨테이너** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **목록 컨테이너** - `<ul>` 요소로 목록 아이템들을 감싸기
2. **subheader** - 목록 헤더 표시

> **제거된 기능**: dense 모드, disablePadding, Context 시스템, styled 컴포넌트, useUtilityClasses, useDefaultProps, PropTypes

---

## 핵심 학습 포인트

### 1. React.forwardRef 패턴

```javascript
const List = React.forwardRef(function List(props, ref) {
  return <Component ref={ref} ... />;
});
```

**학습 가치**:
- `forwardRef`: 부모 컴포넌트가 자식의 DOM 요소에 직접 접근 가능
- ref 전달을 위한 표준 패턴
- 함수 컴포넌트에서 ref 사용 방법

### 2. 기본 스타일과 사용자 스타일 병합

```javascript
const baseStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  position: 'relative',
};

const computedStyle = {
  ...baseStyle,  // 기본 스타일
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
  component: Component = 'ul',  // 기본값 'ul'
  ...other
} = props;

return <Component ...>;
```

**학습 가치**:
- `component` prop으로 HTML 태그 동적 변경
- 대문자로 변수명 지정 (`Component`) - JSX 규칙
- `<List component="nav">`처럼 사용 가능

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/data-display/List/List.js (42줄, 원본 144줄)
List (React.forwardRef)
  └─> Component (기본: ul)
       ├─> subheader (선택적)
       └─> children
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `Component` | 루트 요소 타입 (기본: 'ul') |
| `computedStyle` | 기본 스타일과 사용자 스타일 병합 |

### 3. Props (5개)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 목록 아이템들 |
| `className` | string | - | 외부 클래스 |
| `component` | elementType | 'ul' | 루트 요소 타입 |
| `subheader` | ReactNode | - | 목록 헤더 |
| `style` | object | - | 인라인 스타일 |

---

## 커밋 히스토리로 보는 단순화 과정

List는 **총 9개의 커밋**을 통해 단순화되었습니다.

### 1단계: 초기 단순화 (4개 커밋)
- `3606dfce` - [List 단순화 1/4] useUtilityClasses 제거
- `b8e0e22a` - [List 단순화 2/4] useDefaultProps 제거
- `0a74c22c` - [List 단순화 3/4] styled 시스템 제거
- `b6869c69` - [List 단순화 4/4] PropTypes 제거

### 2단계: 추가 단순화 (5개 커밋)
- `171fc3bb` - [List&ListItem 단순화 1/5] secondaryAction 제거
- `e1a64f7f` - [List&ListItem 단순화 2/5] disablePadding, disableGutters 제거
- `58a72daf` - [List&ListItem 단순화 3/5] divider 제거
- `b4594181` - [List&ListItem 단순화 4/5] alignItems 제거
- `91ca515d` - [List&ListItem 단순화 5/5] dense 및 Context 시스템 제거

**왜 불필요한가**:
- **dense**: 패딩 값만 다른데 별도 prop과 Context로 관리하는 과잉 설계
- **disablePadding**: padding 제어를 위한 전용 prop이 과함, style로 대체 가능
- **Context 시스템**: dense만 전달하는데 전용 Context가 과임

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 144줄 | 42줄 (71% 감소) |
| **Props 개수** | 8개 | 5개 (-3개) |
| **Context 시스템** | ListContext 사용 | 제거됨 |
| **styled 컴포넌트** | ListRoot | Component + 인라인 스타일 |
| **useUtilityClasses** | 자동 클래스 생성 | 제거됨 |
| **useDefaultProps** | 테마 기반 기본값 | 파라미터 기본값 |
| **PropTypes** | 46줄 | 제거됨 |

---

## 학습 후 다음 단계

List를 이해했다면:

1. **ListItem** - 개별 목록 아이템 (List의 자식)
2. **ListItemText** - 목록 아이템의 텍스트
3. **ListItemIcon** - 목록 아이템의 아이콘
4. **ListSubheader** - 목록 섹션 헤더

**예시: 기본 사용**
```javascript
import List from './List';
import ListItem from './ListItem';

<List>
  <ListItem>항목 1</ListItem>
  <ListItem>항목 2</ListItem>
  <ListItem>항목 3</ListItem>
</List>
```

**예시: subheader**
```javascript
<List subheader={<ListSubheader>설정</ListSubheader>}>
  <ListItem>알림</ListItem>
  <ListItem>개인정보</ListItem>
</List>
```

**예시: 네비게이션 목록**
```javascript
<List component="nav">
  <ListItem component="a" href="/home">홈</ListItem>
  <ListItem component="a" href="/about">소개</ListItem>
</List>
```

**예시: 스타일 직접 제어**
```javascript
// padding이 필요하면 style로 직접 지정
<List style={{ padding: '8px 0' }}>
  <ListItem style={{ padding: '8px 16px' }}>항목</ListItem>
</List>
```
