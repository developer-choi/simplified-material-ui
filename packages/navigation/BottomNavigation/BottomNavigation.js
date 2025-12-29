'use client';
import * as React from 'react';

const BottomNavigation = React.forwardRef(function BottomNavigation(
  { children, onChange, showLabels = false, value, ...other },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: 56,
        backgroundColor: '#fff',
      }}
      {...other}
    >
      {React.Children.map(children, (child, childIndex) => {
        if (!React.isValidElement(child)) {
          return null;
        }

        const childValue = child.props.value === undefined ? childIndex : child.props.value;

        return React.cloneElement(child, {
          selected: childValue === value,
          showLabel: child.props.showLabel !== undefined ? child.props.showLabel : showLabels,
          value: childValue,
          onChange,
        });
      })}
    </div>
  );
});

export default BottomNavigation;
