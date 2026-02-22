'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useDefaultProps } from '../DefaultPropsProvider';
import StepLabel from '../StepLabel';
import StepperContext from '../Stepper/StepperContext';
import StepContext from '../Step/StepContext';

const StepButton = React.forwardRef(function StepButton(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiStepButton' });
  const { children, className, icon, optional, style, ...other } = props;

  const { disabled, active } = React.useContext(StepContext);
  const { orientation } = React.useContext(StepperContext);

  return (
    <button
      className={className}
      ref={ref}
      disabled={disabled}
      aria-current={active ? 'step' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: orientation === 'vertical' ? 'flex-start' : 'center',
        background: 'none',
        border: 0,
        cursor: 'inherit',
        outline: 0,
        padding: 0,
        textDecoration: 'none',
        width: '100%',
        boxSizing: 'content-box',
        ...(orientation === 'vertical'
          ? { padding: '8px', margin: '-8px' }
          : { padding: '24px 16px', margin: '-24px -16px' }),
        ...style,
      }}
      {...other}
    >
      <StepLabel icon={icon} optional={optional}>{children}</StepLabel>
    </button>
  );
});

StepButton.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Can be a `StepLabel` or a node to place inside `StepLabel` as children.
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
   * The icon displayed by the step label.
   */
  icon: PropTypes.node,
  /**
   * The optional node to display.
   */
  optional: PropTypes.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default StepButton;
