# ListItem 컴포넌트

> Material-UI의 ListItem 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

ListItem은 **List 내의 개별 목록 아이템을 렌더링하는** 컴포넌트입니다.

### 핵심 기능
1. **목록 아이템 렌더링** - `<li>` 요소로 개별 아이템 표시
2. **Context 소비/제공** - 부모 List의 dense 상태 받고, 자식에게 전달
3. **dense 모드** - 컴팩트한 패딩
4. **divider** - 하단 구분선
5. **secondaryAction** - 오른쪽 액션 요소

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/ListItem/ListItem.js (437줄)
ListItem (React.forwardRef)
  └─> ListContext.Provider
       └─> ListItemRoot (styled div) 또는 ListItemContainer
            ├─> children
            └─> ListItemSecondaryAction (secondaryAction prop 사용 시)
```

### 2. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const {
    alignItems,
    classes,
    dense,
    disableGutters,
    disablePadding,
    divider,
    hasSecondaryAction,
  } = ownerState;

  const slots = {
    root: [
      'root',
      dense && 'dense',
      !disableGutters && 'gutters',
      !disablePadding && 'padding',
      divider && 'divider',
      alignItems === 'flex-start' && 'alignItemsFlexStart',
      hasSecondaryAction && 'secondaryAction',
    ],
    container: ['container'],
    secondaryAction: ['secondaryAction'],
  };

  return composeClasses(slots, getListItemUtilityClass, classes);
};
```

조건에 따라 CSS 클래스 생성:
- `MuiListItem-root`
- `MuiListItem-dense`
- `MuiListItem-gutters`
- `MuiListItem-divider`

### 3. ListItemRoot (styled 컴포넌트)

```javascript
export const ListItemRoot = styled('div', {
  name: 'MuiListItem',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    textDecoration: 'none',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left',
    variants: [
      // 패딩, dense, gutters, secondaryAction, divider 등 다양한 variants
    ],
  })),
);
```

- 기본: flex 레이아웃, 100% 너비
- 많은 variants로 조건부 스타일 적용

### 4. ListContext 소비 및 제공

```javascript
const context = React.useContext(ListContext);
const childContext = React.useMemo(
  () => ({
    dense: dense || context.dense || false,
    alignItems,
    disableGutters,
  }),
  [alignItems, context.dense, dense, disableGutters],
);

return (
  <ListContext.Provider value={childContext}>
    {/* ... */}
  </ListContext.Provider>
);
```

- 부모 List의 dense 상태를 받음
- 자신의 dense prop과 병합하여 자식에게 전달

### 5. Deprecated v4 API

```javascript
// v4 implementation, deprecated in v6
const hasSecondaryAction =
  children.length && isMuiElement(children[children.length - 1], ['ListItemSecondaryAction']);

if (hasSecondaryAction) {
  return (
    <ListContext.Provider value={childContext}>
      <ListItemContainer as={ContainerComponent} ...>
        <Root ...>{children}</Root>
        {children.pop()}
      </ListItemContainer>
    </ListContext.Provider>
  );
}
```

- children의 마지막이 ListItemSecondaryAction인지 감지
- ContainerComponent로 감싸는 복잡한 로직

### 6. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `alignItems` | 'center' \| 'flex-start' | 'center' | 정렬 |
| `children` | ReactNode | - | 자식 요소 |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `component` | elementType | 'li' | 루트 요소 |
| `dense` | bool | false | 조밀 모드 |
| `disableGutters` | bool | false | 좌우 패딩 제거 |
| `disablePadding` | bool | false | 모든 패딩 제거 |
| `divider` | bool | false | 하단 구분선 |
| `secondaryAction` | ReactNode | - | 오른쪽 액션 |
| `slots` | object | {} | 슬롯 컴포넌트 |
| `slotProps` | object | {} | 슬롯 props |
| `ContainerComponent` | elementType | 'li' | **deprecated** |
| `ContainerProps` | object | {} | **deprecated** |
| `components` | object | {} | **deprecated** |
| `componentsProps` | object | {} | **deprecated** |

---

## 설계 패턴

1. **Context Consumer/Provider 패턴**
   - 부모 List의 dense 상태 소비
   - 자식에게 dense, alignItems, disableGutters 제공

2. **Compound Components 패턴**
   - ListItem + ListItemText + ListItemIcon 등 함께 동작
   - Context로 상태 공유

3. **Slots API 패턴**
   - slots, slotProps로 내부 컴포넌트 커스터마이징
   - useSlot 훅 사용

---

## 복잡도의 이유

ListItem은 **437줄**이며, 복잡한 이유는:

1. **Theme 시스템** (약 35줄)
   - useDefaultProps
   - useUtilityClasses
   - overridesResolver export

2. **ListItemRoot styled 컴포넌트** (약 94줄)
   - 많은 variants (dense, gutters, padding, divider, button 등)
   - memoTheme 래퍼

3. **Deprecated v4 API** (약 50줄)
   - hasSecondaryAction 감지 로직
   - ContainerComponent, ContainerProps
   - ListItemContainer styled 컴포넌트

4. **Slots 시스템** (약 20줄)
   - useSlot 훅
   - components, componentsProps (deprecated)

5. **PropTypes** (약 136줄)
   - 복잡한 children 검증 로직 포함

---

## ListItem vs ListItemButton

| 컴포넌트 | 용도 |
|---------|------|
| ListItem | 일반 목록 아이템 (정적) |
| ListItemButton | 클릭 가능한 목록 아이템 (버튼) |
