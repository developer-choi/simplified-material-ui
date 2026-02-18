'use client';
import * as React from 'react';
import FormGroup from '../FormGroup';
import useControlled from '@mui/material/utils/useControlled';
import RadioGroupContext from './RadioGroupContext';
import useId from '@mui/material/utils/useId';


function RadioGroup(props) {
  const {
    children,
    defaultValue,
    name: nameProp,
    onChange,
    value: valueProp,
    ...other
  } = props;

  const [value, setValueState] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: 'RadioGroup',
  });

  const name = useId(nameProp);

  const contextValue = React.useMemo(
    () => ({
      name,
      onChange(event) {
        setValueState(event.target.value);

        if (onChange) {
          onChange(event, event.target.value);
        }
      },
      value,
    }),
    [name, onChange, setValueState, value],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <FormGroup
        role="radiogroup"
        {...other}
      >
        {children}
      </FormGroup>
    </RadioGroupContext.Provider>
  );
}

export default RadioGroup;
