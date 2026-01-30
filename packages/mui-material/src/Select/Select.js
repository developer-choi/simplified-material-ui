'use client';
import * as React from 'react';
import clsx from 'clsx';
import deepmerge from '@mui/utils/deepmerge';
import composeClasses from '@mui/utils/composeClasses';
import SelectInput from './SelectInput';
import formControlState from '../../../form/FormControl/formControlState';
import useFormControl from '../../../form/FormControl/useFormControl';
import ArrowDropDownIcon from '../internal/svg-icons/ArrowDropDown';
import OutlinedInput from '../../../form/OutlinedInput';
import { useDefaultProps } from '../DefaultPropsProvider';
import { styled } from '../zero-styled';
import rootShouldForwardProp from '../styles/rootShouldForwardProp';
import { getSelectUtilityClasses } from './selectClasses';

const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  const composedClasses = composeClasses(slots, getSelectUtilityClasses, classes);

  return { ...classes, ...composedClasses };
};

const styledRootConfig = {
  name: 'MuiSelect',
  slot: 'Root',
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) && prop !== 'variant',
};

const StyledOutlinedInput = styled(OutlinedInput, styledRootConfig)('');

const Select = React.forwardRef(function Select(inProps, ref) {
  const props = useDefaultProps({ name: 'MuiSelect', props: inProps });
  const {
    autoWidth = false,
    children,
    classes: classesProp = {},
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

  const ownerState = { ...props, variant, classes: classesProp };
  const classes = useUtilityClasses(ownerState);
  const { root, ...restOfClasses } = classes;

  const InputComponent = <StyledOutlinedInput label={label} ownerState={ownerState} />;

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
          classes: inputProps ? deepmerge(restOfClasses, inputProps.classes) : restOfClasses,
        },
        ...(displayEmpty && variant === 'outlined'
          ? { notched: true }
          : {}),
        ref,
        className: clsx(InputComponent.props.className, className, classes.root),
        // If a custom input is provided via 'input' prop, do not allow 'variant' to be propagated to it's root element. See https://github.com/mui/material-ui/issues/33894.
        ...(!input && { variant }),
        ...other,
      })}
    </React.Fragment>
  );
});

Select.muiName = 'Select';

export default Select;
