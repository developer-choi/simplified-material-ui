'use client';
import * as React from 'react';
import { useRtl } from '@mui/system/RtlProvider';
import { keyframes, css, styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
const TRANSITION_DURATION = 4; // seconds
const indeterminate1Keyframe = keyframes`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`;

// This implementation is for supporting both Styled-components v4+ and Pigment CSS.
// A global animation has to be created here for Styled-components v4+ (https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#12).
// which can be done by checking typeof indeterminate1Keyframe !== 'string' (at runtime, Pigment CSS transform keyframes`` to a string).
const indeterminate1Animation =
  typeof indeterminate1Keyframe !== 'string'
    ? css`
        animation: ${indeterminate1Keyframe} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
      `
    : null;

const indeterminate2Keyframe = keyframes`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`;
const indeterminate2Animation =
  typeof indeterminate2Keyframe !== 'string'
    ? css`
        animation: ${indeterminate2Keyframe} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
      `
    : null;

const bufferKeyframe = keyframes`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`;
const bufferAnimation =
  typeof bufferKeyframe !== 'string'
    ? css`
        animation: ${bufferKeyframe} 3s infinite linear;
      `
    : null;


const LinearProgressRoot = styled('span', {
  name: 'MuiLinearProgress',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [styles.root, styles[ownerState.variant]];
  },
})(
  memoTheme(() => ({
    position: 'relative',
    overflow: 'hidden',
    display: 'block',
    height: 4,
    zIndex: 0,
    backgroundColor: 'rgba(25, 118, 210, 0.38)',
    '@media print': {
      colorAdjust: 'exact',
    },
    variants: [
      {
        props: { variant: 'buffer' },
        style: { backgroundColor: 'transparent' },
      },
    ],
  })),
);

const LinearProgressDashed = styled('span', {
  name: 'MuiLinearProgress',
  slot: 'Dashed',
  overridesResolver: (props, styles) => styles.dashed,
})(
  memoTheme(() => ({
    position: 'absolute',
    marginTop: 0,
    height: '100%',
    width: '100%',
    backgroundSize: '10px 10px',
    backgroundPosition: '0 -23px',
    backgroundImage: `radial-gradient(rgba(25, 118, 210, 0.38) 0%, rgba(25, 118, 210, 0.38) 16%, transparent 42%)`,
  })),
  bufferAnimation || {
    animation: `${bufferKeyframe} 3s infinite linear`,
  },
);

const LinearProgressBar1 = styled('span', {
  name: 'MuiLinearProgress',
  slot: 'Bar1',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.bar,
      styles.bar1,
      ownerState.variant === 'indeterminate' && styles.bar1Indeterminate,
      ownerState.variant === 'determinate' && styles.bar1Determinate,
      ownerState.variant === 'buffer' && styles.bar1Buffer,
    ];
  },
})(
  memoTheme(() => ({
    width: '100%',
    position: 'absolute',
    left: 0,
    bottom: 0,
    top: 0,
    backgroundColor: '#1976d2',
    transition: 'transform 0.2s linear',
    transformOrigin: 'left',
    variants: [
      {
        props: { variant: 'determinate' },
        style: {
          transition: `transform .${TRANSITION_DURATION}s linear`,
        },
      },
      {
        props: { variant: 'buffer' },
        style: {
          zIndex: 1,
          transition: `transform .${TRANSITION_DURATION}s linear`,
        },
      },
      {
        props: { variant: 'indeterminate' },
        style: {
          width: 'auto',
        },
      },
      {
        props: { variant: 'indeterminate' },
        style: indeterminate1Animation || {
          animation: `${indeterminate1Keyframe} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite`,
        },
      },
    ],
  })),
);

const LinearProgressBar2 = styled('span', {
  name: 'MuiLinearProgress',
  slot: 'Bar2',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.bar,
      styles.bar2,
      ownerState.variant === 'indeterminate' && styles.bar2Indeterminate,
      ownerState.variant === 'buffer' && styles.bar2Buffer,
    ];
  },
})(
  memoTheme(() => ({
    width: '100%',
    position: 'absolute',
    left: 0,
    bottom: 0,
    top: 0,
    backgroundColor: '#1976d2',
    transition: 'transform 0.2s linear',
    transformOrigin: 'left',
    variants: [
      {
        props: { variant: 'buffer' },
        style: {
          backgroundColor: 'rgba(25, 118, 210, 0.38)',
          transition: `transform .${TRANSITION_DURATION}s linear`,
        },
      },
      {
        props: { variant: 'indeterminate' },
        style: {
          width: 'auto',
        },
      },
      {
        props: { variant: 'indeterminate' },
        style: indeterminate2Animation || {
          animation: `${indeterminate2Keyframe} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite`,
        },
      },
    ],
  })),
);

/**
 * ## ARIA
 *
 * If the progress bar is describing the loading progress of a particular region of a page,
 * you should use `aria-describedby` to point to the progress bar, and set the `aria-busy`
 * attribute to `true` on that region until it has finished loading.
 */
const LinearProgress = React.forwardRef(function LinearProgress(props, ref) {
  const {
    value,
    valueBuffer,
    variant = 'indeterminate',
    ...other
  } = props;
  const ownerState = {
    ...props,
    variant,
  };

  const isRtl = useRtl();

  const rootProps = {};
  const inlineStyles = { bar1: {}, bar2: {} };

  if (variant === 'determinate' || variant === 'buffer') {
    if (value !== undefined) {
      rootProps['aria-valuenow'] = Math.round(value);
      rootProps['aria-valuemin'] = 0;
      rootProps['aria-valuemax'] = 100;
      let transform = value - 100;
      if (isRtl) {
        transform = -transform;
      }
      inlineStyles.bar1.transform = `translateX(${transform}%)`;
    } else if (process.env.NODE_ENV !== 'production') {
      console.error(
        'MUI: You need to provide a value prop ' +
          'when using the determinate or buffer variant of LinearProgress .',
      );
    }
  }
  if (variant === 'buffer') {
    if (valueBuffer !== undefined) {
      let transform = (valueBuffer || 0) - 100;
      if (isRtl) {
        transform = -transform;
      }
      inlineStyles.bar2.transform = `translateX(${transform}%)`;
    } else if (process.env.NODE_ENV !== 'production') {
      console.error(
        'MUI: You need to provide a valueBuffer prop ' +
          'when using the buffer variant of LinearProgress.',
      );
    }
  }

  return (
    <LinearProgressRoot
      ownerState={ownerState}
      role="progressbar"
      {...rootProps}
      ref={ref}
      {...other}
    >
      {variant === 'buffer' ? (
        <LinearProgressDashed ownerState={ownerState} />
      ) : null}
      <LinearProgressBar1
        ownerState={ownerState}
        style={inlineStyles.bar1}
      />
      {variant === 'determinate' ? null : (
        <LinearProgressBar2
          ownerState={ownerState}
          style={inlineStyles.bar2}
        />
      )}
    </LinearProgressRoot>
  );
});

export default LinearProgress;
