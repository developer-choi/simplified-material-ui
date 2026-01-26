'use client';
import * as React from 'react';

// 기본 스타일
const baseStyle = {
  display: 'flex',
  flexGrow: 1,
  justifyContent: 'flex-start',
  alignItems: 'center',
  position: 'relative',
  textDecoration: 'none',
  minWidth: 0,
  boxSizing: 'border-box',
  textAlign: 'left',
  paddingTop: 8,
  paddingBottom: 8,
  cursor: 'pointer',
  transition: 'background-color 150ms',
};

const disabledStyle = {
  opacity: 0.5,
  cursor: 'default',
};

const ListItemButton = React.forwardRef(function ListItemButton(props, ref) {
  const {
    component: Component = 'button',
    children,
    className,
    disabled = false,
    style,
    ...other
  } = props;

  // 스타일 계산
  const computedStyle = {
    ...baseStyle,
    ...(disabled && disabledStyle),
    ...style,
  };

  return (
    <Component
      ref={ref}
      className={className}
      style={computedStyle}
      disabled={disabled}
      {...other}
    >
      {children}
    </Component>
  );
});

export default ListItemButton;
