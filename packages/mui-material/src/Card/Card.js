'use client';
import * as React from 'react';
import Paper from '../../../surfaces/Paper';

const Card = React.forwardRef(function Card(props, ref) {
  const { className, raised = false, style, ...other } = props;

  return (
    <Paper
      ref={ref}
      className={className}
      style={{ overflow: 'hidden', ...style }}
      elevation={raised ? 8 : 1}
      {...other}
    />
  );
});

export default Card;
