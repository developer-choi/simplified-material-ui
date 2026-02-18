'use client';
import * as React from 'react';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import FormGroup from '../../../form/FormGroup';
import { getRadioGroupUtilityClass } from './radioGroupClasses';
import useForkRef from '../utils/useForkRef';
import useControlled from '../utils/useControlled';
import RadioGroupContext from './RadioGroupContext';
import useId from '../utils/useId';

const useUtilityClasses = (props) => {
  const { classes, row, error } = props;

  const slots = {
    root: ['root', row && 'row', error && 'error'],
  };

  return composeClasses(slots, getRadioGroupUtilityClass, classes);
};

const RadioGroup = React.forwardRef(function RadioGroup(props, ref) {
  const {
    // private
    // eslint-disable-next-line react/prop-types
    actions,
    children,
    className,
    defaultValue,
    name: nameProp,
    onChange,
    value: valueProp,
    ...other
  } = props;
  const rootRef = React.useRef(null);

  const classes = useUtilityClasses(props);

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
        className={clsx(classes.root, className)}
        {...other}
      >
        {children}
      </FormGroup>
    </RadioGroupContext.Provider>
  );
});

export default RadioGroup;
