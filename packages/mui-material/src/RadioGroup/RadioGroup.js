'use client';
import * as React from 'react';
import FormGroup from '../../../form/FormGroup';
import useForkRef from '../utils/useForkRef';
import useControlled from '../utils/useControlled';
import RadioGroupContext from './RadioGroupContext';
import useId from '../utils/useId';


const RadioGroup = React.forwardRef(function RadioGroup(props, ref) {
  const {
    // private
    // eslint-disable-next-line react/prop-types
    actions,
    children,
    defaultValue,
    name: nameProp,
    onChange,
    value: valueProp,
    ...other
  } = props;
  const rootRef = React.useRef(null);

  const [value, setValueState] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: 'RadioGroup',
  });

  React.useImperativeHandle(
    actions,
    () => ({
      focus: () => {
        let input = rootRef.current.querySelector('input:not(:disabled):checked');

        if (!input) {
          input = rootRef.current.querySelector('input:not(:disabled)');
        }

        if (input) {
          input.focus();
        }
      },
    }),
    [],
  );

  const handleRef = useForkRef(ref, rootRef);

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
