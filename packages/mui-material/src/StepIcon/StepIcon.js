'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useDefaultProps } from '../DefaultPropsProvider';

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}>
    <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm-2 17l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z" />
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}>
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const StepIcon = React.forwardRef(function StepIcon(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiStepIcon' });
  const {
    active = false,
    className: classNameProp,
    completed = false,
    error = false,
    icon,
    style,
    ...other
  } = props;

  const color = error ? '#d32f2f' : (active || completed) ? '#1976d2' : '#bdbdbd';

  if (typeof icon === 'number' || typeof icon === 'string') {
    if (error) {
      return (
        <span
          className={classNameProp}
          ref={ref}
          style={{ display: 'block', fontSize: '1.5rem', color, ...style }}
          {...other}
        >
          <WarningIcon />
        </span>
      );
    }

    if (completed) {
      return (
        <span
          className={classNameProp}
          ref={ref}
          style={{ display: 'block', fontSize: '1.5rem', color, ...style }}
          {...other}
        >
          <CheckCircleIcon />
        </span>
      );
    }

    return (
      <svg
        className={classNameProp}
        ref={ref}
        style={{ display: 'block', width: '1em', height: '1em', fontSize: '1.5rem', color, ...style }}
        viewBox="0 0 24 24"
        aria-hidden="true"
        {...other}
      >
        <circle cx="12" cy="12" r="12" fill="currentColor" />
        <text
          x="12"
          y="12"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize="12"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        >
          {icon}
        </text>
      </svg>
    );
  }

  return icon;
});

StepIcon.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Whether this step is active.
   * @default false
   */
  active: PropTypes.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * Mark the step as completed. Is passed to child components.
   * @default false
   */
  completed: PropTypes.bool,
  /**
   * If `true`, the step is marked as failed.
   * @default false
   */
  error: PropTypes.bool,
  /**
   * The label displayed in the step icon.
   */
  icon: PropTypes.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default StepIcon;
