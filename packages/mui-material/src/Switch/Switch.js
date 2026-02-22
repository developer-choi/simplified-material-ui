'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import refType from '@mui/utils/refType';
import { useDefaultProps } from '../DefaultPropsProvider';

const Switch = React.forwardRef(function Switch(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiSwitch' });
  const {
    checked: checkedProp,
    className,
    defaultChecked = false,
    disabled = false,
    edge = false,
    onChange,
    size = 'medium',
    style,
    ...other
  } = props;

  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isChecked = checkedProp !== undefined ? checkedProp : internalChecked;

  const handleChange = (event) => {
    if (checkedProp === undefined) setInternalChecked(event.target.checked);
    onChange?.(event);
  };

  const isSmall = size === 'small';
  const thumbSize = isSmall ? 16 : 20;
  const switchPadding = isSmall ? 4 : 9;

  const thumbColor = disabled ? '#f5f5f5' : isChecked ? '#1976d2' : '#ffffff';
  const trackColor = isChecked && !disabled ? '#1976d2' : '#000000';
  const trackOpacity = disabled ? 0.12 : isChecked ? 0.5 : 0.38;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        width: isSmall ? 40 : 58,
        height: isSmall ? 24 : 38,
        overflow: 'hidden',
        padding: isSmall ? 7 : 12,
        boxSizing: 'border-box',
        position: 'relative',
        flexShrink: 0,
        zIndex: 0,
        verticalAlign: 'middle',
        ...(edge === 'start' && { marginLeft: -8 }),
        ...(edge === 'end' && { marginRight: -8 }),
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          color: thumbColor,
          padding: switchPadding,
          display: 'inline-flex',
          transform: isChecked ? `translateX(${isSmall ? 16 : 20}px)` : 'none',
          transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <input
          type="checkbox"
          role="switch"
          ref={ref}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          style={{
            cursor: 'inherit',
            position: 'absolute',
            opacity: 0,
            width: '300%',
            height: '100%',
            top: 0,
            left: '-100%',
            margin: 0,
            padding: 0,
          }}
          {...other}
        />
        <span
          style={{
            width: thumbSize,
            height: thumbSize,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
          }}
        />
      </span>
      <span
        style={{
          height: '100%',
          width: '100%',
          borderRadius: isSmall ? 5 : 7,
          zIndex: -1,
          backgroundColor: trackColor,
          opacity: trackOpacity,
          transition: 'opacity 150ms, background-color 150ms',
        }}
      />
    </span>
  );
});

Switch.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  checked: PropTypes.bool,
  checkedIcon: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning']),
    PropTypes.string,
  ]),
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  disableRipple: PropTypes.bool,
  edge: PropTypes.oneOf(['end', 'start', false]),
  icon: PropTypes.node,
  id: PropTypes.string,
  inputProps: PropTypes.object,
  inputRef: refType,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  size: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['medium', 'small']),
    PropTypes.string,
  ]),
  slotProps: PropTypes.shape({
    input: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    root: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    switchBase: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    thumb: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    track: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  }),
  slots: PropTypes.shape({
    input: PropTypes.elementType,
    root: PropTypes.elementType,
    switchBase: PropTypes.elementType,
    thumb: PropTypes.elementType,
    track: PropTypes.elementType,
  }),
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  value: PropTypes.any,
};

export default Switch;
