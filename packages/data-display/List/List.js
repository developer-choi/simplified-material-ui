'use client';
import * as React from 'react';
import ListContext from './ListContext';

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
    dense = false,
    subheader,
    style,
    ...other
  } = props;

  const context = React.useMemo(() => ({ dense }), [dense]);

  // 스타일 계산
  const computedStyle = {
    ...baseStyle,
    ...style,
  };

  return (
    <ListContext.Provider value={context}>
      <Component
        ref={ref}
        className={className}
        style={computedStyle}
        {...other}
      >
        {subheader}
        {children}
      </Component>
    </ListContext.Provider>
  );
});

export default List;
