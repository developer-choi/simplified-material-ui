# MenuItem 컴포넌트

> Material-UI의 MenuItem 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

MenuItem은 **Menu, Select 등에서 사용되는 클릭 가능한 목록 항목**을 제공하는 컴포넌트입니다.

> **💡 작성 주의**: MenuItem 자체는 ButtonBase를 래핑하여 클릭, 포커스, 스타일링을 처리합니다. Menu나 Select의 드롭다운 기능은 상위 컴포넌트의 책임입니다.

### 핵심 기능
1. **클릭 가능한 항목** - ButtonBase 기반으로 클릭 이벤트 처리
2. **포커스 관리** - autoFocus, tabIndex 등으로 키보드 접근성 지원
3. **스타일 변형** - dense, divider, selected 등 다양한 시각적 상태 지원
4. **하위 컴포넌트 통신** - ListContext를 통해 ListItemIcon, ListItemText와 설정 공유

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/MenuItem/MenuItem.js (315줄)
MenuItem (forwardRef)
  └─> ListContext.Provider
       └─> MenuItemRoot (styled ButtonBase)
            └─> children (ListItemIcon, ListItemText 등)
```

### 2. 주요 Styled Component

**MenuItemRoot** (라인 51-162)
- ButtonBase를 styled()로 래핑
- memoTheme()로 테마 기반 스타일 적용
- variants 배열로 조건부 스타일 정의

```javascript
const MenuItemRoot = styled(ButtonBase, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiMenuItem',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    // 기본 스타일
    ...theme.typography.body1,
    display: 'flex',
    minHeight: 48,
    paddingTop: 6,
    paddingBottom: 6,

    // hover 스타일
    '&:hover': {
      backgroundColor: (theme.vars || theme).palette.action.hover,
    },

    // selected 상태 스타일 (복잡한 theme.alpha 조합)
    [`&.${menuItemClasses.selected}`]: {
      backgroundColor: theme.alpha(
        (theme.vars || theme).palette.primary.main,
        (theme.vars || theme).palette.action.selectedOpacity,
      ),
    },

    // variants로 조건부 스타일
    variants: [
      // disableGutters
      { props: ({ ownerState }) => !ownerState.disableGutters, style: { paddingLeft: 16 } },
      // divider
      { props: ({ ownerState }) => ownerState.divider, style: { borderBottom: '1px solid' } },
      // dense
      { props: ({ ownerState }) => ownerState.dense, style: { minHeight: 32, paddingTop: 4 } },
    ],
  })),
);
```

### 3. autoFocus 처리

**useEnhancedEffect** (라인 189-199)
- 마운트 시 자동으로 포커스 설정
- useEffect의 강화 버전 (SSR 안전)

```javascript
const menuItemRef = React.useRef(null);
useEnhancedEffect(() => {
  if (autoFocus) {
    if (menuItemRef.current) {
      menuItemRef.current.focus();
    } else if (process.env.NODE_ENV !== 'production') {
      console.error('MUI: Unable to set focus to a MenuItem...');
    }
  }
}, [autoFocus]);
```

### 4. ListContext 통합

**childContext** (라인 180-186)
- 상위 List의 dense 설정과 병합
- disableGutters를 하위 컴포넌트에 전달

```javascript
const context = React.useContext(ListContext);
const childContext = React.useMemo(
  () => ({
    dense: dense || context.dense || false,
    disableGutters,
  }),
  [context.dense, dense, disableGutters],
);
```

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `autoFocus` | boolean | false | 마운트 시 자동 포커스 |
| `component` | elementType | 'li' | 루트 HTML 태그 |
| `dense` | boolean | false | 밀집 모드 (작은 패딩) |
| `disabled` | boolean | - | 비활성화 상태 |
| `disableGutters` | boolean | false | 좌우 패딩 제거 |
| `divider` | boolean | false | 하단 구분선 표시 |
| `focusVisibleClassName` | string | - | 키보드 포커스 시 클래스명 |
| `role` | string | 'menuitem' | ARIA role |
| `selected` | boolean | false | 선택 상태 |
| `tabIndex` | number | -1 (또는 disabled 시 undefined) | 탭 순서 |

### 6. tabIndex 계산 로직

**tabIndex 처리** (라인 212-215)
- disabled가 아닐 때만 tabIndex 설정
- prop으로 전달된 값이 있으면 사용, 없으면 -1

```javascript
let tabIndex;
if (!props.disabled) {
  tabIndex = tabIndexProp !== undefined ? tabIndexProp : -1;
}
```

### 7. Ref 병합

**useForkRef** (라인 210)
- autoFocus를 위한 내부 ref
- forwardRef로 전달받은 외부 ref
- 두 개를 병합하여 사용

```javascript
const menuItemRef = React.useRef(null); // autoFocus용
const handleRef = useForkRef(menuItemRef, ref); // 외부 ref와 병합
```

---

## 설계 패턴

1. **Composition (조합)**
   - ButtonBase를 기반으로 확장
   - ListItemIcon, ListItemText 등 하위 컴포넌트를 자유롭게 조합

2. **Context API**
   - ListContext로 dense, disableGutters 설정을 하위에 전달
   - ListItemIcon, ListItemText가 이 설정을 구독

3. **Styled Component System**
   - styled() + memoTheme()로 테마 기반 스타일
   - ownerState로 props를 스타일에 전달
   - variants 배열로 조건부 스타일 정의

4. **Utility Classes**
   - useUtilityClasses로 상태별 클래스명 생성 (disabled, dense, selected 등)
   - composeClasses로 클래스 병합

5. **Forwarding Props**
   - shouldForwardProp으로 DOM에 전달할 prop 필터링
   - rootShouldForwardProp 재사용

---

## 복잡도의 이유

MenuItem은 **315줄**이며, 복잡한 이유는:

1. **테마 시스템 통합**
   - useDefaultProps로 테마 기본값 병합
   - useUtilityClasses로 클래스명 자동 생성
   - memoTheme()로 테마 기반 스타일 메모이제이션

2. **Styled Component 시스템**
   - styled() API로 컴포넌트 생성 (100줄 이상)
   - overridesResolver로 테마 오버라이드 지원
   - variants 배열로 조건부 스타일 정의
   - shouldForwardProp으로 prop 필터링

3. **다양한 Props 지원**
   - 10개 이상의 props (autoFocus, dense, divider, disableGutters, selected 등)
   - 각 prop마다 스타일 변형 필요
   - PropTypes 78줄

4. **Context 통합**
   - ListContext 읽기 및 병합
   - childContext 생성 및 메모이제이션
   - 하위 컴포넌트와 설정 공유

5. **복잡한 selected 스타일**
   - theme.alpha()로 opacity 조합
   - selected + hover 조합 스타일
   - selected + focusVisible 조합 스타일
   - 미디어 쿼리로 터치 디바이스 대응

6. **Ref 처리**
   - useForkRef로 내부/외부 ref 병합
   - autoFocus를 위한 ref 관리

7. **접근성**
   - role, tabIndex 커스터마이징
   - focusVisibleClassName으로 키보드 포커스 스타일
   - ARIA 속성 지원

8. **하위 컴포넌트 스타일링**
   - ListItemIcon, ListItemText, Divider와의 간격 조정
   - inset 스타일 지원

---

## 비교: MenuItem vs 일반 `<li>` + `<button>`

| 기능 | MenuItem | `<li>` + `<button>` |
|------|---------|---------------------|
| **테마 통합** | 자동 (palette, typography) | 수동 CSS 필요 |
| **접근성** | ARIA role, tabIndex 자동 | 수동 설정 필요 |
| **스타일 변형** | dense, selected 등 prop으로 쉽게 | CSS 클래스 직접 관리 |
| **하위 컴포넌트 통신** | ListContext로 자동 | prop drilling 필요 |
| **코드 복잡도** | 315줄 (재사용 가능) | 간단하지만 반복 필요 |
| **커스터마이징** | slots, sx, styled 등 다양 | CSS만 가능 |
