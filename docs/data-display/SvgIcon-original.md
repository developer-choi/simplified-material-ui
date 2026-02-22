# SvgIcon (Original)

## 핵심 역할

SVG 아이콘을 렌더링하는 기반 컴포넌트.
Material Icons 등 아이콘 라이브러리가 이 컴포넌트를 내부적으로 사용한다.
`color` prop으로 테마 팔레트 색상을, `fontSize`로 크기를, `titleAccess`로 접근성을 제공한다.

## 복잡도 요소

### 1. styled('svg') + memoTheme + 동적 팔레트 순회

```js
const SvgIconRoot = styled('svg')(
  memoTheme(({ theme }) => ({
    variants: [
      // fontSize 맵핑
      { props: { fontSize: 'small' }, style: { fontSize: theme.typography.pxToRem(20) } },
      { props: { fontSize: 'medium' }, style: { fontSize: theme.typography.pxToRem(24) } },
      { props: { fontSize: 'large' }, style: { fontSize: theme.typography.pxToRem(35) } },
      // 팔레트 전체 동적 순회
      ...Object.entries((theme.vars ?? theme).palette)
        .filter(([, value]) => value && value.main)
        .map(([color]) => ({
          props: { color },
          style: { color: (theme.vars ?? theme).palette?.[color]?.main },
        })),
      { props: { color: 'action' }, style: { color: theme.palette.action.active } },
      { props: { color: 'disabled' }, style: { color: theme.palette.action.disabled } },
    ],
  })),
);
```

`color` prop 지원을 위해 테마 팔레트를 런타임에 순회. primary, secondary, error, warning, info, success 등 모든 팔레트 색상이 자동 지원됨.

### 2. hasSvgAsChild 패턴

```js
const hasSvgAsChild = React.isValidElement(children) && children.type === 'svg';

// 렌더링:
{hasSvgAsChild ? children.props.children : children}  // 이중 래핑 방지
{...(hasSvgAsChild && children.props)}                 // svg props 병합
```

children이 `<svg>` 요소이면 그 자식을 꺼내 쓰고, props도 병합.
Heroicons 같은 외부 SVG 라이브러리 아이콘을 직접 전달하는 경우 처리.

### 3. more 객체 (viewBox 분기)

```js
const more = {};
if (!inheritViewBox) {
  more.viewBox = viewBox;
}
// <SvgIconRoot {...more} ...>
```

`inheritViewBox=true`이면 viewBox prop을 전달하지 않아 as 컴포넌트의 viewBox를 상속.

### 4. fill 조건부 적용

```js
{
  props: (props) => !props.hasSvgAsChild,
  style: { fill: 'currentColor' },
}
```

children이 svg가 아닐 때만 `fill: currentColor`. svg를 직접 넘기면 그 svg의 fill 속성을 사용.

### 5. instanceFontSize (ownerState 전용)

```js
instanceFontSize: inProps.fontSize,  // ownerState에만 사용, 테마 오버라이드 감지용
```
