# Stepper (Original)

## 핵심 역할

여러 `<Step>`을 순서대로 나열하는 컨테이너. `activeStep`을 기준으로 각 Step의 active/completed/disabled 상태를 Context를 통해 하위 컴포넌트에 전달한다.

## 원본 코드

```js
'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import integerPropType from '@mui/utils/integerPropType';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '../zero-styled';
import { useDefaultProps } from '../DefaultPropsProvider';
import { getStepperUtilityClass } from './stepperClasses';
import StepConnector from '../StepConnector';
import StepperContext from './StepperContext';

const useUtilityClasses = (ownerState) => {
  const { orientation, nonLinear, alternativeLabel, classes } = ownerState;
  const slots = {
    root: ['root', orientation, nonLinear && 'nonLinear', alternativeLabel && 'alternativeLabel'],
  };

  return composeClasses(slots, getStepperUtilityClass, classes);
};

const StepperRoot = styled('div', {
  name: 'MuiStepper',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.root,
      styles[ownerState.orientation],
      ownerState.alternativeLabel && styles.alternativeLabel,
      ownerState.nonLinear && styles.nonLinear,
    ];
  },
})({
  display: 'flex',
  variants: [
    {
      props: { orientation: 'horizontal' },
      style: { flexDirection: 'row', alignItems: 'center' },
    },
    {
      props: { orientation: 'vertical' },
      style: { flexDirection: 'column' },
    },
    {
      props: { alternativeLabel: true },
      style: { alignItems: 'flex-start' },
    },
  ],
});

const defaultConnector = <StepConnector />;

const Stepper = React.forwardRef(function Stepper(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiStepper' });
  const {
    activeStep = 0,
    alternativeLabel = false,
    children,
    className,
    component = 'div',
    connector = defaultConnector,
    nonLinear = false,
    orientation = 'horizontal',
    ...other
  } = props;

  const ownerState = { ...props, nonLinear, alternativeLabel, orientation, component };
  const classes = useUtilityClasses(ownerState);

  const childrenArray = React.Children.toArray(children).filter(Boolean);
  const steps = childrenArray.map((step, index) => {
    return React.cloneElement(step, {
      index,
      last: index + 1 === childrenArray.length,
      ...step.props,
    });
  });

  const contextValue = React.useMemo(
    () => ({ activeStep, alternativeLabel, connector, nonLinear, orientation }),
    [activeStep, alternativeLabel, connector, nonLinear, orientation],
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <StepperRoot
        as={component}
        ownerState={ownerState}
        className={clsx(classes.root, className)}
        ref={ref}
        {...other}
      >
        {steps}
      </StepperRoot>
    </StepperContext.Provider>
  );
});
```

## 복잡도 요소

### 1. styled 시스템
- `StepperRoot = styled('div', { name, slot, overridesResolver })` — CSS-in-JS 컴포넌트
- `variants` 배열: orientation × alternativeLabel 조합으로 스타일 분기
- `ownerState`를 styled 컴포넌트에 prop으로 전달해야 variants가 동작

### 2. 클래스 시스템
- `useUtilityClasses(ownerState)` → `composeClasses` → BEM 형태 클래스 문자열 생성
- `classes` prop으로 외부에서 클래스 오버라이드 가능
- `clsx(classes.root, className)`으로 병합

### 3. 테마 시스템
- `useDefaultProps` — 테마에서 컴포넌트 기본값 오버라이드 가능
- `{ props: inProps, name: 'MuiStepper' }` 패턴

### 4. 복잡한 Props
| prop | 역할 | 복잡도 |
|------|------|--------|
| `component` | 루트 태그를 교체 (`as={component}`) | 중 |
| `connector` | Step 사이 구분선 커스터마이징 | 중 |
| `alternativeLabel` | 아이콘 아래 라벨 배치 (horizontal 전용) | 고 |
| `nonLinear` | 비선형 Stepper (임의 순서 이동 허용) | 중 |

### 5. children 주입 패턴
```js
// cloneElement로 각 Step에 index, last 주입
const steps = childrenArray.map((step, index) =>
  React.cloneElement(step, { index, last: index + 1 === childrenArray.length, ...step.props })
);
```
`...step.props`를 뒤에 spread해서 사용자가 직접 전달한 index/last가 우선시되도록 함.

### 6. StepperContext
```js
// Context 전달값: 모든 하위 컴포넌트(Step, StepConnector, StepLabel 등)가 소비
{ activeStep, alternativeLabel, connector, nonLinear, orientation }
```
`useMemo`로 참조 안정성 확보 → 불필요한 하위 리렌더 방지.
