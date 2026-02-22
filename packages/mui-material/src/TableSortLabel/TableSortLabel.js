'use client';
import * as React from 'react';

const ArrowDownwardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}
  >
    <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
  </svg>
);

const TableSortLabel = React.forwardRef(function TableSortLabel(props, ref) {
  const {
    active = false,
    children,
    className,
    direction = 'asc',
    hideSortIcon = false,
    style,
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
        ...style,
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

export default TableSortLabel;
