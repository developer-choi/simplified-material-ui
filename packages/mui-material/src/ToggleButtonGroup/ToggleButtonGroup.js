'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { useDefaultProps } from '../DefaultPropsProvider';
import capitalize from '../utils/capitalize';
import toggleButtonGroupClasses, {
  getToggleButtonGroupUtilityClass,
} from './toggleButtonGroupClasses';
import ToggleButtonGroupContext from './ToggleButtonGroupContext';

const useUtilityClasses = (ownerState) => {
  const { classes, orientation, fullWidth, disabled } = ownerState;

  const slots = {
    root: ['root', orientation, fullWidth && 'fullWidth'],
    grouped: ['grouped', `grouped${capitalize(orientation)}`, disabled && 'disabled'],
    firstButton: ['firstButton'],
    lastButton: ['lastButton'],
    middleButton: ['middleButton'],
  };

  return composeClasses(slots, getToggleButtonGroupUtilityClass, classes);
};

const ToggleButtonGroup = React.forwardRef(function ToggleButtonGroup(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiToggleButtonGroup' });
  const {
    children,
    className,
    color = 'standard',
    disabled = false,
    exclusive = false,
    fullWidth = false,
    onChange,
    orientation = 'horizontal',
    size = 'medium',
    style,
    value,
    ...other
  } = props;

  const ownerState = { ...props, disabled, fullWidth, orientation, size };
  const classes = useUtilityClasses(ownerState);

  const handleChange = React.useCallback(
    (event, buttonValue) => {
      if (!onChange) {
        return;
      }

      const index = value && value.indexOf(buttonValue);
      let newValue;

      if (value && index >= 0) {
        newValue = value.slice();
        newValue.splice(index, 1);
      } else {
        newValue = value ? value.concat(buttonValue) : [buttonValue];
      }

      onChange(event, newValue);
    },
    [onChange, value],
  );

  const handleExclusiveChange = React.useCallback(
    (event, buttonValue) => {
      if (!onChange) {
        return;
      }

      onChange(event, value === buttonValue ? null : buttonValue);
    },
    [onChange, value],
  );

  const context = React.useMemo(
    () => ({
      onChange: exclusive ? handleExclusiveChange : handleChange,
      value,
      size,
      fullWidth,
      color,
      disabled,
    }),
    [
      exclusive,
      handleExclusiveChange,
      handleChange,
      value,
      size,
      fullWidth,
      color,
      disabled,
    ],
  );

  return (
    <div
      role="group"
      className={clsx(classes.root, className)}
      ref={ref}
      style={{
        display: 'inline-flex',
        borderRadius: 4,
        ...(orientation === 'vertical' && { flexDirection: 'column' }),
        ...(fullWidth && { width: '100%' }),
        ...style,
      }}
      {...other}
    >
      <ToggleButtonGroupContext.Provider value={context}>
        {children}
      </ToggleButtonGroupContext.Provider>
    </div>
  );
});

ToggleButtonGroup.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['standard', 'primary', 'secondary', 'error', 'info', 'success', 'warning']),
    PropTypes.string,
  ]),
  disabled: PropTypes.bool,
  exclusive: PropTypes.bool,
  fullWidth: PropTypes.bool,
  onChange: PropTypes.func,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  size: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large']),
    PropTypes.string,
  ]),
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  value: PropTypes.any,
};

export default ToggleButtonGroup;
