'use client';
import * as React from 'react';
import ListContext from '../List/ListContext';

/**
 * A simple wrapper to apply `List` styles to an `Icon` or `SvgIcon`.
 */
const ListItemIcon = React.forwardRef(function ListItemIcon(props, ref) {
  const { className, ...other } = props;
  const context = React.useContext(ListContext);
  const { alignItems } = context;

  const style = {
    minWidth: 56,
    color: 'rgba(0, 0, 0, 0.54)',
    flexShrink: 0,
    display: 'inline-flex',
    marginTop: alignItems === 'flex-start' ? 8 : undefined,
  };

  return (
    <div
      ref={ref}
      style={style}
      className={className}
      {...other}
    />
  );
});

export default ListItemIcon;
