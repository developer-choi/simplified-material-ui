# List 컴포넌트

> 목록 형태의 콘텐츠를 감싸는 단순화된 컨테이너 컴포넌트

---

## 무슨 기능을 하는가?

수정된 List는 **목록 아이템들을 감싸는 컨테이너** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **목록 컨테이너** - `<ul>` 요소로 목록 아이템들을 감싸기
2. **dense 모드** - 조밀한 패딩 (Context로 자식에게 전달)
3. **disablePadding** - 상하 패딩 제거
4. **subheader** - 목록 헤더 표시

---

## 핵심 학습 포인트

### 1. Context를 통한 상태 전달

```javascript
const context = React.useMemo(() => ({ dense }), [dense]);

return (
  <ListContext.Provider value={context}>
    <Component ...>
      {children}
    </Component>
  </ListContext.Provider>
);
```

**학습 가치**:
- `React.createContext()`: 컴포넌트 트리를 통해 데이터 전달
- `useMemo`: dense 값이 변경될 때만 새 객체 생성 (성능 최적화)
- Provider로 감싸면 모든 자식이 dense 값 접근 가능

### 2. 조건부 스타일 패턴

```javascript
const computedStyle = {
  ...baseStyle,
  // disablePadding이 false면 패딩 추가
  ...(!disablePadding && {
    paddingTop: 8,
    paddingBottom: 8,
  }),
  // subheader가 있으면 상단 패딩 제거
  ...(subheader && {
    paddingTop: 0,
  }),
  ...style,
};
```

**학습 가치**:
- `...(조건 && 객체)` 패턴으로 조건부 속성 추가
- 스프레드 연산자 순서가 우선순위 결정
- subheader 패딩 스타일이 일반 패딩보다 우선

### 3. subheader와 children 렌더링 순서

```javascript
<Component ...>
  {subheader}
  {children}
</Component>
```

**학습 가치**:
- subheader가 children보다 먼저 렌더링
- 시맨틱하게 목록 제목이 목록 아이템 위에 위치

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/List/List.js (59줄, 원본 144줄)
List (React.forwardRef)
  └─> ListContext.Provider
       └─> Component (기본: ul)
            ├─> subheader (선택적)
            └─> children
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `context` | dense 상태를 담은 객체 (useMemo로 최적화) |
| `computedStyle` | 최종 합성된 스타일 |

### 3. Props (7개)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 목록 아이템들 |
| `className` | string | - | 외부 클래스 |
| `component` | elementType | 'ul' | 루트 요소 타입 |
| `dense` | bool | false | 조밀 모드 |
| `disablePadding` | bool | false | 패딩 제거 |
| `subheader` | ReactNode | - | 목록 헤더 |
| `style` | object | - | 인라인 스타일 |

---

## 커밋 히스토리로 보는 단순화 과정

List는 **4개의 커밋**을 통해 단순화되었습니다.

### 1단계: useUtilityClasses 제거
- `3606dfce` - [List 단순화 1/4] useUtilityClasses 제거
- **왜 불필요한가**: 자동 CSS 클래스 생성(MuiList-root 등)은 테마 커스터마이징용으로 학습 목적과 무관.

### 2단계: useDefaultProps 제거
- `b8e0e22a` - [List 단순화 2/4] useDefaultProps 제거
- **왜 불필요한가**: 테마 기반 기본값 시스템은 학습 범위 외. 파라미터 기본값이 더 직관적.

### 3단계: styled 시스템 제거
- `0a74c22c` - [List 단순화 3/4] styled 시스템 제거
- **왜 불필요한가**: styled-components, variants 시스템은 별도 학습 주제. 인라인 스타일이 바로 보임.

### 4단계: PropTypes 제거
- `b6869c69` - [List 단순화 4/4] PropTypes 제거
- **왜 불필요한가**: PropTypes는 런타임 타입 검증으로 컴포넌트 로직과 무관. TypeScript가 대안.

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 144줄 | 59줄 (59% 감소) |
| **Props 개수** | 8개 | 7개 (classes 제거) |
| **styled 컴포넌트** | ListRoot | Component + 인라인 스타일 |
| **useUtilityClasses** | 자동 클래스 생성 | 제거됨 |
| **useDefaultProps** | 테마 기반 기본값 | 파라미터 기본값 |
| **PropTypes** | 46줄 | 제거됨 |
| **ListContext** | 유지 | 유지 |

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

**예시: dense 모드**
```javascript
<List dense>
  <ListItem>컴팩트 항목 1</ListItem>
  <ListItem>컴팩트 항목 2</ListItem>
</List>
```

**예시: subheader**
```javascript
<List subheader={<ListSubheader>설정</ListSubheader>}>
  <ListItem>알림</ListItem>
  <ListItem>개인정보</ListItem>
</List>
```

**예시: 패딩 제거**
```javascript
<List disablePadding>
  <ListItem>패딩 없음</ListItem>
</List>
```

**예시: 네비게이션 목록**
```javascript
<List component="nav">
  <ListItem component="a" href="/home">홈</ListItem>
  <ListItem component="a" href="/about">소개</ListItem>
</List>
```
