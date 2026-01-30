'use client';
import * as React from 'react';
import SelectInput from './SelectInput';
import formControlState from '../../../form/FormControl/formControlState';
import useFormControl from '../../../form/FormControl/useFormControl';
import ArrowDropDownIcon from '../internal/svg-icons/ArrowDropDown';
import OutlinedInput from '../../../form/OutlinedInput';
import { useDefaultProps } from '../DefaultPropsProvider';

const StyledOutlinedInput = OutlinedInput;

const Select = React.forwardRef(function Select(inProps, ref) {
  const props = useDefaultProps({ name: 'MuiSelect', props: inProps });
  const {
    autoWidth = false,
    children,
    className,
    defaultOpen = false,
    displayEmpty = false,
    IconComponent = ArrowDropDownIcon,
    id,
    inputProps,
    label,
    labelId,
    MenuProps,
    multiple = false,
    onClose,
    onOpen,
    open,
    renderValue,
    SelectDisplayProps,
    ...other
  } = props;

  const muiFormControl = useFormControl();
  const fcs = formControlState({
    props,
    muiFormControl,
    states: ['variant', 'error'],
  });

  const variant = fcs.variant || 'outlined';

  const InputComponent = <StyledOutlinedInput label={label} />;

  return (
    <React.Fragment>
      {React.cloneElement(InputComponent, {
        // Most of the logic is implemented in `SelectInput`.
        // The `Select` component is a simple API wrapper to expose something better to play with.
        inputComponent: SelectInput,
        inputProps: {
          children,
          error: fcs.error,
          IconComponent,
          variant,
          type: undefined, // We render a select. We can ignore the type provided by the `Input`.
          multiple,
          autoWidth,
          defaultOpen,
          displayEmpty,
          labelId,
          MenuProps,
          onClose,
          onOpen,
          open,
          renderValue,
          SelectDisplayProps: { id, ...SelectDisplayProps },
          ...inputProps,
        },
        ...(displayEmpty && variant === 'outlined'
          ? { notched: true }
          : {}),
        ref,
        ...other,
      })}
    </React.Fragment>
  );
});

Select.muiName = 'Select';

export default Select;
