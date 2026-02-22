'use client';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useDefaultProps } from '../DefaultPropsProvider';

const ArrowDownwardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}
  >
    <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
  </svg>
);

/**
 * A button based label for placing inside `TableCell` for column sorting.
 */
const TableSortLabel = React.forwardRef(function TableSortLabel(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiTableSortLabel' });
  const {
    active = false,
    children,
    className,
    direction = 'asc',
    hideSortIcon = false,
    ...other
  } = props;

  const showIcon = active || !hideSortIcon;

  return (
    <span
      ref={ref}
      className={className}
      style={{
        cursor: 'pointer',
        display: 'inline-flex',
        justifyContent: 'flex-start',
        flexDirection: 'inherit',
        alignItems: 'center',
        ...(active && { color: 'rgba(0,0,0,0.87)' }),
      }}
      {...other}
    >
      {children}
      {showIcon && (
        <span
          style={{
            fontSize: 18,
            marginRight: 4,
            marginLeft: 4,
            opacity: active ? 1 : 0,
            color: active ? 'rgba(0,0,0,0.6)' : 'inherit',
            transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            userSelect: 'none',
            transform: direction === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ArrowDownwardIcon />
        </span>
      )}
    </span>
  );
});

TableSortLabel.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * If `true`, the label will have the active styling (should be true for the sorted column).
   * @default false
   */
  active: PropTypes.bool,
  /**
   * Label contents, the arrow will be appended automatically.
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The current sort direction.
   * @default 'asc'
   */
  direction: PropTypes.oneOf(['asc', 'desc']),
  /**
   * Hide sort icon when active is false.
   * @default false
   */
  hideSortIcon: PropTypes.bool,
};

export default TableSortLabel;
