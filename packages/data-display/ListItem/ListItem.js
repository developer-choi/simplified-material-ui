'use client';
import * as React from 'react';

// 기본 스타일
const baseStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  position: 'relative',
  textDecoration: 'none',
  width: '100%',
  boxSizing: 'border-box',
  textAlign: 'left',
};

/**
 * ListItem 컴포넌트
 * List 내의 개별 목록 아이템을 렌더링합니다.
 */
const ListItem = React.forwardRef(function ListItem(props, ref) {
  const {
    children,
    className,
    component: Component = 'li',
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
        {children}
      </Component>
  );
});

export default ListItem;
