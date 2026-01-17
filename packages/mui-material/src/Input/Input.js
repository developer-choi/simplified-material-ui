'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import refType from '@mui/utils/refType';
import InputBase from '../../../form/InputBase';
import useFormControl from '../FormControl/useFormControl';

const Input = React.forwardRef(function Input(props, ref) {
  const {
    disableUnderline = false,
    className,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...other
  } = props;

  const muiFormControl = useFormControl();
  const [focused, setFocused] = React.useState(false);
  const [hover, setHover] = React.useState(false);

  const disabled = muiFormControl?.disabled ?? props.disabled ?? false;
  const error = muiFormControl?.error ?? props.error ?? false;

  const handleFocus = (event) => {
    setFocused(true);
    if (onFocusProp) {
      onFocusProp(event);
    }
  };

  const handleBlur = (event) => {
    setFocused(false);
    if (onBlurProp) {
      onBlurProp(event);
    }
  };

  const containerStyle = {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
  };

  const underlineBeforeStyle = !disableUnderline
    ? {
        borderBottom: error
          ? '1px solid #d32f2f'
          : hover && !disabled
            ? '2px solid rgba(0, 0, 0, 0.87)'
            : '1px solid rgba(0, 0, 0, 0.42)',
        left: 0,
        bottom: 0,
        content: '""',
        position: 'absolute',
        right: 0,
        transition: 'border-bottom-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
        pointerEvents: 'none',
        ...(disabled && {
          borderBottomStyle: 'dotted',
          borderBottomWidth: '1px',
        }),
      }
    : { display: 'none' };

  const underlineAfterStyle = !disableUnderline
    ? {
        borderBottom: error ? '2px solid #d32f2f' : '2px solid #1976d2',
        left: 0,
        bottom: 0,
        content: '""',
        position: 'absolute',
        right: 0,
        transform: focused ? 'scaleX(1) translateX(0)' : 'scaleX(0)',
        transition: 'transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
        pointerEvents: 'none',
      }
    : { display: 'none' };

  return (
    <div
      className={className}
      style={containerStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <InputBase {...other} ref={ref} onFocus={handleFocus} onBlur={handleBlur} />
      <span style={underlineBeforeStyle} />
      <span style={underlineAfterStyle} />
    </div>
  );
});

Input.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * This prop helps users to fill forms faster, especially on mobile devices.
   * The name can be confusing, as it's more like an autofill.
   * You can learn more about it [following the specification](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill).
   */
  autoComplete: PropTypes.string,
  /**
   * If `true`, the `input` element is focused during the first mount.
   */
  autoFocus: PropTypes.bool,
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * The prop defaults to the value (`'primary'`) inherited from the parent FormControl component.
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['primary', 'secondary']),
    PropTypes.string,
  ]),
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue: PropTypes.any,
  /**
   * If `true`, the component is disabled.
   * The prop defaults to the value (`false`) inherited from the parent FormControl component.
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, the `input` will not have an underline.
   * @default false
   */
  disableUnderline: PropTypes.bool,
  /**
   * End `InputAdornment` for this component.
   */
  endAdornment: PropTypes.node,
  /**
   * If `true`, the `input` will indicate an error.
   * The prop defaults to the value (`false`) inherited from the parent FormControl component.
   */
  error: PropTypes.bool,
  /**
   * If `true`, the `input` will take up the full width of its container.
   * @default false
   */
  fullWidth: PropTypes.bool,
  /**
   * The id of the `input` element.
   */
  id: PropTypes.string,
  /**
   * The component used for the `input` element.
   * Either a string to use a HTML element or a component.
   * @default 'input'
   */
  inputComponent: PropTypes.elementType,
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes) applied to the `input` element.
   * @default {}
   */
  inputProps: PropTypes.object,
  /**
   * Pass a ref to the `input` element.
   */
  inputRef: refType,
  /**
   * If `dense`, will adjust vertical spacing. This is normally obtained via context from
   * FormControl.
   * The prop defaults to the value (`'none'`) inherited from the parent FormControl component.
   */
  margin: PropTypes.oneOf(['dense', 'none']),
  /**
   * Maximum number of rows to display when multiline option is set to true.
   */
  maxRows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * Minimum number of rows to display when multiline option is set to true.
   */
  minRows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * If `true`, a [TextareaAutosize](https://mui.com/material-ui/react-textarea-autosize/) element is rendered.
   * @default false
   */
  multiline: PropTypes.bool,
  /**
   * Name attribute of the `input` element.
   */
  name: PropTypes.string,
  /**
   * Callback fired when the value is changed.
   *
   * @param {React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>} event The event source of the callback.
   * You can pull out the new value by accessing `event.target.value` (string).
   */
  onChange: PropTypes.func,
  /**
   * The short hint displayed in the `input` before the user enters a value.
   */
  placeholder: PropTypes.string,
  /**
   * It prevents the user from changing the value of the field
   * (not from interacting with the field).
   */
  readOnly: PropTypes.bool,
  /**
   * If `true`, the `input` element is required.
   * The prop defaults to the value (`false`) inherited from the parent FormControl component.
   */
  required: PropTypes.bool,
  /**
   * Number of rows to display when multiline option is set to true.
   */
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * The extra props for the slot components.
   * You can override the existing props or add new ones.
   *
   * @default {}
   */
  slotProps: PropTypes.shape({
    input: PropTypes.object,
    root: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   *
   * @default {}
   */
  slots: PropTypes.shape({
    input: PropTypes.elementType,
    root: PropTypes.elementType,
  }),
  /**
   * Start `InputAdornment` for this component.
   */
  startAdornment: PropTypes.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * Type of the `input` element. It should be [a valid HTML5 input type](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#input_types).
   * @default 'text'
   */
  type: PropTypes.string,
  /**
   * The value of the `input` element, required for a controlled component.
   */
  value: PropTypes.any,
};

Input.muiName = 'Input';

export default Input;
