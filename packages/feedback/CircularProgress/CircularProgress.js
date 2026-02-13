'use client';
import * as React from 'react';
import clsx from 'clsx';

const SIZE = 44;

const CircularProgress = React.forwardRef(function CircularProgress(props, ref) {
  const {
    className,
    style,
    ...other
  } = props;

  const size = 40;
  const thickness = 3.6;

  const circleStyle = {
    stroke: '#1976d2',
    strokeDasharray: '80px, 200px',
    strokeDashoffset: 0,
  };

  const rootStyle = {
    display: 'inline-block',
    width: size,
    height: size,
    animation: 'MuiCircularProgress-keyframes-circular-rotate 1.4s linear infinite',
    ...style,
  };

  const circleAnimationStyle = {
    ...circleStyle,
    animation: 'MuiCircularProgress-keyframes-circular-dash 1.4s ease-in-out infinite',
  };

  return (
    <>
      <style>{`
        @keyframes MuiCircularProgress-keyframes-circular-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes MuiCircularProgress-keyframes-circular-dash {
          0% {
            stroke-dasharray: 1px, 200px;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 100px, 200px;
            stroke-dashoffset: -15px;
          }
          100% {
            stroke-dasharray: 1px, 200px;
            stroke-dashoffset: -126px;
          }
        }
      `}</style>
      <span
        className={clsx('MuiCircularProgress-root', className)}
        style={rootStyle}
        ref={ref}
        role="progressbar"
        {...other}
      >
        <svg
          className="MuiCircularProgress-svg"
          viewBox={`${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`}
          style={{ display: 'block' }}
        >
          <circle
            className="MuiCircularProgress-circle"
            cx={SIZE}
            cy={SIZE}
            r={(SIZE - thickness) / 2}
            fill="none"
            strokeWidth={thickness}
            style={circleAnimationStyle}
          />
        </svg>
      </span>
    </>
  );
});

export default CircularProgress;
