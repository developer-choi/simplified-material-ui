'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import capitalize from '../utils/capitalize';
import { useDefaultProps } from '../DefaultPropsProvider';
import tabClasses, { getTabUtilityClass } from './tabClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, textColor, fullWidth, wrapped, icon, label, selected, disabled } = ownerState;

  const slots = {
    root: [
      'root',
      icon && label && 'labelIcon',
      `textColor${capitalize(textColor)}`,
      fullWidth && 'fullWidth',
      wrapped && 'wrapped',
      selected && 'selected',
      disabled && 'disabled',
    ],
    icon: ['iconWrapper', 'icon'],
  };

  return composeClasses(slots, getTabUtilityClass, classes);
};

const tabSelectedColor = { primary: '#1976d2', secondary: '#9c27b0' };

const Tab = React.forwardRef(function Tab(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiTab' });
  const {
    className,
    disabled = false,
    disableFocusRipple = false,
    // eslint-disable-next-line react/prop-types
    fullWidth,
    icon: iconProp,
    iconPosition = 'top',
    // eslint-disable-next-line react/prop-types
    indicator,
    label,
    onChange,
    onClick,
    onFocus,
    // eslint-disable-next-line react/prop-types
    selected,
    // eslint-disable-next-line react/prop-types
    selectionFollowsFocus,
    style,
    // eslint-disable-next-line react/prop-types
    textColor = 'inherit',
    value,
    wrapped = false,
    ...other
  } = props;

  const ownerState = {
    ...props,
    disabled,
    disableFocusRipple,
    selected,
    icon: !!iconProp,
    iconPosition,
    label: !!label,
    fullWidth,
    textColor,
    wrapped,
  };

  const classes = useUtilityClasses(ownerState);

  const handleClick = (event) => {
    if (!selected && onChange) onChange(event, value);
    if (onClick) onClick(event);
  };

  const handleFocus = (event) => {
    if (selectionFollowsFocus && !selected && onChange) onChange(event, value);
    if (onFocus) onFocus(event);
  };

  const hasIconAndLabel = !!iconProp && !!label;
  const iconEl = hasIconAndLabel
    ? <span style={{
        ...(iconPosition === 'top'    && { marginBottom: 6 }),
        ...(iconPosition === 'bottom' && { marginTop: 6 }),
        ...(iconPosition === 'start'  && { marginRight: 8 }),
        ...(iconPosition === 'end'    && { marginLeft: 8 }),
      }}>{iconProp}</span>
    : iconProp;

  const textColorStyle = textColor === 'inherit'
    ? { color: 'inherit', opacity: disabled ? 0.38 : selected ? 1 : 0.6 }
    : { color: disabled ? 'rgba(0,0,0,0.38)' : selected
        ? (tabSelectedColor[textColor] ?? 'rgba(0,0,0,0.87)')
        : 'rgba(0,0,0,0.6)' };

  return (
    <button
      className={clsx(classes.root, className)}
      ref={ref}
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      onClick={handleClick}
      onFocus={handleFocus}
      tabIndex={selected ? 0 : -1}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxSizing: 'border-box',
        outline: 0,
        margin: 0,
        appearance: 'none',
        border: 0,
        backgroundColor: 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        textDecoration: 'none',
        userSelect: 'none',
        verticalAlign: 'middle',
        maxWidth: fullWidth ? 'none' : 360,
        minWidth: 90,
        minHeight: hasIconAndLabel ? 72 : 48,
        flexShrink: fullWidth ? 1 : 0,
        ...(fullWidth && { flexGrow: 1, flexBasis: 0 }),
        padding: hasIconAndLabel ? '9px 16px' : '12px 16px',
        overflow: 'hidden',
        whiteSpace: 'normal',
        textAlign: 'center',
        lineHeight: 1.25,
        flexDirection: hasIconAndLabel && (iconPosition === 'top' || iconPosition === 'bottom')
          ? 'column' : 'row',
        fontFamily: 'inherit',
        fontSize: wrapped ? '0.75rem' : '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.02857em',
        textTransform: 'uppercase',
        ...textColorStyle,
        ...style,
      }}
      {...other}
    >
      {iconPosition === 'top' || iconPosition === 'start' ? (
        <React.Fragment>{iconEl}{label}</React.Fragment>
      ) : (
        <React.Fragment>{label}{iconEl}</React.Fragment>
      )}
      {indicator}
    </button>
  );
});

Tab.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  disableFocusRipple: PropTypes.bool,
  disableRipple: PropTypes.bool,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  iconPosition: PropTypes.oneOf(['bottom', 'end', 'start', 'top']),
  label: PropTypes.node,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  value: PropTypes.any,
  wrapped: PropTypes.bool,
};

export default Tab;
