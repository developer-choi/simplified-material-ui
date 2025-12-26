'use client';
import * as React from 'react';
import AccordionContext from '../Accordion/AccordionContext';

const AccordionSummary = React.forwardRef(function AccordionSummary(props, ref) {
  const {
    children,
    className,
    expandIcon,
    onClick,
    style,
    ...other
  } = props;

  const { disabled = false, expanded, toggle } = React.useContext(AccordionContext);
  const handleChange = (event) => {
    if (toggle) {
      toggle(event);
    }
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      ref={ref}
      className={className}
      disabled={disabled}
      aria-expanded={expanded}
      onClick={handleChange}
      style={{
        display: 'flex',
        width: '100%',
        minHeight: expanded ? 64 : 48,
        padding: '0 16px',
        transition: 'min-height 150ms, background-color 150ms',
        border: 'none',
        background: 'none',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.38 : 1,
        ...style,
      }}
      {...other}
    >
      <span
        style={{
          display: 'flex',
          textAlign: 'start',
          flexGrow: 1,
          margin: expanded ? '20px 0' : '12px 0',
          transition: 'margin 150ms',
        }}
      >
        {children}
      </span>
      {expandIcon && (
        <span
          style={{
            display: 'flex',
            color: 'rgba(0, 0, 0, 0.54)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms',
          }}
        >
          {expandIcon}
        </span>
      )}
    </button>
  );
});

export default AccordionSummary;
