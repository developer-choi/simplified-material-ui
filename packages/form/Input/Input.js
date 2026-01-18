'use client';
import * as React from 'react';
import InputBase from '../InputBase';
import useFormControl from '@mui/material/FormControl/useFormControl';

const Input = React.forwardRef(function Input(props, ref) {
  const {
    disableUnderline = false,
    className,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...other
  } = props;

  const muiFormControl = useFormControl();
  const [focused, setFocused] = React.useState(false);
  const [hover, setHover] = React.useState(false);

  const disabled = muiFormControl?.disabled ?? props.disabled ?? false;
  const error = muiFormControl?.error ?? props.error ?? false;

  const handleFocus = (event) => {
    setFocused(true);
    if (onFocusProp) {
      onFocusProp(event);
    }
  };

  const handleBlur = (event) => {
    setFocused(false);
    if (onBlurProp) {
      onBlurProp(event);
    }
  };

  const containerStyle = {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
  };

  const underlineBeforeStyle = !disableUnderline
    ? {
        borderBottom: error
          ? '1px solid #d32f2f'
          : hover && !disabled
            ? '2px solid rgba(0, 0, 0, 0.87)'
            : '1px solid rgba(0, 0, 0, 0.42)',
        left: 0,
        bottom: 0,
        content: '""',
        position: 'absolute',
        right: 0,
        transition: 'border-bottom-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
        pointerEvents: 'none',
        ...(disabled && {
          borderBottomStyle: 'dotted',
          borderBottomWidth: '1px',
        }),
      }
    : { display: 'none' };

  const underlineAfterStyle = !disableUnderline
    ? {
        borderBottom: error ? '2px solid #d32f2f' : '2px solid #1976d2',
        left: 0,
        bottom: 0,
        content: '""',
        position: 'absolute',
        right: 0,
        transform: focused ? 'scaleX(1) translateX(0)' : 'scaleX(0)',
        transition: 'transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
        pointerEvents: 'none',
      }
    : { display: 'none' };

  return (
    <div
      className={className}
      style={containerStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <InputBase {...other} ref={ref} onFocus={handleFocus} onBlur={handleBlur} />
      <span style={underlineBeforeStyle} />
      <span style={underlineAfterStyle} />
    </div>
  );
});

Input.muiName = 'Input';

export default Input;
