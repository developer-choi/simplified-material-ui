'use client';
import * as React from 'react';
import StepContext from '../Step/StepContext';

const StepContent = React.forwardRef(function StepContent(props, ref) {
  const { children, className, style, ...other } = props;

  const { active, last } = React.useContext(StepContext);

  return (
    <div
      className={className}
      ref={ref}
      style={{
        marginLeft: 12,
        paddingLeft: 20,
        paddingRight: 8,
        borderLeft: last ? 'none' : '1px solid #bdbdbd',
        ...style,
      }}
      {...other}
    >
      {active && children}
    </div>
  );
});

export default StepContent;
