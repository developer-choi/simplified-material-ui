'use client';
import * as React from 'react';

const CardActions = React.forwardRef(function CardActions(props, ref) {
  const { disableSpacing = false, className, ...other } = props;

  const styles = {
    display: 'flex',
    alignItems: 'center',
    padding: 8,
    gap: disableSpacing ? 0 : 8,
  };

  return (
    <div
      ref={ref}
      className={className}
      style={styles}
      {...other}
    />
  );
});

export default CardActions;
