'use client';
import * as React from 'react';
const Grid = React.forwardRef(function Grid(props, ref) {
  const {
    className,
    children,
    columns = 12,
    container = false,
    direction = 'row',
    wrap = 'wrap',
    size,
    offset,
    spacing = 0,
    ...other
  } = props;

  const gap = typeof spacing === 'string' ? spacing : `${spacing * 8}px`;

  const style = {
    minWidth: 0,
    boxSizing: 'border-box',
    ...(container && {
      display: 'flex',
      flexWrap: wrap,
      flexDirection: direction,
      '--Grid-columns': columns,
      '--Grid-gap': gap,
      gap: `var(--Grid-gap)`,
    }),
    ...(size === 'grow' && {
      flexBasis: 0,
      flexGrow: 1,
      maxWidth: '100%',
    }),
    ...(size === 'auto' && {
      flexBasis: 'auto',
      flexGrow: 0,
      flexShrink: 0,
      maxWidth: 'none',
      width: 'auto',
    }),
    ...(typeof size === 'number' && {
      flexGrow: 0,
      flexBasis: 'auto',
      width: `calc(100% * ${size} / var(--Grid-columns) - (var(--Grid-columns) - ${size}) * var(--Grid-gap) / var(--Grid-columns))`,
    }),
    ...(offset === 'auto' && { marginLeft: 'auto' }),
    ...(typeof offset === 'number' && offset === 0 && { marginLeft: '0px' }),
    ...(typeof offset === 'number' && offset > 0 && {
      marginLeft: `calc(100% * ${offset} / var(--Grid-columns) + var(--Grid-gap) * ${offset} / var(--Grid-columns))`,
    }),
  };

  return (
    <div ref={ref} className={className} style={style} {...other}>
      {children}
    </div>
  );
});

export default Grid;
