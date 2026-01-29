'use client';
import * as React from 'react';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import NativeSelectInput from './NativeSelectInput';
import Input from '../../../form/Input';
import { useDefaultProps } from '../DefaultPropsProvider';
import { getNativeSelectUtilityClasses } from './nativeSelectClasses';

const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getNativeSelectUtilityClasses, classes);
};

const defaultInput = <Input />;
/**
 * An alternative to `<Select native />` with a much smaller bundle size footprint.
 */
const NativeSelect = React.forwardRef(function NativeSelect(inProps, ref) {
  const props = useDefaultProps({ name: 'MuiNativeSelect', props: inProps });
  const {
    className,
    children,
    classes: classesProp = {},
    input = defaultInput,
    inputProps,
    ...other
  } = props;

  const ownerState = { ...props, classes: classesProp };
  const classes = useUtilityClasses(ownerState);
  const { root, ...otherClasses } = classesProp;

  return (
    <React.Fragment>
      {React.cloneElement(input, {
        // Most of the logic is implemented in `NativeSelectInput`.
        // The `Select` component is a simple API wrapper to expose something better to play with.
        inputComponent: NativeSelectInput,
        inputProps: {
          children,
          classes: otherClasses,
          type: undefined, // We render a select. We can ignore the type provided by the `Input`.
          ...inputProps,
          ...(input ? input.props.inputProps : {}),
        },
        ref,
        ...other,
        className: clsx(classes.root, input.props.className, className),
      })}
    </React.Fragment>
  );
});

NativeSelect.muiName = 'Select';

export default NativeSelect;
