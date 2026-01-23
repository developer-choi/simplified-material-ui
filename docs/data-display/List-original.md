# List 컴포넌트

> Material-UI의 List 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

List는 **목록 형태의 콘텐츠를 감싸는 컨테이너** 컴포넌트입니다.

### 핵심 기능
1. **목록 컨테이너** - `<ul>` 요소로 목록 아이템들을 감싸기
2. **dense 모드** - 조밀한 패딩으로 컴팩트한 목록
3. **disablePadding** - 상하 패딩 제거
4. **subheader** - 목록 헤더 표시
5. **Context 전달** - dense 상태를 자식 컴포넌트에게 전달

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/List/List.js (144줄)
List (React.forwardRef)
  └─> ListContext.Provider
       └─> ListRoot (styled ul)
            ├─> subheader (선택적)
            └─> children
```

### 2. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, disablePadding, dense, subheader } = ownerState;

  const slots = {
    root: ['root', !disablePadding && 'padding', dense && 'dense', subheader && 'subheader'],
  };

  return composeClasses(slots, getListUtilityClass, classes);
};
```

조건에 따라 CSS 클래스 생성:
- `MuiList-root`
- `MuiList-padding` (disablePadding이 false일 때)
- `MuiList-dense` (dense가 true일 때)
- `MuiList-subheader` (subheader가 있을 때)

### 3. ListRoot (styled 컴포넌트)

```javascript
const ListRoot = styled('ul', {
  name: 'MuiList',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      !ownerState.disablePadding && styles.padding,
      ownerState.dense && styles.dense,
      ownerState.subheader && styles.subheader,
    ];
  },
})({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  position: 'relative',
  variants: [
    {
      props: ({ ownerState }) => !ownerState.disablePadding,
      style: {
        paddingTop: 8,
        paddingBottom: 8,
      },
    },
    {
      props: ({ ownerState }) => ownerState.subheader,
      style: {
        paddingTop: 0,
      },
    },
  ],
});
```

- 기본: 리스트 스타일 제거, 마진/패딩 0, relative 포지션
- disablePadding이 false면: paddingTop/Bottom 8px
- subheader가 있으면: paddingTop 0 (subheader가 자체 패딩 가짐)

### 4. ListContext

```javascript
// ListContext.js
const ListContext = React.createContext({});
```

List 컴포넌트에서 Context로 dense 상태를 전달:

```javascript
const context = React.useMemo(() => ({ dense }), [dense]);

return (
  <ListContext.Provider value={context}>
    <ListRoot ...>
      {subheader}
      {children}
    </ListRoot>
  </ListContext.Provider>
);
```

자식 컴포넌트(ListItem, ListItemText 등)가 이 Context를 구독하여 dense 모드 적용.

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 목록 아이템들 |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `className` | string | - | 외부 클래스 |
| `component` | elementType | 'ul' | 루트 요소 타입 |
| `dense` | bool | false | 조밀 모드 |
| `disablePadding` | bool | false | 패딩 제거 |
| `subheader` | ReactNode | - | 목록 헤더 |
| `sx` | object | - | 시스템 스타일 |

---

## 설계 패턴

1. **Container 패턴**
   - 목록 아이템들을 감싸는 컨테이너 역할
   - 시맨틱 HTML (`<ul>`) 사용

2. **Context Provider 패턴**
   - dense 상태를 Context로 자식에게 전달
   - 모든 자식이 일관된 스타일 적용

3. **Compound Components 패턴**
   - List + ListItem + ListItemText 등이 함께 동작
   - Context를 통한 상태 공유

---

## 복잡도의 이유

List는 **144줄**이며, 복잡한 이유는:

1. **Theme 시스템** (약 15줄)
   - useDefaultProps
   - useUtilityClasses

2. **ListRoot styled 컴포넌트** (약 34줄)
   - 기본 스타일
   - variants 배열
   - overridesResolver

3. **PropTypes** (약 46줄)
   - 런타임 타입 검증

4. **Context 시스템** (약 5줄)
   - ListContext.Provider
   - useMemo로 최적화

---

## List vs 다른 컨테이너

| 컴포넌트 | 용도 |
|---------|------|
| List | 목록 형태 콘텐츠 (세로 배열) |
| Stack | 요소들을 세로/가로로 쌓기 |
| Grid | 2차원 그리드 레이아웃 |
| Box | 범용 컨테이너 (div) |
