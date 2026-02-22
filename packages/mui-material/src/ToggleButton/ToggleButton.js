'use client';
import * as React from 'react';
import ToggleButtonGroupContext from '../ToggleButtonGroup/ToggleButtonGroupContext';
import isValueSelected from '../ToggleButtonGroup/isValueSelected';

const selectedColors = {
  standard:  { color: 'rgba(0,0,0,0.87)', backgroundColor: 'rgba(0,0,0,0.08)' },
  primary:   { color: '#1976d2',          backgroundColor: 'rgba(25,118,210,0.08)' },
  secondary: { color: '#9c27b0',          backgroundColor: 'rgba(156,39,176,0.08)' },
  error:     { color: '#d32f2f',          backgroundColor: 'rgba(211,47,47,0.08)' },
  warning:   { color: '#ed6c02',          backgroundColor: 'rgba(237,108,2,0.08)' },
  info:      { color: '#0288d1',          backgroundColor: 'rgba(2,136,209,0.08)' },
  success:   { color: '#2e7d32',          backgroundColor: 'rgba(46,125,50,0.08)' },
};

const sizePaddingMap = { small: 7, medium: 11, large: 15 };

const ToggleButton = React.forwardRef(function ToggleButton(props, ref) {
  const {
    children,
    className,
    color: colorProp,
    disabled: disabledProp,
    fullWidth: fullWidthProp,
    onChange: onChangeProp,
    onClick,
    selected: selectedProp,
    size: sizeProp,
    style,
    value,
    ...other
  } = props;

  const { value: contextValue, ...groupContext } = React.useContext(ToggleButtonGroupContext);
  const color    = colorProp    ?? groupContext.color    ?? 'standard';
  const disabled = disabledProp ?? groupContext.disabled ?? false;
  const fullWidth = fullWidthProp ?? groupContext.fullWidth ?? false;
  const size     = sizeProp     ?? groupContext.size     ?? 'medium';
  const onChange = groupContext.onChange ?? onChangeProp;
  const selected = selectedProp !== undefined ? selectedProp : isValueSelected(value, contextValue);

  const handleChange = (event) => {
    if (onClick) {
      onClick(event, value);
      if (event.defaultPrevented) return;
    }
    if (onChange) onChange(event, value);
  };

  const selColor = selectedColors[color] ?? selectedColors.primary;

  return (
    <button
      className={className}
      ref={ref}
      disabled={disabled}
      aria-pressed={selected}
      onClick={handleChange}
      value={value}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxSizing: 'border-box',
        outline: 0,
        margin: 0,
        appearance: 'none',
        cursor: disabled ? 'default' : 'pointer',
        textDecoration: 'none',
        userSelect: 'none',
        verticalAlign: 'middle',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 4,
        padding: sizePaddingMap[size] ?? 11,
        fontFamily: 'inherit',
        fontSize: size === 'small' ? '0.8125rem' : size === 'large' ? '0.9375rem' : '0.875rem',
        fontWeight: 500,
        lineHeight: 1.75,
        letterSpacing: '0.02857em',
        textTransform: 'uppercase',
        color: disabled ? 'rgba(0,0,0,0.38)' : selected ? selColor.color : 'rgba(0,0,0,0.54)',
        backgroundColor: selected && !disabled ? selColor.backgroundColor : 'transparent',
        ...(fullWidth && { width: '100%' }),
        ...style,
      }}
      {...other}
    >
      {children}
    </button>
  );
});

export default ToggleButton;
