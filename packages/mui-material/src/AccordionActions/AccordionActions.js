'use client';
import * as React from 'react';

const AccordionActions = React.forwardRef(function AccordionActions(props, ref) {
  const { className, children, style, ...other } = props;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 8,
        justifyContent: 'flex-end',
        gap: 8,
        ...style,
      }}
      {...other}
    >
      {children}
    </div>
  );
});

export default AccordionActions;
