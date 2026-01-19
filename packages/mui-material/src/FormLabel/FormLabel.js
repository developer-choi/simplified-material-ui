'use client';
import * as React from 'react';
import formControlState from '../../../form/FormControl/formControlState';
import useFormControl from '../../../form/FormControl/useFormControl';

const FormLabel = React.forwardRef(function FormLabel(props, ref) {
  const {
    children,
    className,
    disabled,
    error,
    filled,
    focused,
    required,
    ...other
  } = props;

  const muiFormControl = useFormControl();
  const fcs = formControlState({
    props,
    muiFormControl,
    states: ['color', 'required', 'focused', 'disabled', 'error', 'filled'],
  });

  const getLabelColor = () => {
    if (fcs.error) return '#d32f2f';
    if (fcs.disabled) return 'rgba(0, 0, 0, 0.38)';
    if (fcs.focused) return '#1976d2';
    return 'rgba(0, 0, 0, 0.6)';
  };

  const rootStyle = {
    color: getLabelColor(),
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: '1.4375em',
    letterSpacing: '0.00938em',
    padding: 0,
    position: 'relative',
  };

  return (
    <label
      className={className}
      ref={ref}
      style={rootStyle}
      {...other}
    >
      {children}
      {fcs.required && (
        <span
          aria-hidden
          style={{ color: fcs.error ? '#d32f2f' : 'inherit' }}
        >
          &thinsp;{'*'}
        </span>
      )}
    </label>
  );
});

export default FormLabel;
