'use client';
import * as React from 'react';
import PropTypes from 'prop-types';

const Badge = React.forwardRef(function Badge(props, ref) {
  const {
    className,
    children,
    badgeContent,
    ...other
  } = props;

  const rootStyle = {
    position: 'relative',
    display: 'inline-flex',
    verticalAlign: 'middle',
    flexShrink: 0,
  };

  const badgeStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    boxSizing: 'border-box',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    fontWeight: 500,
    fontSize: '0.75rem',
    minWidth: '20px',
    lineHeight: 1,
    padding: '0 6px',
    height: '20px',
    borderRadius: '10px',
    zIndex: 1,
    backgroundColor: '#1976d2',
    color: '#fff',
    top: 0,
    right: 0,
    transform: 'scale(1) translate(50%, -50%)',
    transformOrigin: '100% 0%',
  };

  return (
    <span
      className={className}
      ref={ref}
      style={rootStyle}
      {...other}
    >
      {children}
      <span style={badgeStyle}>
        {badgeContent}
      </span>
    </span>
  );
});

Badge.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content rendered within the badge.
   */
  badgeContent: PropTypes.node,
  /**
   * The badge will be added relative to this node.
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  className: PropTypes.string,
};

export default Badge;
