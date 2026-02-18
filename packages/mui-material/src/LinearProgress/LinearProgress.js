'use client';
import * as React from 'react';

const TRANSITION_DURATION = 4; // seconds

const keyframeStyles = `
  @keyframes mui-linear-progress-indeterminate1 {
    0%   { left: -35%;  right: 100%; }
    60%  { left: 100%;  right: -90%; }
    100% { left: 100%;  right: -90%; }
  }
  @keyframes mui-linear-progress-indeterminate2 {
    0%   { left: -200%; right: 100%; }
    60%  { left: 107%;  right: -8%; }
    100% { left: 107%;  right: -8%; }
  }
  @keyframes mui-linear-progress-buffer {
    0%   { opacity: 1; background-position: 0 -23px; }
    60%  { opacity: 0; background-position: 0 -23px; }
    100% { opacity: 1; background-position: -200px -23px; }
  }
`;

function LinearProgress(props) {
  const {
    value,
    valueBuffer,
    variant = 'indeterminate',
    ...other
  } = props;

  const rootProps = {};
  const inlineStyles = { bar1: {}, bar2: {} };

  if (variant === 'determinate' || variant === 'buffer') {
    if (value !== undefined) {
      rootProps['aria-valuenow'] = Math.round(value);
      rootProps['aria-valuemin'] = 0;
      rootProps['aria-valuemax'] = 100;
      const transform = value - 100;
      inlineStyles.bar1.transform = `translateX(${transform}%)`;
    }
  }
  if (variant === 'buffer') {
    if (valueBuffer !== undefined) {
      const transform = (valueBuffer || 0) - 100;
      inlineStyles.bar2.transform = `translateX(${transform}%)`;
    }
  }

  const isIndeterminate = variant === 'indeterminate';
  const isDeterminate = variant === 'determinate';
  const isBuffer = variant === 'buffer';

  return (
    <>
      <style>{keyframeStyles}</style>
      <span
        role="progressbar"
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'block',
          height: 4,
          zIndex: 0,
          backgroundColor: isBuffer ? 'transparent' : 'rgba(25, 118, 210, 0.38)',
        }}
        {...rootProps}
        {...other}
      >
        {isBuffer && (
          <span style={{
            position: 'absolute',
            marginTop: 0,
            height: '100%',
            width: '100%',
            backgroundSize: '10px 10px',
            backgroundPosition: '0 -23px',
            backgroundImage: 'radial-gradient(rgba(25, 118, 210, 0.38) 0%, rgba(25, 118, 210, 0.38) 16%, transparent 42%)',
            animation: 'mui-linear-progress-buffer 3s infinite linear',
          }} />
        )}
        <span style={{
          width: isIndeterminate ? 'auto' : '100%',
          position: 'absolute',
          left: 0,
          bottom: 0,
          top: 0,
          backgroundColor: '#1976d2',
          transformOrigin: 'left',
          transition: (isDeterminate || isBuffer)
            ? `transform .${TRANSITION_DURATION}s linear`
            : 'transform 0.2s linear',
          zIndex: isBuffer ? 1 : undefined,
          animation: isIndeterminate
            ? 'mui-linear-progress-indeterminate1 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite'
            : undefined,
          ...inlineStyles.bar1,
        }} />
        {!isDeterminate && (
          <span style={{
            width: isIndeterminate ? 'auto' : '100%',
            position: 'absolute',
            left: 0,
            bottom: 0,
            top: 0,
            backgroundColor: isBuffer ? 'rgba(25, 118, 210, 0.38)' : '#1976d2',
            transformOrigin: 'left',
            transition: isBuffer
              ? `transform .${TRANSITION_DURATION}s linear`
              : 'transform 0.2s linear',
            animation: isIndeterminate
              ? 'mui-linear-progress-indeterminate2 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite'
              : undefined,
            ...inlineStyles.bar2,
          }} />
        )}
      </span>
    </>
  );
}

export default LinearProgress;
