'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import chainPropTypes from '@mui/utils/chainPropTypes';

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

CircularProgress.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'primary'
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['inherit', 'primary', 'secondary', 'error', 'info', 'success', 'warning']),
    PropTypes.string,
  ]),
  /**
   * If `true`, the shrink animation is disabled.
   * This only works if variant is `indeterminate`.
   * @default false
   */
  disableShrink: chainPropTypes(PropTypes.bool, (props) => {
    if (props.disableShrink && props.variant && props.variant !== 'indeterminate') {
      return new Error(
        'MUI: You have provided the `disableShrink` prop ' +
          'with a variant other than `indeterminate`. This will have no effect.',
      );
    }

    return null;
  }),
  /**
   * If `true`, a track circle slot is mounted to show a subtle background for the progress.
   * The `size` and `thickness` apply to the track slot to be consistent with the progress circle.
   * @default false
   */
  enableTrackSlot: PropTypes.bool,
  /**
   * The size of the component.
   * If using a number, the pixel unit is assumed.
   * If using a string, you need to provide the CSS unit, for example '3rem'.
   * @default 40
   */
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * @ignore
   */
  style: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The thickness of the circle.
   * @default 3.6
   */
  thickness: PropTypes.number,
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number,
  /**
   * The variant to use.
   * Use indeterminate when there is no progress value.
   * @default 'indeterminate'
   */
  variant: PropTypes.oneOf(['determinate', 'indeterminate']),
};

export default CircularProgress;
