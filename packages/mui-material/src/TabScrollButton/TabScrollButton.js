'use client';
import * as React from 'react';

const KeyboardArrowLeft = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}
  >
    <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
  </svg>
);

const KeyboardArrowRight = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}
  >
    <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
  </svg>
);

const TabScrollButton = React.forwardRef(function TabScrollButton(props, ref) {
  const {
    className,
    direction,
    disabled = false,
    orientation,
    style,
    ...other
  } = props;

  const isVertical = orientation === 'vertical';

  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: isVertical ? '100%' : 40,
        height: isVertical ? 40 : undefined,
        opacity: disabled ? 0 : 0.8,
        cursor: disabled ? 'default' : 'pointer',
        ...style,
      }}
      {...other}
    >
      <span style={{ display: 'block', transform: isVertical ? 'rotate(90deg)' : undefined }}>
        {direction === 'left' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </span>
    </div>
  );
});

export default TabScrollButton;
