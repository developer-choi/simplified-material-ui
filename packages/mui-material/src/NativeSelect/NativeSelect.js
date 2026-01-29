'use client';
import * as React from 'react';
import NativeSelectInput from './NativeSelectInput';
import { useDefaultProps } from '../DefaultPropsProvider';

/**
 * An alternative to `<Select native />` with a much smaller bundle size footprint.
 */
const NativeSelect = React.forwardRef(function NativeSelect(inProps, ref) {
  const props = useDefaultProps({ name: 'MuiNativeSelect', props: inProps });
  const {
    children,
    disabled,
    error,
    multiple,
    open,
    value,
    onChange,
    name,
    ...other
  } = props;

  return (
    <NativeSelectInput
      ref={ref}
      disabled={disabled}
      error={error}
      multiple={multiple}
      open={open}
      value={value}
      onChange={onChange}
      name={name}
      {...other}
    >
      {children}
    </NativeSelectInput>
  );
});

NativeSelect.muiName = 'Select';

export default NativeSelect;
