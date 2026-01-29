'use client';
import * as React from 'react';

/**
 * `InputBase` contains as few styles as possible.
 * It aims to be a simple building block for creating an input.
 * It contains a load of style reset and some state logic.
 */
const InputBase = React.forwardRef(function InputBase(props, ref) {
  const {
    'aria-describedby': ariaDescribedby,
    autoComplete,
    autoFocus,
    className,
    defaultValue,
    disabled,
    endAdornment,
    error,
    id,
    inputProps: inputPropsProp = {},
    inputRef: inputRefProp,
    name,
    onBlur,
    onChange,
    onClick,
    onFocus,
    onKeyDown,
    onKeyUp,
    placeholder,
    readOnly,
    renderSuffix,
    startAdornment,
    type = 'text',
    value: valueProp,
    ...other
  } = props;

  const value = inputPropsProp.value != null ? inputPropsProp.value : valueProp;
  const { current: isControlled } = React.useRef(value != null);

  const inputRef = inputRefProp || React.useRef();

  const [focused, setFocused] = React.useState(false);

  const fcs = {
    disabled: disabled || false,
    error: error || false,
    required: false,
    hiddenLabel: false,
    filled: false,
  };

  fcs.focused = focused;

  // The blur won't fire when the disabled state is set on a focused input.
  // We need to book keep the focused state manually.
  React.useEffect(() => {
    if (disabled && focused) {
      setFocused(false);
      if (onBlur) {
        onBlur();
      }
    }
  }, [disabled, focused, onBlur]);

  const handleFocus = (event) => {
    if (onFocus) {
      onFocus(event);
    }
    if (inputPropsProp.onFocus) {
      inputPropsProp.onFocus(event);
    }

    setFocused(true);
  };

  const handleBlur = (event) => {
    if (onBlur) {
      onBlur(event);
    }
    if (inputPropsProp.onBlur) {
      inputPropsProp.onBlur(event);
    }

    setFocused(false);
  };

  const handleChange = (event, ...args) => {
    if (!isControlled) {
      const element = event.target || inputRef.current;
      if (element == null) {
        throw /* minify-error */ new Error(
          'MUI: Expected valid input target. ' +
            'Did you use a custom `inputComponent` and forget to forward refs? ' +
            'See https://mui.com/r/input-component-ref-interface for more info.',
        );
      }
    }

    if (inputPropsProp.onChange) {
      inputPropsProp.onChange(event, ...args);
    }

    // Perform in the willUpdate
    if (onChange) {
      onChange(event, ...args);
    }
  };

  const handleClick = (event) => {
    if (inputRef.current && event.currentTarget === event.target) {
      inputRef.current.focus();
    }

    if (onClick) {
      onClick(event);
    }
  };

  const rootStyle = {
    lineHeight: '1.4375em',
    boxSizing: 'border-box',
    position: 'relative',
    cursor: fcs.disabled ? 'default' : 'text',
    display: 'inline-flex',
    alignItems: 'center',
  };

  const inputStyle = {
    font: 'inherit',
    letterSpacing: 'inherit',
    color: 'currentColor',
    padding: '4px 0 5px',
    border: 0,
    boxSizing: 'content-box',
    background: 'none',
    height: '1.4375em',
    margin: 0,
    WebkitTapHighlightColor: 'transparent',
    display: 'block',
    minWidth: 0,
    width: '100%',
    ...(type === 'search' && { MozAppearance: 'textfield' }),
  };

  return (
    <div
        ref={ref}
        onClick={handleClick}
        {...other}
        className={className}
        style={rootStyle}
      >
        {startAdornment}
        <input
            aria-invalid={fcs.error}
            aria-describedby={ariaDescribedby}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            defaultValue={defaultValue}
            disabled={fcs.disabled}
            id={id}
            name={name}
            placeholder={placeholder}
            readOnly={readOnly}
            required={fcs.required}
            value={value}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            type={type}
            {...inputPropsProp}
            ref={inputRef}
            className={inputPropsProp.className}
            style={{ ...inputStyle, ...inputPropsProp.style }}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
          />
        {endAdornment}
        {renderSuffix
          ? renderSuffix({
              ...fcs,
              startAdornment,
            })
          : null}
      </div>
    </div>
  );
});

export default InputBase;
