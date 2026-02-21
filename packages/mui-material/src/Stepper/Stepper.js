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
