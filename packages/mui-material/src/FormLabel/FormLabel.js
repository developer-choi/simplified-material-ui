'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import formControlState from '../../../form/FormControl/formControlState';
import useFormControl from '../../../form/FormControl/useFormControl';

const FormLabel = React.forwardRef(function FormLabel(props, ref) {
  const {
    children,
    className,
    disabled,
    error,
    filled,
    focused,
    required,
    ...other
  } = props;

  const muiFormControl = useFormControl();
  const fcs = formControlState({
    props,
    muiFormControl,
    states: ['color', 'required', 'focused', 'disabled', 'error', 'filled'],
  });

  const getLabelColor = () => {
    if (fcs.error) return '#d32f2f';
    if (fcs.disabled) return 'rgba(0, 0, 0, 0.38)';
    if (fcs.focused) return '#1976d2';
    return 'rgba(0, 0, 0, 0.6)';
  };

  const rootStyle = {
    color: getLabelColor(),
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: '1.4375em',
    letterSpacing: '0.00938em',
    padding: 0,
    position: 'relative',
  };

  return (
    <label
      className={className}
      ref={ref}
      style={rootStyle}
      {...other}
    >
      {children}
      {fcs.required && (
        <span
          aria-hidden
          style={{ color: fcs.error ? '#d32f2f' : 'inherit' }}
        >
          &thinsp;{'*'}
        </span>
      )}
    </label>
  );
});

FormLabel.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
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
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['error', 'info', 'primary', 'secondary', 'success', 'warning']),
    PropTypes.string,
  ]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, the label should be displayed in a disabled state.
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, the label is displayed in an error state.
   */
  error: PropTypes.bool,
  /**
   * If `true`, the label should use filled classes key.
   */
  filled: PropTypes.bool,
  /**
   * If `true`, the input of this label is focused (used by `FormGroup` components).
   */
  focused: PropTypes.bool,
  /**
   * If `true`, the label will indicate that the `input` is required.
   */
  required: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default FormLabel;
