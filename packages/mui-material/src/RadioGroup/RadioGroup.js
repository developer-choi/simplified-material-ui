'use client';
import * as React from 'react';
import FormGroup from '../../../form/FormGroup';
import useForkRef from '../utils/useForkRef';
import useControlled from '../utils/useControlled';
import RadioGroupContext from './RadioGroupContext';
import useId from '../utils/useId';


const RadioGroup = React.forwardRef(function RadioGroup(props, ref) {
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

  const handleRef = ref;

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
        ref={handleRef}
        {...other}
      >
        {children}
      </FormGroup>
    </RadioGroupContext.Provider>
  );
});

export default RadioGroup;
