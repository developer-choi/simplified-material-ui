# SvgIcon (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';

const fontSizeMap = {
  inherit: 'inherit',
  small: '1.25rem',
  medium: '1.5rem',
  large: '2.1875rem',
};

const SvgIcon = React.forwardRef(function SvgIcon(props, ref) {
  const {
    children,
    className,
    fontSize = 'medium',
    htmlColor,
    inheritViewBox = false,
    titleAccess,
    viewBox = '0 0 24 24',
    style,
    ...other
  } = props;

  const hasSvgAsChild = React.isValidElement(children) && children.type === 'svg';

  return (
    <svg
      className={className}
      focusable="false"
      color={htmlColor}
      aria-hidden={titleAccess ? undefined : true}
      role={titleAccess ? 'img' : undefined}
      ref={ref}
      {...(!inheritViewBox && { viewBox })}
      style={{
        userSelect: 'none',
        width: '1em',
        height: '1em',
        display: 'inline-block',
        flexShrink: 0,
        fill: hasSvgAsChild ? undefined : 'currentColor',
        fontSize: fontSizeMap[fontSize] ?? fontSize,
        ...style,
      }}
      {...other}
      {...(hasSvgAsChild && children.props)}
    >
      {hasSvgAsChild ? children.props.children : children}
      {titleAccess ? <title>{titleAccess}</title> : null}
    </svg>
  );
});

export default SvgIcon;
```

**247줄 → 54줄 (−78%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `SvgIconRoot` styled('svg') + memoTheme | `<svg>` + inline style로 대체 |
| `styled`, `memoTheme`, `capitalize` import | styled 제거 |
| `color` prop (테마 팔레트 매핑) | 테마 의존 제거 — `htmlColor`로 대체 |
| 팔레트 동적 순회 variants | 테마 의존 제거 |
| `component` prop | 항상 `<svg>`로 고정 |
| `instanceFontSize` | ownerState 제거로 불필요 |
| `useUtilityClasses`, `composeClasses`, `getSvgIconUtilityClass` | 클래스 시스템 제거 |
| `useDefaultProps`, `PropTypes`, `ownerState` | 테마/타입 시스템 제거 |
| `SvgIcon.muiName` | 라이브러리 내부 식별자 |
| fill 애니메이션 transition | 테마 transitions 제거 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `hasSvgAsChild` 감지 로직 | `<svg>` children 처리 — 핵심 패턴 |
| `fontSize` + `fontSizeMap` | 아이콘 크기 제어 |
| `htmlColor` prop | 직접 색상 지정 |
| `titleAccess` prop | 접근성 (role="img", `<title>`) |
| `inheritViewBox` prop | 커스텀 svg viewBox 상속 |
| `viewBox` prop | SVG 좌표계 설정 |
| `focusable="false"` | SVG 탭 포커스 방지 |
| `aria-hidden` / `role` | 접근성 |

## 핵심 학습 포인트

### 1. hasSvgAsChild 패턴

```jsx
const hasSvgAsChild = React.isValidElement(children) && children.type === 'svg';

// 렌더:
{hasSvgAsChild ? children.props.children : children}
{...(hasSvgAsChild && children.props)}
```

```jsx
// 사용 예: 외부 SVG 직접 전달
<SvgIcon>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="..." />
  </svg>
</SvgIcon>

// 내부에서 children.props.children = <path d="..." /> 를 꺼내서 렌더
// children.props (viewBox, fill, stroke 등)를 <svg>에 병합
```

이중 `<svg>` 래핑을 방지하면서 외부 SVG 라이브러리(Heroicons 등)와 호환.

### 2. fill 조건부

```jsx
fill: hasSvgAsChild ? undefined : 'currentColor'
// 일반 path children → fill: currentColor (텍스트/아이콘 색 상속)
// svg children → fill 지정 안 함 (원본 svg의 fill 속성 사용)
```

### 3. fontSizeMap — 테마 없는 pxToRem 대체

```js
// 원본: theme.typography.pxToRem(20) → '1.25rem'
// 간소화: 하드코딩
const fontSizeMap = {
  small: '1.25rem',  // 20px
  medium: '1.5rem',  // 24px (기본)
  large: '2.1875rem',// 35px
};
// 알 수 없는 값은 그대로 전달: fontSizeMap[fontSize] ?? fontSize
```

### 4. inheritViewBox 패턴

```jsx
{...(!inheritViewBox && { viewBox })}
// false(기본): viewBox="0 0 24 24" 설정 → 표준 Material 좌표계
// true: viewBox prop 없음 → as 컴포넌트의 viewBox 상속
```

### 5. color vs htmlColor

```jsx
// 원본: color prop → 테마 팔레트 class (primary, error, ...)
// 간소화: color prop 제거, htmlColor만 지원
<SvgIcon htmlColor="#e91e63" />
// → <svg color="#e91e63"> → fill: currentColor이면 이 색상 사용
```

### 6. 접근성

```jsx
focusable="false"                         // IE에서 SVG가 포커스 받는 버그 방지
aria-hidden={titleAccess ? undefined : true}  // 장식 아이콘은 숨김
role={titleAccess ? 'img' : undefined}    // 의미 있는 아이콘은 img role
{titleAccess ? <title>{titleAccess}</title> : null}  // 스크린 리더 텍스트
```
