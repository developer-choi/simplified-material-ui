# Toolbar (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';

const Toolbar = React.forwardRef(function Toolbar(props, ref) {
  const {
    className,
    disableGutters = false,
    variant = 'regular',
    style,
    ...other
  } = props;

  return (
    <div
      className={className}
      ref={ref}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        ...(!disableGutters && { paddingLeft: 16, paddingRight: 16 }),
        ...(variant === 'dense' && { minHeight: 48 }),
        ...(variant === 'regular' && { minHeight: 56 }),
        ...style,
      }}
      {...other}
    />
  );
});

export default Toolbar;
```

**140줄 → 31줄 (−78%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `ToolbarRoot` styled('div') + memoTheme | `<div>` + inline style로 대체 |
| `styled`, `memoTheme` import | styled 제거 |
| `getToolbarUtilityClass` import | 클래스 시스템 제거 |
| `useUtilityClasses`, `composeClasses`, `classes` | 클래스 시스템 제거 |
| `component` prop | 항상 `<div>`로 고정 |
| `useDefaultProps`, `PropTypes`, `ownerState` | 테마/타입 시스템 제거 |
| 반응형 gutters (sm 브레이크포인트) | 16px 고정 단순화 |
| `theme.mixins.toolbar` (regular) | `minHeight: 56` 하드코딩 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `disableGutters` prop | gutters 여부 토글 — 실용적 |
| `variant` prop ('regular' \| 'dense') | AppBar 높이 개념 — minHeight 차이 학습 |
| `position: 'relative'` | 원본 스타일 유지 |
| `display: 'flex', alignItems: 'center'` | 핵심 레이아웃 |

## 핵심 학습 포인트

### 1. theme.mixins.toolbar → minHeight: 56 하드코딩

```js
// 원본: 반응형 minHeight
theme.mixins.toolbar = {
  minHeight: 56,
  '@media (orientation: landscape)': { minHeight: 48 },
  '@media (min-width:600px)': { minHeight: 64 },
}

// 간소화: 모바일 기본값만
minHeight: 56
```

Material Design 기준 AppBar 높이:
- mobile portrait: 56px → 하드코딩
- mobile landscape: 48px → 제거 (동일한 dense와 중복)
- tablet/desktop: 64px → 제거 (반응형 제거)

### 2. disableGutters 패턴

```jsx
...(!disableGutters && { paddingLeft: 16, paddingRight: 16 })
// false(기본): 패딩 추가
// true: 패딩 없음 → 엣지-to-엣지 레이아웃
```

### 3. variant → minHeight 분기

```jsx
...(variant === 'dense' && { minHeight: 48 }),
...(variant === 'regular' && { minHeight: 56 }),
// 두 조건 모두 false이면 minHeight 없음 (커스텀 variant 지원)
```

### 4. DOM 구조

```
<div>              ← Toolbar root
  display: flex    ← 자식 요소를 가로로 배치
  alignItems: center
  paddingLeft/Right: 16px  (gutters)
  minHeight: 56    (regular) / 48 (dense)

  {children}       ← 보통 IconButton + Typography + ...
</div>
```
