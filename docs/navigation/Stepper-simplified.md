# Stepper (Simplified)

## 간소화 결과

```js
'use client';
import * as React from 'react';
import StepperContext from './StepperContext';

const Stepper = React.forwardRef(function Stepper(props, ref) {
  const {
    activeStep = 0,
    children,
    className,
    orientation = 'horizontal',
    style,
    ...other
  } = props;

  const childrenArray = React.Children.toArray(children).filter(Boolean);
  const steps = childrenArray.map((step, index) => {
    return React.cloneElement(step, {
      index,
      last: index + 1 === childrenArray.length,
      ...step.props,
    });
  });

  const contextValue = React.useMemo(
    () => ({ activeStep, orientation }),
    [activeStep, orientation],
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        className={className}
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          alignItems: 'center',
          ...style,
        }}
        {...other}
      >
        {steps}
      </div>
    </StepperContext.Provider>
  );
});

export default Stepper;
```

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `styled(StepperRoot)` | inline style `div`로 대체 — CSS-in-JS 의존성 제거 |
| `useUtilityClasses`, `composeClasses` | 클래스 시스템 불필요 |
| `classes` prop | 클래스 시스템 제거로 불필요 |
| `useDefaultProps` | 파라미터 기본값으로 대체 |
| `PropTypes` | 학습 목적에 불필요한 복잡도 |
| `ownerState` | styled 제거로 불필요 |
| `component` prop | 항상 `div`로 고정 |
| `alternativeLabel` prop | 복잡한 레이아웃 변형, 제거로 단순화 |
| `nonLinear` prop | 엣지 케이스, 핵심 개념과 무관 |
| `connector` prop | StepConnector에서 직접 처리 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `StepperContext.Provider` | Step/StepLabel/StepConnector와의 핵심 통신 수단 |
| `activeStep` | Stepper의 핵심 기능 (현재 단계 추적) |
| `orientation` | horizontal/vertical 방향 — 핵심 레이아웃 기능 |
| `cloneElement(step, { index, last })` | 각 Step에 위치 정보 주입하는 핵심 패턴 |
| `React.useMemo` | 불필요한 Context 리렌더 방지 |

## 핵심 학습 포인트

### 1. cloneElement로 암묵적 props 주입
```js
// 사용자가 직접 전달하지 않아도 각 Step이 자신의 위치를 앎
React.cloneElement(step, {
  index,                              // 몇 번째 step인지
  last: index + 1 === total,          // 마지막 step인지
  ...step.props,                      // 사용자 props가 우선
})
```

### 2. Context로 하향 상태 전달
```js
// Stepper가 제공 → Step, StepLabel, StepConnector가 소비
<StepperContext.Provider value={{ activeStep, orientation }}>
  {steps}
</StepperContext.Provider>
```
prop drilling 없이 깊은 하위 컴포넌트가 상태를 구독할 수 있음.

### 3. orientation에 따른 스타일 분기
```js
style={{
  display: 'flex',
  flexDirection: orientation === 'vertical' ? 'column' : 'row',
  alignItems: 'center',
}}
```
단순 삼항 연산자로 horizontal/vertical 레이아웃 전환.
