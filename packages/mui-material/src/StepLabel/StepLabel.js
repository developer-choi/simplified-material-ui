'use client';
import * as React from 'react';
import StepContext from '../Step/StepContext';
import StepIcon from '../StepIcon';
import StepperContext from '../Stepper/StepperContext';

const StepLabel = React.forwardRef(function StepLabel(props, ref) {
  const {
    children,
    className,
    error = false,
    icon: iconProp,
    optional,
    style,
    ...other
  } = props;

  const { orientation } = React.useContext(StepperContext);
  const { active, disabled, completed, icon: iconContext } = React.useContext(StepContext);
  const icon = iconProp || iconContext;

  const labelColor = error
    ? '#d32f2f'
    : (active || completed)
      ? 'rgba(0, 0, 0, 0.87)'
      : 'rgba(0, 0, 0, 0.6)';

  return (
    <span
      className={className}
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        ...(orientation === 'vertical' && { textAlign: 'left', padding: '8px 0' }),
        ...(disabled && { cursor: 'default' }),
        ...style,
      }}
      {...other}
    >
      {icon && (
        <span style={{ flexShrink: 0, display: 'flex', paddingRight: 8 }}>
          <StepIcon active={active} completed={completed} error={error} icon={icon} />
        </span>
      )}
      <span style={{ width: '100%', color: 'rgba(0, 0, 0, 0.6)' }}>
        {children && (
          <span
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: labelColor,
              ...((active || completed) && { fontWeight: 500 }),
            }}
          >
            {children}
          </span>
        )}
        {optional}
      </span>
    </span>
  );
});

export default StepLabel;
