'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useDefaultProps } from '../DefaultPropsProvider';
import StepperContext from './StepperContext';

const Stepper = React.forwardRef(function Stepper(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiStepper' });
  const {
    activeStep = 0,
    children,
    className,
    orientation = 'horizontal',
    style,
    ...other
  } = props;

  const childrenArray = React.Children.toArray(children).filter(Boolean);
  const steps = childrenArray.map((step, index) => {
    return React.cloneElement(step, {
      index,
      last: index + 1 === childrenArray.length,
      ...step.props,
    });
  });
  const contextValue = React.useMemo(
    () => ({ activeStep, orientation }),
    [activeStep, orientation],
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        className={className}
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          alignItems: 'center',
          ...style,
        }}
        {...other}
      >
        {steps}
      </div>
    </StepperContext.Provider>
  );
});

Stepper.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Set the active step (zero based index).
   * Set to -1 to disable all the steps.
   * @default 0
   */
  activeStep: integerPropType,
  /**
   * If set to 'true' and orientation is horizontal,
   * then the step label will be positioned under the icon.
   * @default false
   */
  alternativeLabel: PropTypes.bool,
  /**
   * Two or more `<Step />` components.
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
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * An element to be placed between each step.
   * @default <StepConnector />
   */
  connector: PropTypes.element,
  /**
   * If set the `Stepper` will not assist in controlling steps for linear flow.
   * @default false
   */
  nonLinear: PropTypes.bool,
  /**
   * The component orientation (layout flow direction).
   * @default 'horizontal'
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default Stepper;
