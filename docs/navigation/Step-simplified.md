# Step (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';
import StepperContext from '../Stepper/StepperContext';
import StepContext from './StepContext';
import StepConnector from '../StepConnector';

const Step = React.forwardRef(function Step(props, ref) {
  const { children, className, index, last, style, ...other } = props;

  const { activeStep, orientation } = React.useContext(StepperContext);

  const active = activeStep === index;
  const completed = activeStep > index;
  const disabled = activeStep < index;

  const contextValue = React.useMemo(
    () => ({ index, last, icon: index + 1, active, completed, disabled }),
    [index, last, active, completed, disabled],
  );

  const stepContent = (
    <div
      className={className}
      ref={ref}
      style={{
        ...(orientation === 'horizontal' && { paddingLeft: 8, paddingRight: 8 }),
        ...style,
      }}
      {...other}
    >
      {children}
    </div>
  );

  return (
    <StepContext.Provider value={contextValue}>
      {index !== 0 ? (
        <React.Fragment>
          <StepConnector />
          {stepContent}
        </React.Fragment>
      ) : stepContent}
    </StepContext.Provider>
  );
});

export default Step;
```

**192줄 → 47줄 (−76%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `StepRoot` styled 컴포넌트 | `div` + inline style로 대체 |
| `alternativeLabel` context 소비 + 분기 로직 | Stepper에서 이미 제거됨 |
| `nonLinear` context 소비 | Stepper에서 이미 제거됨 |
| `connector` context 소비 | `<StepConnector />` 직접 import로 대체 |
| `active/completed/disabled` prop 오버라이드 | `nonLinear` 제거로 사용 목적 사라짐 |
| `expanded` prop | 엣지 케이스, 핵심 개념과 무관 |
| `component` prop | 항상 `div`로 고정 |
| `useUtilityClasses`, `composeClasses`, `classes` | 클래스 시스템 제거 |
| `useDefaultProps`, `PropTypes`, `ownerState` | 테마/타입 시스템 제거 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `StepperContext` 소비 (`activeStep`, `orientation`) | 상태 계산 + 가로/세로 패딩 결정 |
| `StepContext.Provider` | StepLabel, StepContent, StepConnector의 핵심 통신 수단 |
| `active/completed/disabled` 자동 계산 | Stepper 핵심 기능 |
| `icon: index + 1` | StepLabel이 번호 표시에 사용 |
| `<StepConnector />` 직접 렌더링 | Step 사이 시각적 구분선 |
| `React.useMemo` | 불필요한 하위 리렌더 방지 |

## 핵심 학습 포인트

### 1. activeStep → 상태 자동 계산
```js
const active   = activeStep === index;  // 현재 단계
const completed = activeStep > index;   // 이전 단계
const disabled  = activeStep < index;   // 미래 단계
```
Stepper가 `activeStep`만 관리하면 Step이 알아서 자신의 상태를 계산한다.

### 2. Context 체인: Stepper → Step → (StepLabel, StepContent, StepConnector)
```
StepperContext ──→ Step 소비
                         │
                    StepContext ──→ StepLabel 소비
                                   StepContent 소비
                                   StepConnector 소비
```

### 3. StepConnector를 Step 안에서 직접 렌더링
```jsx
// index !== 0인 경우에만 앞에 connector 삽입
// StepContext.Provider 안에서 렌더링되므로 active/completed 색상 적용됨
{index !== 0 ? (
  <React.Fragment>
    <StepConnector />  {/* ← 이 step의 active/completed 색상 반영 */}
    {stepContent}
  </React.Fragment>
) : stepContent}
```
