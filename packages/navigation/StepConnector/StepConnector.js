'use client';
import * as React from 'react';
import StepperContext from '../Stepper/StepperContext';
import StepContext from '../Step/StepContext';

const StepConnector = React.forwardRef(function StepConnector(props, ref) {
  const { className, style, ...other } = props;

  const { orientation = 'horizontal' } = React.useContext(StepperContext);
  const { active, completed } = React.useContext(StepContext);

  const lineColor = (active || completed) ? '#1976d2' : '#bdbdbd';

  return (
    <div
      className={className}
      ref={ref}
      style={{
        flex: '1 1 auto',
        ...(orientation === 'vertical' && { marginLeft: 12 }),
        ...style,
      }}
      {...other}
    >
      <span
        style={{
          display: 'block',
          borderColor: lineColor,
          ...(orientation === 'horizontal'
            ? { borderTopStyle: 'solid', borderTopWidth: 1 }
            : { borderLeftStyle: 'solid', borderLeftWidth: 1, minHeight: 24 }
          ),
        }}
      />
    </div>
  );
});

export default StepConnector;
