'use client';
import * as React from 'react';

// 기본 스타일
const baseStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  position: 'relative',
};

const List = React.forwardRef(function List(props, ref) {
  const {
    children,
    className,
    component: Component = 'ul',
    subheader,
    style,
    ...other
  } = props;

  // 스타일 계산
  const computedStyle = {
    ...baseStyle,
    ...style,
  };

  return (
    <Component
        ref={ref}
        className={className}
        style={computedStyle}
        {...other}
      >
        {subheader}
        {children}
      </Component>
  );
});

export default List;
