'use client';
import * as React from 'react';
import InputBase from '../../../form/InputBase';
import useFormControl from '../../../form/FormControl/useFormControl';

const OutlinedInput = React.forwardRef(function OutlinedInput(props, ref) {
  const {
    className,
    disabled: disabledProp,
    error: errorProp,
    fullWidth = false,
    inputComponent = 'input',
    label,
    multiline = false,
    notched: notchedProp,
    size,
    startAdornment,
    endAdornment,
    type = 'text',
    ...other
  } = props;

  const muiFormControl = useFormControl();
  const [focused, setFocused] = React.useState(false);
  const [filled, setFilled] = React.useState(
    Boolean(props.value || props.defaultValue)
  );

  const fcs = muiFormControl || {};
  const disabled = disabledProp ?? fcs.disabled ?? false;
  const error = errorProp ?? fcs.error ?? false;
  const required = props.required ?? fcs.required ?? false;

  const handleFocus = (event) => {
    setFocused(true);
    if (props.onFocus) {
      props.onFocus(event);
    }
  };

  const handleBlur = (event) => {
    setFocused(false);
    if (props.onBlur) {
      props.onBlur(event);
    }
  };

  const handleChange = (event) => {
    setFilled(event.target.value !== '');
    if (props.onChange) {
      props.onChange(event);
    }
  };

  const notched =
    typeof notchedProp !== 'undefined'
      ? notchedProp
      : Boolean(startAdornment || filled || focused);

  const withLabel = label != null && label !== '';

  const notchedLabel =
    withLabel && required ? (
      <React.Fragment>
        {label}
        &thinsp;{'*'}
      </React.Fragment>
    ) : (
      label
    );

  const getBorderColor = () => {
    if (disabled) return 'rgba(0, 0, 0, 0.26)';
    if (error) return '#d32f2f';
    if (focused) return '#1976d2';
    return 'rgba(0, 0, 0, 0.23)';
  };

  const containerStyle = {
    position: 'relative',
    borderRadius: 4,
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : undefined,
    ...(startAdornment && { paddingLeft: 14 }),
    ...(endAdornment && { paddingRight: 14 }),
    ...(multiline && {
      padding: size === 'small' ? '8.5px 14px' : '16.5px 14px',
    }),
  };

  const inputStyle = {
    padding: size === 'small' ? '8.5px 14px' : '16.5px 14px',
    ...(multiline && { padding: 0 }),
    ...(startAdornment && { paddingLeft: 0 }),
    ...(endAdornment && { paddingRight: 0 }),
  };

  const fieldsetStyle = {
    textAlign: 'left',
    position: 'absolute',
    bottom: 0,
    right: 0,
    top: -5,
    left: 0,
    margin: 0,
    padding: '0 8px',
    pointerEvents: 'none',
    borderRadius: 'inherit',
    borderStyle: 'solid',
    borderWidth: focused ? 2 : 1,
    borderColor: getBorderColor(),
    overflow: 'hidden',
    minWidth: '0%',
    transition: 'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const legendStyle = {
    float: 'unset',
    width: 'auto',
    overflow: 'hidden',
    display: withLabel ? 'block' : undefined,
    padding: 0,
    height: withLabel ? 11 : undefined,
    lineHeight: withLabel ? undefined : '11px',
    fontSize: withLabel ? '0.75em' : undefined,
    visibility: withLabel ? 'hidden' : undefined,
    maxWidth: withLabel ? (notched ? '100%' : 0.01) : undefined,
    transition: withLabel
      ? notched
        ? 'max-width 100ms cubic-bezier(0.4, 0, 0.2, 1) 50ms'
        : 'max-width 50ms cubic-bezier(0.4, 0, 0.2, 1)'
      : 'width 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    whiteSpace: withLabel ? 'nowrap' : undefined,
  };

  const legendSpanStyle = withLabel
    ? {
        paddingLeft: 5,
        paddingRight: 5,
        display: 'inline-block',
        opacity: 0,
        visibility: 'visible',
      }
    : undefined;

  return (
    <div style={containerStyle} className={className}>
      <InputBase
        inputComponent={inputComponent}
        multiline={multiline}
        ref={ref}
        type={type}
        disabled={disabled}
        fullWidth={fullWidth}
        startAdornment={startAdornment}
        endAdornment={endAdornment}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        style={inputStyle}
        {...other}
      />
      <fieldset aria-hidden style={fieldsetStyle}>
        <legend style={legendStyle}>
          {withLabel ? (
            <span style={legendSpanStyle}>{notchedLabel}</span>
          ) : (
            <span className="notranslate" aria-hidden>
              &#8203;
            </span>
          )}
        </legend>
      </fieldset>
    </div>
  );
});

OutlinedInput.muiName = 'Input';

export default OutlinedInput;
