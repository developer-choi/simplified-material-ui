'use client';
import * as React from 'react';
import ButtonBase from '../../../form/ButtonBase';

const styles = {
  root: {
    display: 'block',
    textAlign: 'inherit',
    borderRadius: 'inherit',
    width: '100%',
  },
  focusHighlight: {
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 'inherit',
    opacity: 0,
    backgroundColor: 'currentcolor',
    transition: 'opacity 250ms',
  },
};

const CardActionArea = React.forwardRef(function CardActionArea(props, ref) {
  const {
    children,
    className,
    focusVisibleClassName,
    ...other
  } = props;

  return (
    <ButtonBase
      ref={ref}
      className={className}
      style={styles.root}
      focusVisibleClassName={focusVisibleClassName}
      onMouseEnter={(e) => {
        const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
        if (highlight) highlight.style.opacity = '0.04';
      }}
      onMouseLeave={(e) => {
        const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
        if (highlight) highlight.style.opacity = '0';
      }}
      onFocus={(e) => {
        const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
        if (highlight) highlight.style.opacity = '0.12';
      }}
      onBlur={(e) => {
        const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
        if (highlight) highlight.style.opacity = '0';
      }}
      {...other}
    >
      {children}
      <span data-focus-highlight style={styles.focusHighlight} />
    </ButtonBase>
  );
});

export default CardActionArea;
