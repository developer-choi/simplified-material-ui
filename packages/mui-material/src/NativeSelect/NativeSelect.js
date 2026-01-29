'use client';
import * as React from 'react';
import NativeSelectInput from './NativeSelectInput';
import Input from '../../../form/Input';
import { useDefaultProps } from '../DefaultPropsProvider';

const defaultInput = <Input />;
/**
 * An alternative to `<Select native />` with a much smaller bundle size footprint.
 */
const NativeSelect = React.forwardRef(function NativeSelect(inProps, ref) {
  const props = useDefaultProps({ name: 'MuiNativeSelect', props: inProps });
  const {
    children,
    input = defaultInput,
    inputProps,
    ...other
  } = props;

  return (
    <React.Fragment>
      {React.cloneElement(input, {
        // Most of the logic is implemented in `NativeSelectInput`.
        // The `Select` component is a simple API wrapper to expose something better to play with.
        inputComponent: NativeSelectInput,
        inputProps: {
          children,
          type: undefined, // We render a select. We can ignore the type provided by the `Input`.
          ...inputProps,
          ...(input ? input.props.inputProps : {}),
        },
        ref,
        ...other,
      })}
    </React.Fragment>
  );
});

NativeSelect.muiName = 'Select';

export default NativeSelect;
