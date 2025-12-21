# AppBar (원본) 분석

## 무슨 기능을 하는가?

AppBar는 Material-UI의 **애플리케이션 상단 네비게이션 바 컴포넌트**입니다.

주요 기능:
1. **5가지 위치 제어** - position prop (fixed/absolute/sticky/static/relative)
2. **동적 색상 시스템** - palette의 모든 색상 지원 (primary, secondary, error, info, success, warning, default, inherit, transparent + 커스텀)
3. **다크 모드 지원** - enableColorOnDark prop으로 다크 모드 색상 제어
4. **Paper 상속** - elevation(그림자), square(모서리) 등 Paper의 모든 기능
5. **테마 통합** - Material-UI 테마 시스템과 완전히 통합

## 내부 구조

```
AppBar (React.forwardRef)
  ↓
useDefaultProps (테마 기본값 병합)
  ↓
useUtilityClasses (CSS 클래스 이름 생성)
  ↓
AppBarRoot (styled(Paper))
  - memoTheme (테마 메모이제이션)
  - variants 시스템 (조건부 스타일)
  - overridesResolver (테마 오버라이드)
  ↓
<Paper component="header" />
```

### 주요 컴포넌트

**1. AppBarRoot**
- `styled(Paper)`로 생성된 스타일 컴포넌트
- Paper의 모든 기능 상속 (elevation, square 등)
- memoTheme으로 성능 최적화
- variants 배열로 조건부 스타일 적용

**2. useUtilityClasses**
- CSS 클래스 이름 자동 생성
- 예: `MuiAppBar-root`, `MuiAppBar-colorPrimary`, `MuiAppBar-positionFixed`

**3. joinVars**
- CSS 변수 폴백 체인 생성
- 다크 모드 CSS 변수 병합

## 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `position` | 'fixed' \| 'absolute' \| 'sticky' \| 'static' \| 'relative' | 'fixed' | CSS position |
| `color` | 'primary' \| 'secondary' \| 'default' \| 'inherit' \| 'transparent' \| ... | 'primary' | 색상 (palette 모든 색) |
| `enableColorOnDark` | boolean | false | 다크 모드 색상 적용 여부 |
| `elevation` | 0-24 | 4 | 그림자 깊이 (Paper) |
| `square` | boolean | true | 모서리 각짐 (Paper) |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `sx` | object | - | CSS-in-JS 스타일 |
| `component` | elementType | 'header' | HTML 태그 |

## 설계 패턴

### 1. Styled Components API
```javascript
const AppBarRoot = styled(Paper, {
  name: 'MuiAppBar',
  slot: 'Root',
  overridesResolver: (props, styles) => [
    styles.root,
    styles[`position${capitalize(ownerState.position)}`],
    styles[`color${capitalize(ownerState.color)}`],
  ],
})(memoTheme(({ theme }) => ({ ... })))
```

### 2. Variants 시스템
```javascript
variants: [
  {
    props: { position: 'fixed' },
    style: { position: 'fixed', zIndex: theme.zIndex.appBar, ... }
  },
  {
    props: { color: 'primary' },
    style: { '--AppBar-background': theme.palette.primary.main, ... }
  },
  // ... 총 10개 이상의 variants
]
```

### 3. CSS 변수 시스템
```javascript
'--AppBar-background': theme.palette.primary.main,
'--AppBar-color': theme.palette.primary.contrastText,
backgroundColor: 'var(--AppBar-background)',
color: 'var(--AppBar-color)',
```

### 4. 동적 Palette 색상 생성
```javascript
...Object.entries(theme.palette)
  .filter(createSimplePaletteValueFilter(['contrastText']))
  .map(([color]) => ({
    props: { color },
    style: {
      '--AppBar-background': theme.palette[color].main,
      '--AppBar-color': theme.palette[color].contrastText,
    },
  }))
```

### 5. OwnerState 패턴
```javascript
const ownerState = {
  ...props,
  color,
  position,
  enableColorOnDark,
};
// styled 컴포넌트와 variants에서 사용
```

## 복잡도의 이유

### 1. 다양한 Position 옵션 (5가지)
- fixed, absolute, sticky, static, relative
- 각각 다른 스타일과 zIndex 적용
- @media print 처리 (fixed만)

### 2. 동적 색상 시스템
- palette의 모든 색상 자동 지원
- createSimplePaletteValueFilter로 필터링
- CSS 변수로 런타임 변경 가능

### 3. 다크 모드 복잡도
- enableColorOnDark prop에 따라 2가지 variant
- theme.applyStyles('dark')로 다크 모드 스타일
- joinVars로 CSS 변수 폴백 체인

### 4. 테마 시스템 통합
- useDefaultProps - 테마 기본값 병합
- useUtilityClasses - CSS 클래스 생성
- memoTheme - 성능 최적화
- overridesResolver - 테마 오버라이드 지원

### 5. Paper 상속
- elevation, square 등 모든 Paper 기능
- styled(Paper)로 스타일 확장
