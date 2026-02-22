# StepContent (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';
import StepContext from '../Step/StepContext';

const StepContent = React.forwardRef(function StepContent(props, ref) {
  const { children, className, style, ...other } = props;

  const { active, last } = React.useContext(StepContext);

  return (
    <div
      className={className}
      ref={ref}
      style={{
        marginLeft: 12,
        paddingLeft: 20,
        paddingRight: 8,
        borderLeft: last ? 'none' : '1px solid #bdbdbd',
        ...style,
      }}
      {...other}
    >
      {active && children}
    </div>
  );
});

export default StepContent;
```

**189줄 → 28줄 (−85%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `StepContentRoot` styled 컴포넌트 | `div` + inline style로 대체 |
| `StepContentTransition` styled Collapse | 애니메이션 제거 |
| `Collapse` import | 애니메이션 제거 |
| `memoTheme` (border color) | 하드코딩(`#bdbdbd`)으로 대체 |
| `useSlot` ('transition' slot) | Slot 시스템 제거 |
| `slots`, `slotProps` props | Slot 시스템 제거 |
| `TransitionComponent` prop (deprecated) | 애니메이션 제거 |
| `transitionDuration` prop | 애니메이션 제거 |
| `TransitionProps` prop (deprecated) | 애니메이션 제거 |
| `expanded` context 소비 | Step 간소화에서 StepContext에서 이미 제거됨 |
| `orientation` context 소비 | dev 경고 제거 (vertical 전용 경고 불필요) |
| `useUtilityClasses`, `composeClasses`, `classes` | 클래스 시스템 제거 |
| `useDefaultProps`, `PropTypes`, `ownerState` | 테마/타입 시스템 제거 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `StepContext` 소비 (`active`, `last`) | active: 콘텐츠 표시/숨김, last: 마지막 step 하단 선 제거 |
| `{active && children}` | 조건부 렌더링 — Collapse 대체, 핵심 동작 |
| `last` → `borderLeft: 'none'` | 마지막 step에서 세로선 제거 (UX) |

## 핵심 학습 포인트

### 1. Collapse → 조건부 렌더링

```jsx
// 원본: 애니메이션 포함
<Collapse in={active || expanded} timeout={transitionDuration} unmountOnExit>
  {children}
</Collapse>

// 간소화: 즉시 표시/숨김
{active && children}
```

애니메이션은 제거하되 "active일 때만 보여주는" 핵심 동작은 유지.

### 2. last → 세로선 제거

```js
borderLeft: last ? 'none' : '1px solid #bdbdbd'
// 마지막 step의 StepContent는 아래로 이어지는 선이 없어야 함
```

`last`는 Step이 StepContext에 주입하는 값 (`last: index + 1 === childrenArray.length`).

### 3. 하드코딩 값 근거

| 원본 | 값 |
|---|---|
| `theme.palette.grey[400]` (light mode) | `#bdbdbd` |
| `marginLeft: 12` | 아이콘 중앙 정렬 (아이콘 너비 24px의 절반) |
| `paddingLeft: 8 + 12` | marginLeft + half icon = 20px |
| `paddingRight: 8` | 우측 여백 |

### 4. DOM 구조

```
<div>              ← StepContent root
                     marginLeft:12, paddingLeft:20, paddingRight:8
                     borderLeft: 세로선 (last가 아니면)
  {active && children}  ← active일 때만 렌더링
</div>
```
