'use client';
import * as React from 'react';

const ListSubheader = React.forwardRef(function ListSubheader(props, ref) {
  const {
    className,
    color = 'default',
    component = 'li',
    disableGutters = false,
    disableSticky = false,
    inset = false,
    ...other
  } = props;

  const Component = component;

  const baseStyle = {
    boxSizing: 'border-box',
    lineHeight: '48px',
    listStyle: 'none',
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: 500,
    fontSize: '14px',
  };

  const colorStyle =
    color === 'primary'
      ? { color: '#1976d2' }
      : color === 'inherit'
        ? { color: 'inherit' }
        : { color: 'rgba(0, 0, 0, 0.6)' };

  const gutterStyle = !disableGutters
    ? { paddingLeft: 16, paddingRight: 16 }
    : {};

  const insetStyle = inset ? { paddingLeft: 72 } : {};

  const stickyStyle = !disableSticky
    ? {
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: '#fff',
      }
    : {};

  const style = {
    ...baseStyle,
    ...colorStyle,
    ...gutterStyle,
    ...insetStyle,
    ...stickyStyle,
  };

  return (
    <Component
      ref={ref}
      style={style}
      className={className}
      {...other}
    />
  );
});

if (ListSubheader) {
  ListSubheader.muiSkipListHighlight = true;
}

export default ListSubheader;
