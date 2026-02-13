'use client';
import * as React from 'react';

const CardContent = React.forwardRef(function CardContent(props, ref) {
  const { className, component = 'div', ...other } = props;

  const styles = {
    padding: 16,
  };

  const Component = component;

  return (
    <Component
      ref={ref}
      className={className}
      style={styles}
      {...other}
    />
  );
});

export default CardContent;
