'use client';
import * as React from 'react';
import Paper from '../../../surfaces/Paper';
import LinearProgress from '../LinearProgress';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import useSlot from '../utils/useSlot';


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

const MobileStepper = React.forwardRef(function MobileStepper(props, ref) {
  const {
    activeStep = 0,
    backButton,
    LinearProgressProps,
    nextButton,
    position = 'bottom',
    steps,
    variant = 'dots',
    slots = {},
    slotProps = {},
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

  const externalForwardedProps = {
    slots,
    slotProps: {
      progress: LinearProgressProps,
      ...slotProps,
    },
  };

  const [RootSlot, rootSlotProps] = useSlot('root', {
    ref,
    elementType: MobileStepperRoot,
    shouldForwardComponentProp: true,
    externalForwardedProps: {
      ...externalForwardedProps,
      ...other,
    },
    ownerState,
    additionalProps: {
      square: true,
      elevation: 0,
    },
  });

  const [DotsSlot, dotsSlotProps] = useSlot('dots', {
    elementType: MobileStepperDots,
    externalForwardedProps,
    ownerState,
  });

  const [DotSlot, dotSlotProps] = useSlot('dot', {
    elementType: MobileStepperDot,
    externalForwardedProps,
    ownerState,
  });

  const [ProgressSlot, progressSlotProps] = useSlot('progress', {
    elementType: MobileStepperProgress,
    shouldForwardComponentProp: true,
    externalForwardedProps,
    ownerState,
    additionalProps: {
      value,
      variant: 'determinate',
    },
  });

  return (
    <RootSlot {...rootSlotProps}>
      {backButton}
      {variant === 'text' && (
        <React.Fragment>
          {activeStep + 1} / {steps}
        </React.Fragment>
      )}

      {variant === 'dots' && (
        <DotsSlot {...dotsSlotProps}>
          {[...new Array(steps)].map((_, index) => (
            <DotSlot
              key={index}
              {...dotSlotProps}
              dotActive={index === activeStep}
            />
          ))}
        </DotsSlot>
      )}

      {variant === 'progress' && <ProgressSlot {...progressSlotProps} />}

      {nextButton}
    </RootSlot>
  );
});

export default MobileStepper;
