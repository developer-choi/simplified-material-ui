'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import integerPropType from '@mui/utils/integerPropType';
import composeClasses from '@mui/utils/composeClasses';
import StepperContext from '../Stepper/StepperContext';
import StepContext from './StepContext';
import StepConnector from '../StepConnector';
import { useDefaultProps } from '../DefaultPropsProvider';
import { getStepUtilityClass } from './stepClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, orientation, alternativeLabel, completed } = ownerState;

  const slots = {
    root: ['root', orientation, alternativeLabel && 'alternativeLabel', completed && 'completed'],
  };

  return composeClasses(slots, getStepUtilityClass, classes);
};

const Step = React.forwardRef(function Step(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiStep' });
  const {
    active: activeProp,
    children,
    className,
    component = 'div',
    completed: completedProp,
    disabled: disabledProp,
    expanded = false,
    index,
    last,
    style,
    ...other
  } = props;

  const { activeStep, orientation, nonLinear } = React.useContext(StepperContext);

  let [active = false, completed = false, disabled = false] = [
    activeProp,
    completedProp,
    disabledProp,
  ];

  if (activeStep === index) {
    active = activeProp !== undefined ? activeProp : true;
  } else if (!nonLinear && activeStep > index) {
    completed = completedProp !== undefined ? completedProp : true;
  } else if (!nonLinear && activeStep < index) {
    disabled = disabledProp !== undefined ? disabledProp : true;
  }

  const contextValue = React.useMemo(
    () => ({ index, last, expanded, icon: index + 1, active, completed, disabled }),
    [index, last, expanded, active, completed, disabled],
  );

  const ownerState = {
    ...props,
    active,
    orientation,
    completed,
    disabled,
    expanded,
    component,
  };

  const classes = useUtilityClasses(ownerState);

  const stepContent = (
    <div
      className={clsx(classes.root, className)}
      ref={ref}
      style={{
        ...(orientation === 'horizontal' && { paddingLeft: 8, paddingRight: 8 }),
        ...style,
      }}
      {...other}
    >
      {children}
    </div>
  );

  return (
    <StepContext.Provider value={contextValue}>
      {index !== 0 ? (
        <React.Fragment>
          <StepConnector />
          {stepContent}
        </React.Fragment>
      ) : stepContent}
    </StepContext.Provider>
  );
});

Step.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Sets the step as active. Is passed to child components.
   */
  active: PropTypes.bool,
  /**
   * Should be `Step` sub-components such as `StepLabel`, `StepContent`.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * Mark the step as completed. Is passed to child components.
   */
  completed: PropTypes.bool,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, the step is disabled, will also disable the button if
   * `StepButton` is a child of `Step`. Is passed to child components.
   */
  disabled: PropTypes.bool,
  /**
   * Expand the step.
   * @default false
   */
  expanded: PropTypes.bool,
  /**
   * The position of the step.
   * The prop defaults to the value inherited from the parent Stepper component.
   */
  index: integerPropType,
  /**
   * If `true`, the Step is displayed as rendered last.
   * The prop defaults to the value inherited from the parent Stepper component.
   */
  last: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default Step;
