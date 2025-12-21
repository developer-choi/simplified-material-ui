'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import ButtonBase from '../ButtonBase';

const MenuItem = React.forwardRef(function MenuItem(props, ref) {
  const {
    className,
    selected,
    disabled,
    children,
    style,
    ...other
  } = props;

  const baseStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    textDecoration: 'none',
    minHeight: 48,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 16,
    paddingRight: 16,
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    fontSize: '1rem',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
    backgroundColor: selected ? '#e3f2fd' : 'transparent',
    opacity: disabled ? 0.38 : 1,
    ...style,
  };

  return (
    <ButtonBase
      ref={ref}
      role="menuitem"
      component="li"
      className={className}
      style={baseStyle}
      disabled={disabled}
      {...other}
    >
      {children}
    </ButtonBase>
  );
});

MenuItem.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * @ignore
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, the component is selected.
   * @default false
   */
  selected: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default MenuItem;
