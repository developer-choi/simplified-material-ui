'use client';
import * as React from 'react';
import PropTypes from 'prop-types';

const Backdrop = React.forwardRef(function Backdrop(props, ref) {
  const {
    children,
    open,
    style,
    ...other
  } = props;

  if (!open) {
    return null;
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      {...other}
      style={{
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        right: 0,
        bottom: 0,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {children}
    </div>
  );
});

Backdrop.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * If `true`, the component is shown.
   */
  open: PropTypes.bool.isRequired,
};

export default Backdrop;
