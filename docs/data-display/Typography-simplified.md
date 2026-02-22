# Typography (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';

const defaultVariantMapping = {
  h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
  subtitle1: 'h6', subtitle2: 'h6',
  body1: 'p', body2: 'p', inherit: 'p',
};

const typographyStyles = {
  h1:        { fontSize: '6rem',     fontWeight: 300, lineHeight: 1.167, letterSpacing: '-0.01562em' },
  h2:        { fontSize: '3.75rem',  fontWeight: 300, lineHeight: 1.2,   letterSpacing: '-0.00833em' },
  h3:        { fontSize: '3rem',     fontWeight: 400, lineHeight: 1.167, letterSpacing: '0em' },
  h4:        { fontSize: '2.125rem', fontWeight: 400, lineHeight: 1.235, letterSpacing: '0.00735em' },
  h5:        { fontSize: '1.5rem',   fontWeight: 400, lineHeight: 1.334, letterSpacing: '0em' },
  h6:        { fontSize: '1.25rem',  fontWeight: 500, lineHeight: 1.6,   letterSpacing: '0.0075em' },
  subtitle1: { fontSize: '1rem',     fontWeight: 400, lineHeight: 1.75,  letterSpacing: '0.00938em' },
  subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57,  letterSpacing: '0.00714em' },
  body1:     { fontSize: '1rem',     fontWeight: 400, lineHeight: 1.5,   letterSpacing: '0.00938em' },
  body2:     { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43,  letterSpacing: '0.01071em' },
  button:    { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.75,  letterSpacing: '0.02857em', textTransform: 'uppercase' },
  caption:   { fontSize: '0.75rem',  fontWeight: 400, lineHeight: 1.66,  letterSpacing: '0.03333em' },
  overline:  { fontSize: '0.75rem',  fontWeight: 400, lineHeight: 2.66,  letterSpacing: '0.08333em', textTransform: 'uppercase' },
  inherit:   { font: 'inherit', lineHeight: 'inherit', letterSpacing: 'inherit' },
};

const Typography = React.forwardRef(function Typography(props, ref) {
  const {
    align = 'inherit',
    children,
    className,
    component,
    gutterBottom = false,
    noWrap = false,
    variant = 'body1',
    variantMapping = defaultVariantMapping,
    style,
    ...other
  } = props;

  const Component = component || variantMapping[variant] || defaultVariantMapping[variant] || 'span';

  return (
    <Component
      ref={ref}
      className={className}
      style={{
        margin: 0,
        ...typographyStyles[variant],
        ...(align !== 'inherit' && { textAlign: align }),
        ...(noWrap && { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
        ...(gutterBottom && { marginBottom: '0.35em' }),
        ...style,
      }}
      {...other}
    >
      {children}
    </Component>
  );
});

export default Typography;
```

**318줄 → 70줄 (−78%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `TypographyRoot` styled('span') + memoTheme | 인라인 스타일로 대체 |
| `styled`, `memoTheme`, `capitalize` import | styled 제거 |
| `createSimplePaletteValueFilter`, `internal_createExtendSxProp` | 테마 의존 제거 |
| `theme.typography` 동적 순회 | `typographyStyles` 하드코딩으로 대체 |
| `theme.palette` 동적 순회 (color prop) | 테마 의존 제거 |
| `v6Colors`, `extendSxProp`, `isSxColor` | v6→v7 호환 레이어 제거 |
| `color` prop | 테마 팔레트 의존 제거 |
| `paragraph` prop (deprecated) | `component="p"` 로 대체 가능 |
| `--Typography-textAlign` CSS 변수 | `textAlign: align` 직접 적용 |
| `useUtilityClasses`, `composeClasses`, `getTypographyUtilityClass` | 클래스 시스템 제거 |
| `useDefaultProps`, `PropTypes`, `ownerState` | 테마/타입 시스템 제거 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `typographyStyles` 맵 (14개 variant) | Material Design 타이포그래피 스케일 |
| `defaultVariantMapping` | variant → 의미론적 HTML 요소 결정 |
| `variantMapping` prop | 매핑 오버라이드 허용 |
| `component` prop | 렌더링 요소 오버라이드 |
| `align`, `noWrap`, `gutterBottom` props | 실용적인 텍스트 유틸리티 |

## 핵심 학습 포인트

### 1. variant → HTML 요소 자동 결정 (의미론적 HTML)

```js
const Component = component || variantMapping[variant] || defaultVariantMapping[variant] || 'span';

// h1 → <h1>, body1 → <p>, subtitle1 → <h6>, caption → <span>
<Typography variant="h1">제목</Typography>
// → <h1 style="...">제목</h1>
```

시각적 스타일과 HTML 의미론(semantics)을 분리. `variant="h1"`이라도 `component="p"`로 요소만 바꿀 수 있다.

### 2. typographyStyles — Material Design 타이포그래피 스케일 전체

```
variant    | fontSize    | fontWeight | lineHeight | letterSpacing
-----------|-------------|------------|------------|---------------
h1         | 6rem        | 300        | 1.167      | -0.01562em
h6         | 1.25rem     | 500        | 1.6        | 0.0075em
body1      | 1rem        | 400        | 1.5        | 0.00938em
body2      | 0.875rem    | 400        | 1.43       | 0.01071em
button     | 0.875rem    | 500        | 1.75       | 0.02857em (+ uppercase)
caption    | 0.75rem     | 400        | 1.66       | 0.03333em
```

### 3. --Typography-textAlign CSS 변수 제거

```js
// 원본: CSS 변수 경유
style={{ '--Typography-textAlign': align }}  // style에 변수 주입
// styled 내부: textAlign: 'var(--Typography-textAlign)'  // 변수 소비

// 간소화: 직접 적용
...(align !== 'inherit' && { textAlign: align })
```

### 4. noWrap 패턴

```js
...(noWrap && { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })
// 세 가지 CSS가 함께 작동해야 말줄임(...)이 동작
// width가 있는 block/inline-block 요소에서만 동작
```

### 5. gutterBottom

```js
...(gutterBottom && { marginBottom: '0.35em' })
// em 단위 → 폰트 크기에 비례한 여백
// h1(6rem)에서는 큰 여백, caption(0.75rem)에서는 작은 여백
```
