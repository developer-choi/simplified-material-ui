'use client';
import * as React from 'react';
import ToggleButtonGroupContext from './ToggleButtonGroupContext';

const ToggleButtonGroup = React.forwardRef(function ToggleButtonGroup(props, ref) {
  const {
    children,
    className,
    color = 'standard',
    disabled = false,
    exclusive = false,
    fullWidth = false,
    onChange,
    orientation = 'horizontal',
    size = 'medium',
    style,
    value,
    ...other
  } = props;

  const handleChange = React.useCallback(
    (event, buttonValue) => {
      if (!onChange) {
        return;
      }

      const index = value && value.indexOf(buttonValue);
      let newValue;

      if (value && index >= 0) {
        newValue = value.slice();
        newValue.splice(index, 1);
      } else {
        newValue = value ? value.concat(buttonValue) : [buttonValue];
      }

      onChange(event, newValue);
    },
    [onChange, value],
  );

  const handleExclusiveChange = React.useCallback(
    (event, buttonValue) => {
      if (!onChange) {
        return;
      }

      onChange(event, value === buttonValue ? null : buttonValue);
    },
    [onChange, value],
  );

  const context = React.useMemo(
    () => ({
      onChange: exclusive ? handleExclusiveChange : handleChange,
      value,
      size,
      fullWidth,
      color,
      disabled,
    }),
    [
      exclusive,
      handleExclusiveChange,
      handleChange,
      value,
      size,
      fullWidth,
      color,
      disabled,
    ],
  );

  return (
    <div
      role="group"
      className={className}
      ref={ref}
      style={{
        display: 'inline-flex',
        borderRadius: 4,
        ...(orientation === 'vertical' && { flexDirection: 'column' }),
        ...(fullWidth && { width: '100%' }),
        ...style,
      }}
      {...other}
    >
      <ToggleButtonGroupContext.Provider value={context}>
        {children}
      </ToggleButtonGroupContext.Provider>
    </div>
  );
});

export default ToggleButtonGroup;
