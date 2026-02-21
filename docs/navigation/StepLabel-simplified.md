# StepLabel (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';
import StepContext from '../Step/StepContext';
import StepIcon from '../StepIcon';
import StepperContext from '../Stepper/StepperContext';

const StepLabel = React.forwardRef(function StepLabel(props, ref) {
  const {
    children,
    className,
    error = false,
    icon: iconProp,
    optional,
    style,
    ...other
  } = props;

  const { orientation } = React.useContext(StepperContext);
  const { active, disabled, completed, icon: iconContext } = React.useContext(StepContext);
  const icon = iconProp || iconContext;

  const labelColor = error
    ? '#d32f2f'
    : (active || completed)
      ? 'rgba(0, 0, 0, 0.87)'
      : 'rgba(0, 0, 0, 0.6)';

  return (
    <span
      className={className}
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        ...(orientation === 'vertical' && { textAlign: 'left', padding: '8px 0' }),
        ...(disabled && { cursor: 'default' }),
        ...style,
      }}
      {...other}
    >
      {icon && (
        <span style={{ flexShrink: 0, display: 'flex', paddingRight: 8 }}>
          <StepIcon active={active} completed={completed} error={error} icon={icon} />
        </span>
      )}
      <span style={{ width: '100%', color: 'rgba(0, 0, 0, 0.6)' }}>
        {children && (
          <span
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: labelColor,
              ...((active || completed) && { fontWeight: 500 }),
            }}
          >
            {children}
          </span>
        )}
        {optional}
      </span>
    </span>
  );
});

export default StepLabel;
```

**301줄 → 63줄 (−79%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| styled × 4 + memoTheme | inline style로 대체, 테마 의존 제거 |
| Slot 시스템 (useSlot × 3) | 항상 StepIcon 직접 사용 |
| `slots`, `slotProps`, `componentsProps` | Slot 시스템 제거 |
| `StepIconComponent`, `StepIconProps` (deprecated) | Slot 시스템 제거 |
| `alternativeLabel` context 소비 + 분기 | Stepper에서 이미 제거됨 |
| `useUtilityClasses`, `composeClasses`, `classes` | 클래스 시스템 제거 |
| `useDefaultProps`, `PropTypes`, `ownerState` | 테마/타입 시스템 제거 |
| `StepLabel.muiName` | 라이브러리 내부 식별자 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `StepContext` 소비 (`active`, `disabled`, `completed`, `icon`) | 상태 및 아이콘 번호 — 핵심 |
| `StepperContext` 소비 (`orientation`) | vertical 패딩 적용 |
| `error` prop | 에러 상태 시각화 |
| `icon` prop | 아이콘 오버라이드 |
| `optional` prop | 보조 라벨 (자주 사용) |

## 핵심 학습 포인트

### 1. 아이콘 결정 로직
```js
const icon = iconProp || iconContext;
// Step에서 cloneElement로 주입한 icon: index + 1 (번호)
// 사용자가 icon prop으로 직접 전달하면 그게 우선
```

### 2. 상태 → 색상 변환
```js
const labelColor = error
  ? '#d32f2f'                    // 에러: 빨간
  : (active || completed)
    ? 'rgba(0, 0, 0, 0.87)'     // 활성/완료: 진한 검정
    : 'rgba(0, 0, 0, 0.6)';     // 비활성: 회색
```

### 3. DOM 구조
```
<span>                    ← root (flex row)
  <span>                  ← iconContainer
    <StepIcon />          ← 번호/체크/에러 아이콘
  </span>
  <span>                  ← labelContainer (회색)
    <span>{children}</span>  ← label (상태에 따라 색상)
    {optional}            ← 보조 텍스트
  </span>
</span>
```
