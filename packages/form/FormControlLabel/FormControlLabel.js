'use client';
import * as React from 'react';
import clsx from 'clsx';

const FormControlLabel = React.forwardRef(function FormControlLabel(props, ref) {
  const {
    checked,
    className,
    control,
    inputRef,
    label,
    name,
    onChange,
    style,
    value,
    ...other
  } = props;

  const controlProps = {};

  ['checked', 'name', 'onChange', 'value', 'inputRef'].forEach((key) => {
    if (typeof control.props[key] === 'undefined' && typeof props[key] !== 'undefined') {
      controlProps[key] = props[key];
    }
  });

  const rootStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    verticalAlign: 'middle',
    WebkitTapHighlightColor: 'transparent',
    marginLeft: -11,
    marginRight: 16,
    ...style,
  };

  return (
    <label ref={ref} className={clsx('MuiFormControlLabel-root', className)} style={rootStyle} {...other}>
      {React.cloneElement(control, controlProps)}
      {label}
    </label>
  );
});

export default FormControlLabel;
