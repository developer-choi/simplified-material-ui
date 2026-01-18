'use client';
import * as React from 'react';
import SwitchBase from '@mui/material/internal/SwitchBase';
import RadioButtonIcon from './RadioButtonIcon';
import createChainedFunction from '@mui/material/utils/createChainedFunction';
import useFormControl from '../FormControl/useFormControl';
import useRadioGroup from '@mui/material/RadioGroup/useRadioGroup';

function areEqualValues(a, b) {
  if (typeof b === 'object' && b !== null) {
    return a === b;
  }

  // The value could be a number, the DOM will stringify it anyway.
  return String(a) === String(b);
}

const Radio = React.forwardRef(function Radio(props, ref) {
  const {
    checked: checkedProp,
    name: nameProp,
    onChange: onChangeProp,
    className,
    disabled: disabledProp,
    ...other
  } = props;

  const muiFormControl = useFormControl();

  let disabled = disabledProp;

  if (muiFormControl) {
    if (typeof disabled === 'undefined') {
      disabled = muiFormControl.disabled;
    }
  }

  disabled ??= false;

  const radioGroup = useRadioGroup();

  let checked = checkedProp;
  const onChange = createChainedFunction(onChangeProp, radioGroup && radioGroup.onChange);
  let name = nameProp;

  if (radioGroup) {
    if (typeof checked === 'undefined') {
      checked = areEqualValues(radioGroup.value, props.value);
    }
    if (typeof name === 'undefined') {
      name = radioGroup.name;
    }
  }

  return (
    <SwitchBase
      ref={ref}
      className={className}
      type="radio"
      icon={<RadioButtonIcon fontSize="medium" />}
      checkedIcon={<RadioButtonIcon checked fontSize="medium" />}
      disabled={disabled}
      name={name}
      checked={checked}
      onChange={onChange}
      {...other}
    />
  );
});

export default Radio;
