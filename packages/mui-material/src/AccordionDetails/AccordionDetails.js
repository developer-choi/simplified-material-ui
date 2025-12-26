'use client';
import * as React from 'react';

const AccordionDetails = React.forwardRef(function AccordionDetails(props, ref) {
  const { className, children, style, ...other } = props;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        padding: '8px 16px 16px',
        ...style,
      }}
      {...other}
    >
      {children}
    </div>
  );
});

export default AccordionDetails;
