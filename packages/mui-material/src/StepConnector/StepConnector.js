'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import capitalize from '../utils/capitalize';
import { useDefaultProps } from '../DefaultPropsProvider';
import StepperContext from '../Stepper/StepperContext';
import StepContext from '../Step/StepContext';
import { getStepConnectorUtilityClass } from './stepConnectorClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, orientation, alternativeLabel, active, completed, disabled } = ownerState;

  const slots = {
    root: [
      'root',
      orientation,
      alternativeLabel && 'alternativeLabel',
      active && 'active',
      completed && 'completed',
      disabled && 'disabled',
    ],
    line: ['line', `line${capitalize(orientation)}`],
  };

  return composeClasses(slots, getStepConnectorUtilityClass, classes);
};

const StepConnector = React.forwardRef(function StepConnector(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiStepConnector' });
  const { className, style, ...other } = props;

  const { orientation = 'horizontal' } = React.useContext(StepperContext);
  const { active, disabled, completed } = React.useContext(StepContext);

  const ownerState = { ...props, orientation, active, completed, disabled };
  const classes = useUtilityClasses(ownerState);

  const lineColor = (active || completed) ? '#1976d2' : '#bdbdbd';

  return (
    <div
      className={clsx(classes.root, className)}
      ref={ref}
      style={{
        flex: '1 1 auto',
        ...(orientation === 'vertical' && { marginLeft: 12 }),
        ...style,
      }}
      {...other}
    >
      <span
        className={classes.line}
        style={{
          display: 'block',
          borderColor: lineColor,
          ...(orientation === 'horizontal'
            ? { borderTopStyle: 'solid', borderTopWidth: 1 }
            : { borderLeftStyle: 'solid', borderLeftWidth: 1, minHeight: 24 }
          ),
        }}
      />
    </div>
  );
});

StepConnector.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default StepConnector;
