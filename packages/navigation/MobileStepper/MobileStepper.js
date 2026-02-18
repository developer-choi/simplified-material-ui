'use client';
import * as React from 'react';
import LinearProgress from '../../feedback/LinearProgress';

function MobileStepper(props) {
  const {
    activeStep = 0,
    backButton,
    nextButton,
    position = 'bottom',
    steps,
    variant = 'dots',
    ...other
  } = props;

  let value;
  if (variant === 'progress') {
    if (steps === 1) {
      value = 100;
    } else {
      value = Math.ceil((activeStep / (steps - 1)) * 100);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 8,
        ...(position !== 'static' && {
          position: 'fixed',
          left: 0,
          right: 0,
          zIndex: 1000,
          ...(position === 'top' ? { top: 0 } : { bottom: 0 }),
        }),
      }}
      {...other}
    >
      {backButton}
      {variant === 'text' && (
        <React.Fragment>
          {activeStep + 1} / {steps}
        </React.Fragment>
      )}

      {variant === 'dots' && (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {[...new Array(steps)].map((_, index) => (
            <div
              key={index}
              style={{
                borderRadius: '50%',
                width: 8,
                height: 8,
                margin: '0 2px',
                backgroundColor: index === activeStep ? '#1976d2' : 'rgba(0,0,0,0.26)',
              }}
            />
          ))}
        </div>
      )}

      {variant === 'progress' && (
        <LinearProgress variant="determinate" value={value} style={{ width: '50%' }} />
      )}

      {nextButton}
    </div>
  );
}

export default MobileStepper;
