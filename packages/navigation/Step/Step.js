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
