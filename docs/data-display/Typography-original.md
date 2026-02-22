# Typography (Original)

## 핵심 역할

텍스트 렌더링의 기반 컴포넌트. `variant` prop으로 Material Design 타이포그래피 스케일을 적용하고,
variant에 따라 의미론적 HTML 요소(`<h1>`, `<p>` 등)를 자동으로 선택한다.

## 복잡도 요소

### 1. styled('span') + memoTheme + theme.typography 동적 순회

```js
const TypographyRoot = styled('span')(
  memoTheme(({ theme }) => ({
    margin: 0,
    variants: [
      // theme.typography 전체를 동적으로 순회
      ...Object.entries(theme.typography)
        .filter(([variant, value]) => variant !== 'inherit' && value && typeof value === 'object')
        .map(([variant, value]) => ({
          props: { variant },
          style: value,  // theme.typography.h1, body1, ... 전체 스타일
        })),
      // theme.palette 전체를 동적으로 순회 (color prop 지원)
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter())
        .map(([color]) => ({
          props: { color },
          style: { color: theme.palette[color].main },
        })),
      // text 팔레트 (textPrimary, textSecondary, textDisabled)
      ...Object.entries(theme.palette?.text || {})
        .map(([color]) => ({
          props: { color: `text${capitalize(color)}` },
          style: { color: theme.palette.text[color] },
        })),
    ],
  })),
);
```

테마 전체가 variants 생성에 개입. 타이포그래피 스타일도, 색상도 모두 동적으로 생성.

### 2. v6Colors + extendSxProp (v6→v7 호환 레이어)

```js
const v6Colors = { primary: true, secondary: true, error: true, ... };
const extendSxProp = internal_createExtendSxProp();

// v6에서 color="primary"는 sx prop처럼 처리됨
// v7에서는 color가 팔레트 클래스로 처리됨
const { color, ...themeProps } = useDefaultProps({ props: inProps, name: 'MuiTypography' });
const isSxColor = !v6Colors[color];  // v6 팔레트 색이 아니면 sx color로 처리
const props = extendSxProp({ ...themeProps, ...(isSxColor && { color }) });
```

API 변경 3세대 흔적 (sx color → palette color → v7 새 방식).

### 3. --Typography-textAlign CSS 변수

```js
// style에 CSS 커스텀 프로퍼티 삽입
style={{ ...(align !== 'inherit' && { '--Typography-textAlign': align }), ...other.style }}
// styled 내부에서 소비:
{ props: ({ ownerState }) => ownerState.align !== 'inherit', style: { textAlign: 'var(--Typography-textAlign)' } }
```

styled 컴포넌트의 ownerState를 통해 textAlign을 CSS 변수로 전달하는 간접 방식.
간소화 시 `textAlign: align` 직접 사용으로 대체 가능.

### 4. paragraph prop (deprecated)

```js
// paragraph=true이면 강제로 <p> 렌더링
const Component = component ||
  (paragraph ? 'p' : variantMapping[variant] || defaultVariantMapping[variant]) || 'span';
```

`component="p"` 로 대체 가능한 deprecated API.

### 5. defaultVariantMapping

```js
const defaultVariantMapping = {
  h1: 'h1', h2: 'h2', ..., subtitle1: 'h6', subtitle2: 'h6',
  body1: 'p', body2: 'p', inherit: 'p',
};
// caption, button, overline 등은 mapping 없음 → 'span'
```

variant별 의미론적 HTML 요소 결정. `variantMapping` prop으로 오버라이드 가능.
