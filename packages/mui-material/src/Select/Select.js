'use client';
import * as React from 'react';
import SelectInput from './SelectInput';
import ArrowDropDownIcon from '../internal/svg-icons/ArrowDropDown';
import OutlinedInput from '../../../form/OutlinedInput';

function Select(props) {
  const {
    autoWidth = false,
    children,
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

  return (
    <OutlinedInput
      label={label}
      inputComponent={SelectInput}
      inputProps={{
        children,
        IconComponent,
        variant: 'outlined',
        type: undefined,
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
      }}
      {...(displayEmpty ? { notched: true } : {})}
      {...other}
    />
  );
}

export default Select;
