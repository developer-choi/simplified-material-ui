# StepConnector (Original)

## 핵심 역할

Stepper 내 Step 사이에 렌더링되는 시각적 연결선(선분). `StepperContext`에서 orientation/alternativeLabel을, `StepContext`에서 active/completed/disabled 상태를 읽어 스타일을 결정한다.

## 원본 코드 (핵심 부분)

```js
'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import capitalize from '../utils/capitalize';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import StepperContext from '../Stepper/StepperContext';
import StepContext from '../Step/StepContext';
import { getStepConnectorUtilityClass } from './stepConnectorClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, orientation, alternativeLabel, active, completed, disabled } = ownerState;
  const slots = {
    root: ['root', orientation, alternativeLabel && 'alternativeLabel', active && 'active', completed && 'completed', disabled && 'disabled'],
    line: ['line', `line${capitalize(orientation)}`],  // 예: 'lineHorizontal', 'lineVertical'
  };
  return composeClasses(slots, getStepConnectorUtilityClass, classes);
};

const StepConnectorRoot = styled('div', { name: 'MuiStepConnector', slot: 'Root', overridesResolver: ... })({
  flex: '1 1 auto',
  variants: [
    { props: { orientation: 'vertical' }, style: { marginLeft: 12 } },
    {
      props: { alternativeLabel: true },
      style: { position: 'absolute', top: 12, left: 'calc(-50% + 20px)', right: 'calc(50% + 20px)' },
    },
  ],
});

const StepConnectorLine = styled('span', { name: 'MuiStepConnector', slot: 'Line', overridesResolver: ... })(
  memoTheme(({ theme }) => {
    const borderColor = theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[600];
    return {
      display: 'block',
      borderColor: theme.vars ? theme.vars.palette.StepConnector.border : borderColor,
      variants: [
        { props: { orientation: 'horizontal' }, style: { borderTopStyle: 'solid', borderTopWidth: 1 } },
        { props: { orientation: 'vertical' }, style: { borderLeftStyle: 'solid', borderLeftWidth: 1, minHeight: 24 } },
      ],
    };
  }),
);

const StepConnector = React.forwardRef(function StepConnector(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiStepConnector' });
  const { className, ...other } = props;

  const { alternativeLabel, orientation = 'horizontal' } = React.useContext(StepperContext);
  const { active, disabled, completed } = React.useContext(StepContext);

  const ownerState = { ...props, alternativeLabel, orientation, active, completed, disabled };
  const classes = useUtilityClasses(ownerState);

  return (
    <StepConnectorRoot className={clsx(classes.root, className)} ref={ref} ownerState={ownerState} {...other}>
      <StepConnectorLine className={classes.line} ownerState={ownerState} />
    </StepConnectorRoot>
  );
});
```

## 복잡도 요소

### 1. styled 시스템 × 2
두 개의 styled 컴포넌트(`StepConnectorRoot`, `StepConnectorLine`)를 각각 정의하고 `ownerState`를 prop으로 전달해 variants를 동작시킨다.

### 2. memoTheme — 테마 기반 색상
```js
// 라이트/다크 모드 + CSS vars 모드 3가지 경우 처리
const borderColor = theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[600];
borderColor: theme.vars ? theme.vars.palette.StepConnector.border : borderColor
```

### 3. 클래스 시스템 + capitalize
- `line${capitalize(orientation)}` → `lineHorizontal` / `lineVertical`
- 상태 조합: orientation × alternativeLabel × active × completed × disabled

### 4. alternativeLabel 절대 위치 배치
```css
/* alternativeLabel=true일 때 connector를 Step 위에 절대 위치로 배치 */
position: absolute;
top: 12px;
left: calc(-50% + 20px);
right: calc(50% + 20px);
```
Step 내부에서 connector가 렌더링되는 방식이 달라짐 (Step.js에서 alternativeLabel 분기).

### 5. Context 이중 소비
- `StepperContext`: `alternativeLabel`, `orientation`
- `StepContext`: `active`, `disabled`, `completed`

→ 두 컨텍스트의 값을 합쳐서 `ownerState`를 만들고, 이를 styled 컴포넌트에 전달.
