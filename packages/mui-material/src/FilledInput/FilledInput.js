'use client';
import * as React from 'react';
import refType from '@mui/utils/refType';
import PropTypes from 'prop-types';
import InputBase from '../../../form/InputBase';
import useFormControl from '../../../form/FormControl/useFormControl';

const FilledInput = React.forwardRef(function FilledInput(props, ref) {
  const {
    className,
    disableUnderline = false,
    disabled: disabledProp,
    error: errorProp,
    fullWidth = false,
    hiddenLabel,
    inputComponent = 'input',
    multiline = false,
    size,
    startAdornment,
    endAdornment,
    type = 'text',
    ...other
  } = props;

  const muiFormControl = useFormControl();
  const [focused, setFocused] = React.useState(false);

  const fcs = muiFormControl || {};
  const disabled = disabledProp ?? fcs.disabled ?? false;
  const error = errorProp ?? fcs.error ?? false;

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

  const containerStyle = {
    position: 'relative',
    backgroundColor: disabled ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.06)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    transition: 'background-color 150ms cubic-bezier(0.0, 0, 0.2, 1)',
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : undefined,
    ...(startAdornment && { paddingLeft: 12 }),
    ...(endAdornment && { paddingRight: 12 }),
    ...(multiline && !hiddenLabel && {
      padding: size === 'small' ? '21px 12px 4px' : '25px 12px 8px',
    }),
    ...(multiline && hiddenLabel && {
      padding: size === 'small' ? '8px 12px 9px' : '16px 12px 17px',
    }),
  };

  const inputStyle = {
    paddingTop: hiddenLabel ? (size === 'small' ? 8 : 16) : (size === 'small' ? 21 : 25),
    paddingRight: endAdornment ? 0 : 12,
    paddingBottom: hiddenLabel ? (size === 'small' ? 9 : 17) : (size === 'small' ? 4 : 8),
    paddingLeft: startAdornment ? 0 : 12,
    ...(multiline && {
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
    }),
  };

  const underlineBeforeStyle = {
    borderBottom: error ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.42)',
    left: 0,
    bottom: 0,
    position: 'absolute',
    right: 0,
    transition: 'border-bottom-color 150ms',
    pointerEvents: 'none',
    content: '""',
    ...(disabled && {
      borderBottomStyle: 'dotted',
    }),
  };

  const underlineAfterStyle = {
    borderBottom: error ? '2px solid #d32f2f' : '2px solid #1976d2',
    left: 0,
    bottom: 0,
    position: 'absolute',
    right: 0,
    transform: focused ? 'scaleX(1) translateX(0)' : 'scaleX(0)',
    transition: 'transform 150ms cubic-bezier(0.0, 0, 0.2, 1)',
    pointerEvents: 'none',
    content: '""',
  };

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
        style={inputStyle}
        {...other}
      />
      {!disableUnderline && (
        <>
          <span style={underlineBeforeStyle} />
          <span style={underlineAfterStyle} />
        </>
      )}
    </div>
  );
});

FilledInput.propTypes /* remove-proptypes */ = {
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  defaultValue: PropTypes.any,
  disabled: PropTypes.bool,
  disableUnderline: PropTypes.bool,
  endAdornment: PropTypes.node,
  error: PropTypes.bool,
  fullWidth: PropTypes.bool,
  hiddenLabel: PropTypes.bool,
  id: PropTypes.string,
  inputComponent: PropTypes.elementType,
  inputProps: PropTypes.object,
  inputRef: refType,
  margin: PropTypes.oneOf(['dense', 'none']),
  maxRows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minRows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  multiline: PropTypes.bool,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.oneOf(['small', 'medium']),
  startAdornment: PropTypes.node,
  type: PropTypes.string,
  value: PropTypes.any,
};

FilledInput.muiName = 'Input';

export default FilledInput;
