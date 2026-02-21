'use client';
import PropTypes from 'prop-types';
import * as React from 'react';
import StepContext from '../Step/StepContext';
import StepIcon from '../StepIcon';
import StepperContext from '../Stepper/StepperContext';
import { useDefaultProps } from '../DefaultPropsProvider';

const StepLabel = React.forwardRef(function StepLabel(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiStepLabel' });
  const {
    children,
    className,
    error = false,
    icon: iconProp,
    optional,
    style,
    ...other
  } = props;

  const { alternativeLabel, orientation } = React.useContext(StepperContext);
  const { active, disabled, completed, icon: iconContext } = React.useContext(StepContext);
  const icon = iconProp || iconContext;

  const labelColor = error
    ? '#d32f2f'
    : (active || completed)
      ? 'rgba(0, 0, 0, 0.87)'
      : 'rgba(0, 0, 0, 0.6)';

  return (
    <span
      className={className}
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        ...(orientation === 'vertical' && { textAlign: 'left', padding: '8px 0' }),
        ...(disabled && { cursor: 'default' }),
        ...style,
      }}
      {...other}
    >
      {icon && (
        <span style={{ flexShrink: 0, display: 'flex', paddingRight: 8 }}>
          <StepIcon active={active} completed={completed} error={error} icon={icon} />
        </span>
      )}
      <span style={{ width: '100%', color: 'rgba(0, 0, 0, 0.6)' }}>
        {children && (
          <span
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: labelColor,
              ...((active || completed) && { fontWeight: 500 }),
            }}
          >
            {children}
          </span>
        )}
        {optional}
      </span>
    </span>
  );
});

StepLabel.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * In most cases will simply be a string containing a title for the label.
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
   * The props used for each slot inside.
   * @default {}
   * @deprecated use the `slotProps` prop instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  componentsProps: PropTypes.shape({
    label: PropTypes.object,
  }),
  /**
   * If `true`, the step is marked as failed.
   * @default false
   */
  error: PropTypes.bool,
  /**
   * Override the default label of the step icon.
   */
  icon: PropTypes.node,
  /**
   * The optional node to display.
   */
  optional: PropTypes.node,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    root: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    stepIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    label: PropTypes.elementType,
    root: PropTypes.elementType,
    stepIcon: PropTypes.elementType,
  }),
  /**
   * The component to render in place of the [`StepIcon`](https://mui.com/material-ui/api/step-icon/).
   * @deprecated Use `slots.stepIcon` instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  StepIconComponent: PropTypes.elementType,
  /**
   * Props applied to the [`StepIcon`](https://mui.com/material-ui/api/step-icon/) element.
   * @deprecated Use `slotProps.stepIcon` instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  StepIconProps: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

StepLabel.muiName = 'StepLabel';

export default StepLabel;
