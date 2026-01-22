# IconButton 컴포넌트

> Material-UI의 IconButton 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

IconButton는 **아이콘을 감싸는 원형 버튼을 제공하는** 컴포넌트입니다.

### 핵심 기능
1. **원형 버튼** - 아이콘을 클릭 가능한 원형 버튼으로 렌더링
2. **색상 변형** - default, inherit, primary, secondary 등 다양한 색상 지원
3. **크기 변형** - small, medium, large 3가지 크기 지원
4. **로딩 상태** - loading prop으로 로딩 인디케이터 표시
5. **edge 조절** - start/end edge로 여백 조절 (정렬 목적)

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/IconButton/IconButton.js (347줄)
IconButton (React.forwardRef)
  └─> IconButtonRoot (styled ButtonBase)
       ├─> span.loadingWrapper (loading 시)
       │    └─> IconButtonLoadingIndicator
       │         └─> CircularProgress
       └─> children (아이콘)
```

### 2. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, disabled, color, edge, size, loading } = ownerState;

  const slots = {
    root: [
      'root',
      loading && 'loading',
      disabled && 'disabled',
      color !== 'default' && `color${capitalize(color)}`,
      edge && `edge${capitalize(edge)}`,
      `size${capitalize(size)}`,
    ],
    loadingIndicator: ['loadingIndicator'],
    loadingWrapper: ['loadingWrapper'],
  };

  return composeClasses(slots, getIconButtonUtilityClass, classes);
};
```

조건에 따라 CSS 클래스 생성:
- `MuiIconButton-root`
- `MuiIconButton-colorPrimary` (color="primary"일 때)
- `MuiIconButton-sizeSmall` (size="small"일 때)
- `MuiIconButton-edgeStart` (edge="start"일 때)
- `MuiIconButton-loading` (loading={true}일 때)

### 3. IconButtonRoot (styled 컴포넌트)

```javascript
const IconButtonRoot = styled(ButtonBase, {
  name: 'MuiIconButton',
  slot: 'Root',
  overridesResolver: (props, styles) => { /* ... */ },
})(
  memoTheme(({ theme }) => ({
    textAlign: 'center',
    flex: '0 0 auto',
    fontSize: theme.typography.pxToRem(24),
    padding: 8,
    borderRadius: '50%',
    color: (theme.vars || theme).palette.action.active,
    transition: theme.transitions.create('background-color', {
      duration: theme.transitions.duration.shortest,
    }),
    variants: [
      // hover 스타일
      // edge 스타일 (start, end)
      // color 스타일 (inherit, primary, secondary 등)
      // size 스타일 (small, medium, large)
    ],
  })),
);
```

- 기본: 원형(`borderRadius: '50%'`), padding 8px
- variants로 조건부 스타일 적용

### 4. IconButtonLoadingIndicator

```javascript
const IconButtonLoadingIndicator = styled('span', {
  name: 'MuiIconButton',
  slot: 'LoadingIndicator',
})(({ theme }) => ({
  display: 'none',
  position: 'absolute',
  visibility: 'visible',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: (theme.vars || theme).palette.action.disabled,
  variants: [{ props: { loading: true }, style: { display: 'flex' } }],
}));
```

- 기본 숨김 (`display: 'none'`)
- loading={true}일 때 중앙에 표시

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 아이콘 컨텐츠 |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `className` | string | - | 외부 클래스 |
| `color` | string | 'default' | 색상 (default, inherit, primary 등) |
| `disabled` | boolean | false | 비활성화 |
| `disableFocusRipple` | boolean | false | 포커스 리플 비활성화 |
| `disableRipple` | boolean | false | 리플 비활성화 |
| `edge` | 'start' \| 'end' \| false | false | 여백 조절 |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | 크기 |
| `loading` | boolean | null | 로딩 상태 |
| `loadingIndicator` | ReactNode | CircularProgress | 커스텀 로딩 인디케이터 |
| `sx` | object | - | 시스템 스타일 |

### 6. Loading 메커니즘

```javascript
const loadingId = useId(idProp);
const loadingIndicator = loadingIndicatorProp ?? (
  <CircularProgress aria-labelledby={loadingId} color="inherit" size={16} />
);

return (
  <IconButtonRoot
    id={loading ? loadingId : idProp}
    disabled={disabled || loading}
    {...other}
  >
    {typeof loading === 'boolean' && (
      <span className={classes.loadingWrapper} style={{ display: 'contents' }}>
        <IconButtonLoadingIndicator>
          {loading && loadingIndicator}
        </IconButtonLoadingIndicator>
      </span>
    )}
    {children}
  </IconButtonRoot>
);
```

- `useId`로 접근성 ID 생성
- loading={true}일 때 CircularProgress 표시
- loading 중 버튼 자동 비활성화

---

## 설계 패턴

1. **Composition 패턴**
   - ButtonBase를 확장하여 ripple 효과 상속
   - CircularProgress를 조합하여 로딩 상태 구현

2. **Variants 패턴**
   - styled의 variants로 조건부 스타일 적용
   - color, size, edge에 따라 다른 스타일

---

## 복잡도의 이유

IconButton은 **347줄**이며, 복잡한 이유는:

1. **Theme 시스템** (약 140줄)
   - useDefaultProps
   - useUtilityClasses
   - 2개의 styled 컴포넌트 (IconButtonRoot, IconButtonLoadingIndicator)
   - memoTheme, variants

2. **PropTypes** (약 113줄)
   - 런타임 타입 검증
   - children 커스텀 검증 (onClick 포함 여부 체크)

3. **Loading 기능** (약 20줄)
   - CircularProgress 렌더링
   - useId로 접근성 ID 관리

---

## IconButton vs Button

| 기능 | IconButton | Button |
|------|-----------|--------|
| 용도 | 아이콘 전용 | 텍스트 + 아이콘 |
| 모양 | 원형 | 직사각형 |
| variant | 없음 | text, contained, outlined |
| loading | 지원 | 지원 |
