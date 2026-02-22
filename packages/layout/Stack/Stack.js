'use client';
import * as React from 'react';

function joinChildren(children, separator) {
  const childrenArray = React.Children.toArray(children).filter(Boolean);
  return childrenArray.reduce((output, child, index) => {
    output.push(child);
    if (index < childrenArray.length - 1) {
      output.push(React.cloneElement(separator, { key: `separator-${index}` }));
    }
    return output;
  }, []);
}

const Stack = React.forwardRef(function Stack(props, ref) {
  const {
    children,
    className,
    direction = 'column',
    divider,
    spacing = 0,
    style,
    ...other
  } = props;

  const gap = typeof spacing === 'number' ? `${spacing * 8}px` : spacing;

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: 'flex', flexDirection: direction, gap, ...style }}
      {...other}
    >
      {divider ? joinChildren(children, divider) : children}
    </div>
  );
});

export default Stack;
