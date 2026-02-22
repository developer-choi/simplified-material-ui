import * as React from 'react';
import StepLabel from './index';

const SlotComponentRef = React.forwardRef<HTMLDivElement>((props, ref) => {
  return <div />;
});

<StepLabel
  slots={{
    label: 'span',
    stepIcon: 'div',
  }}
>
  Step One
</StepLabel>;

<StepLabel
  slots={{
    label: SlotComponentRef,
    stepIcon: SlotComponentRef,
  }}
>
  Step One
</StepLabel>;
