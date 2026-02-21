'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useDefaultProps } from '../DefaultPropsProvider';
import StepperContext from '../Stepper/StepperContext';
import StepContext from '../Step/StepContext';

const StepConnector = React.forwardRef(function StepConnector(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiStepConnector' });
  const { className, style, ...other } = props;

  const { orientation = 'horizontal' } = React.useContext(StepperContext);
  const { active, completed } = React.useContext(StepContext);

  const lineColor = (active || completed) ? '#1976d2' : '#bdbdbd';

  return (
    <div
      className={className}
      ref={ref}
      style={{
        flex: '1 1 auto',
        ...(orientation === 'vertical' && { marginLeft: 12 }),
        ...style,
      }}
      {...other}
    >
      <span
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
