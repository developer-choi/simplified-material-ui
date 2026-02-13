'use client';
import * as React from 'react';
import ListContext from '../List/ListContext';

const ListItemAvatar = React.forwardRef(function ListItemAvatar(props, ref) {
  const { className, ...other } = props;
  const context = React.useContext(ListContext);
  const { alignItems } = context;

  const style = {
    minWidth: 56,
    flexShrink: 0,
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

export default ListItemAvatar;
