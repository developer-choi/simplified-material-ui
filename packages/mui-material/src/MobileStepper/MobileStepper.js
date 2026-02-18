'use client';
import * as React from 'react';
import Paper from '../../../surfaces/Paper';
import LinearProgress from '../LinearProgress';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';


const MobileStepperRoot = styled(Paper, {
  name: 'MuiMobileStepper',
  slot: 'Root',
})(
  memoTheme(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: (theme.vars || theme).palette.background.default,
    padding: 8,
    variants: [
      {
        props: ({ position }) => position === 'top' || position === 'bottom',
        style: {
          position: 'fixed',
          left: 0,
          right: 0,
          zIndex: (theme.vars || theme).zIndex.mobileStepper,
        },
      },
      {
        props: { position: 'top' },
        style: { top: 0 },
      },
      {
        props: { position: 'bottom' },
        style: { bottom: 0 },
      },
    ],
  })),
);

const MobileStepperDots = styled('div', {
  name: 'MuiMobileStepper',
  slot: 'Dots',
})({
  variants: [
    {
      props: { variant: 'dots' },
      style: {
        display: 'flex',
        flexDirection: 'row',
      },
    },
  ],
});

const MobileStepperDot = styled('div', {
  name: 'MuiMobileStepper',
  slot: 'Dot',
  shouldForwardProp: (prop) => prop !== 'dotActive',
})(
  memoTheme(({ theme }) => ({
    variants: [
      {
        props: { variant: 'dots' },
        style: {
          transition: theme.transitions.create('background-color', {
            duration: theme.transitions.duration.shortest,
          }),
          backgroundColor: (theme.vars || theme).palette.action.disabled,
          borderRadius: '50%',
          width: 8,
          height: 8,
          margin: '0 2px',
        },
      },
      {
        props: { variant: 'dots', dotActive: true },
        style: {
          backgroundColor: (theme.vars || theme).palette.primary.main,
        },
      },
    ],
  })),
);

const MobileStepperProgress = styled(LinearProgress, {
  name: 'MuiMobileStepper',
  slot: 'Progress',
})({
  variants: [
    {
      props: { variant: 'progress' },
      style: {
        width: '50%',
      },
    },
  ],
});

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

  const ownerState = {
    ...props,
    activeStep,
    position,
    variant,
  };

  let value;
  if (variant === 'progress') {
    if (steps === 1) {
      value = 100;
    } else {
      value = Math.ceil((activeStep / (steps - 1)) * 100);
    }
  }

  return (
    <MobileStepperRoot square elevation={0} ownerState={ownerState} {...other}>
      {backButton}
      {variant === 'text' && (
        <React.Fragment>
          {activeStep + 1} / {steps}
        </React.Fragment>
      )}

      {variant === 'dots' && (
        <MobileStepperDots ownerState={ownerState}>
          {[...new Array(steps)].map((_, index) => (
            <MobileStepperDot
              key={index}
              ownerState={ownerState}
              dotActive={index === activeStep}
            />
          ))}
        </MobileStepperDots>
      )}

      {variant === 'progress' && (
        <MobileStepperProgress
          ownerState={ownerState}
          variant="determinate"
          value={value}
        />
      )}

      {nextButton}
    </MobileStepperRoot>
  );
}

export default MobileStepper;
