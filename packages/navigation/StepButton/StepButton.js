'use client';
import * as React from 'react';
import StepLabel from '../StepLabel';
import StepperContext from '../Stepper/StepperContext';
import StepContext from '../Step/StepContext';

const StepButton = React.forwardRef(function StepButton(props, ref) {
  const { children, className, icon, optional, style, ...other } = props;

  const { disabled, active } = React.useContext(StepContext);
  const { orientation } = React.useContext(StepperContext);

  return (
    <button
      className={className}
      ref={ref}
      disabled={disabled}
      aria-current={active ? 'step' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: orientation === 'vertical' ? 'flex-start' : 'center',
        background: 'none',
        border: 0,
        cursor: 'inherit',
        outline: 0,
        padding: 0,
        textDecoration: 'none',
        width: '100%',
        boxSizing: 'content-box',
        ...(orientation === 'vertical'
          ? { padding: '8px', margin: '-8px' }
          : { padding: '24px 16px', margin: '-24px -16px' }),
        ...style,
      }}
      {...other}
    >
      <StepLabel icon={icon} optional={optional}>{children}</StepLabel>
    </button>
  );
});

export default StepButton;
