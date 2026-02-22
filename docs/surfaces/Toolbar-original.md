# Toolbar (Original)

## 핵심 역할

AppBar 내부에서 주로 사용되는 수평 레이아웃 래퍼.
`display: flex + alignItems: center` 기반으로 좌우 패딩(gutters)과 최소 높이(variant)를 제공한다.

## 복잡도 요소

### 1. styled('div') + memoTheme + 반응형 gutters

```js
const ToolbarRoot = styled('div')(
  memoTheme(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    variants: [
      {
        props: ({ ownerState }) => !ownerState.disableGutters,
        style: {
          paddingLeft: theme.spacing(2),   // 16px (mobile)
          paddingRight: theme.spacing(2),
          [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing(3), // 24px (tablet+)
            paddingRight: theme.spacing(3),
          },
        },
      },
      {
        props: { variant: 'dense' },
        style: { minHeight: 48 },
      },
      {
        props: { variant: 'regular' },
        style: theme.mixins.toolbar,  // minHeight: 56 + 반응형 breakpoints
      },
    ],
  })),
);
```

gutters 패딩이 sm 브레이크포인트에서 16px → 24px로 변경.
`theme.mixins.toolbar`는 다음을 포함:
```js
// mixins.toolbar =
{
  minHeight: 56,
  '@media (min-width:0px)': { '@media (orientation: landscape)': { minHeight: 48 } },
  '@media (min-width:600px)': { minHeight: 64 },
}
```

### 2. component 폴리모피즘

```jsx
<ToolbarRoot as={component} ...>
// component = 'div' (기본값), 또는 사용자 정의 컴포넌트
```

`as` prop으로 렌더링 요소를 교체 가능. `header`, `nav` 등으로 사용.

### 3. variant 시스템

```js
variant = 'regular' | 'dense'
// regular: theme.mixins.toolbar (minHeight 56 + breakpoints)
// dense:   minHeight 48 (콤팩트 모드)
```

### 4. disableGutters

```js
disableGutters = false (기본)
// true이면 paddingLeft/paddingRight 제거
```
