# ListItemButton 컴포넌트

> Material-UI의 ListItemButton 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

ListItemButton은 **List 내에서 클릭 가능한 목록 아이템을 렌더링하는** 컴포넌트입니다.

> **💡 작성 주의**: 해당 컴포넌트 자체가 하는 일만 작성하세요. 하위 컴포넌트의 기능까지 포함하지 마세요.

### 핵심 기능
1. **클릭 가능한 아이템** - `<button>` 또는 링크로서 클릭 동작 지원
2. **dense 모드** - 컴팩트한 패딩 (Context로 상속)
3. **disabled 상태** - 비활성화 지원
4. **selected 상태** - 선택 상태 스타일
5. **포커스 관리** - autoFocus, focusVisibleClassName 지원

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/ListItemButton/ListItemButton.js (300줄)
ListItemButton (React.forwardRef)
  └─> ListContext.Provider
       └─> ListItemButtonRoot (styled ButtonBase)
            └─> children
```

### 2. 하위 컴포넌트가 담당하는 기능

- **ButtonBase** - 클릭, 포커스, 키보드 네비게이션 등 버튼 기능 제공
- **ListItemButtonRoot (styled)** - 테마 기반 스타일링, variants로 조건부 스타일 적용

### 3. overridesResolver

```javascript
export const overridesResolver = (props, styles) => {
  const { ownerState } = props;

  return [
    styles.root,
    ownerState.dense && styles.dense,
    ownerState.alignItems === 'flex-start' && styles.alignItemsFlexStart,
    ownerState.divider && styles.divider,
    !ownerState.disableGutters && styles.gutters,
  ];
};
```

테마 커스터마이징을 위한 스타일 오버라이드 우선순위Resolver

### 4. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { alignItems, classes, dense, disabled, disableGutters, divider, selected } = ownerState;

  const slots = {
    root: [
      'root',
      dense && 'dense',
      !disableGutters && 'gutters',
      divider && 'divider',
      disabled && 'disabled',
      alignItems === 'flex-start' && 'alignItemsFlexStart',
      selected && 'selected',
    ],
  };

  const composedClasses = composeClasses(slots, getListItemButtonUtilityClass, classes);

  return {
    ...classes,
    ...composedClasses,
  };
};
```

조건별 CSS 클래스 생성 (MuiListItemButton-root, MuiListItemButton-dense 등)

### 5. ListItemButtonRoot (styled 컴포넌트)

```javascript
const ListItemButtonRoot = styled(ButtonBase, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiListItemButton',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-start',
    // ... 기본 스타일
    '&:hover': {
      backgroundColor: theme.vars || theme.palette.action.hover,
    },
    [`&.${listItemButtonClasses.selected}`]: {
      backgroundColor: theme.alpha(...),
    },
    variants: [
      // 조건부 스타일 (divider, alignItems, disableGutters, dense)
    ],
  })),
);
```

테마 기반 스타일링, hover/selected/disabled 상태, variants로 조건부 스타일

### 6. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `alignItems` | 'center' \| 'flex-start' | 'center' | 정렬 |
| `autoFocus` | boolean | false | 자동 포커스 |
| `children` | ReactNode | - | 자식 요소 |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `className` | string | - | 외부 클래스 |
| `component` | elementType | 'div' | 루트 요소 타입 |
| `dense` | boolean | false | 조밀 모드 |
| `disabled` | boolean | false | 비활성화 |
| `disableGutters` | boolean | false | 좌우 패딩 제거 |
| `divider` | boolean | false | 하단 구분선 |
| `focusVisibleClassName` | string | - | 포커스 시 클래스 |
| `selected` | boolean | false | 선택 상태 |
| `sx` | object | - | 시스템 prop |

### 7. Context 소비 및 제공

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

부모 List의 dense 상태를 받고, 자신의 dense prop과 병합하여 자식에게 전달

### 8. autoFocus 기능

```javascript
const listItemRef = React.useRef(null);
useEnhancedEffect(() => {
  if (autoFocus) {
    if (listItemRef.current) {
      listItemRef.current.focus();
    } else if (process.env.NODE_ENV !== 'production') {
      console.error(
        'MUI: Unable to set focus to a ListItemButton whose component has not been rendered.',
      );
    }
  }
}, [autoFocus]);

const handleRef = useForkRef(listItemRef, ref);
```

마운트 시 자동으로 포커스 설정 (useEnhancedEffect useLayoutEffect 효과)

---

## 설계 패턴

1. **Compound Components 패턴**
   - ListContext로 부모/자식 간 상태 공유
   - ListItem, ListItemButton이 함께 동작

2. **styled-components variants 패턴**
   - variants 배열로 조건부 스타일 정의
   - props 함수로 ownerState 접근

3. **Context Consumer/Provider 패턴**
   - 부모 List의 dense 상태 소비
   - 자식에게 dense, alignItems, disableGutters 제공

4. **Utility Classes 패턴**
   - useUtilityClasses로 CSS 클래스 자동 생성
   - composeClasses로 클래스 병합

---

## 복잡도의 이유

ListItemButton은 **300줄**이며, 복잡한 이유는:

1. **styled-components 시스템** (약 90줄)
   - ListItemButtonRoot 정의
   - memoTheme 래퍼
   - 다양한 상태별 스타일 (hover, selected, disabled)
   - variants로 조건부 스타일

2. **Context 시스템** (약 10줄)
   - ListContext 소비/제공
   - childContext 병합 로직

3. **useUtilityClasses** (약 20줄)
   - 조건부 클래스 생성
   - composeClasses 병합

4. **autoFocus 기능** (약 15줄)
   - useEnhancedEffect로 포커스 설정
   - useForkRef로 ref 병합

5. **PropTypes** (약 80줄)
   - 12개 props에 대한 정의
   - 상세한 JSDoc 주석

6. **useDefaultProps** (약 5줄)
   - 테마 기반 기본값 시스템
