'use client';
import * as React from 'react';
import ArrowDropDownIcon from '../internal/svg-icons/ArrowDropDown';

/**
 * @ignore - internal component.
 */
const NativeSelectInput = React.forwardRef(function NativeSelectInput(props, ref) {
  const {
    disabled,
    error,
    multiple,
    open,
    ...other
  } = props;

  const selectStyle = {
    MozAppearance: 'none',
    WebkitAppearance: 'none',
    userSelect: 'none',
    borderRadius: 0,
    cursor: disabled ? 'default' : 'pointer',
    paddingRight: 24,
    minWidth: 16,
  };

  const iconStyle = {
    position: 'absolute',
    right: 0,
    top: 'calc(50% - .5em)',
    pointerEvents: 'none',
    color: disabled ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.54)',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    width: '1em',
    height: '1em',
  };

  return (
    <React.Fragment>
      <select
        style={selectStyle}
        disabled={disabled}
        ref={ref}
        multiple={multiple}
        {...other}
      />
      {!multiple && (
        <ArrowDropDownIcon style={iconStyle} />
      )}
    </React.Fragment>
  );
});

export default NativeSelectInput;
