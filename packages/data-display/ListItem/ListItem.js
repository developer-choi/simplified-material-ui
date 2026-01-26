'use client';
import * as React from 'react';
import ListContext from '../List/ListContext';

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
    dense = false,
    style,
    ...other
  } = props;

  // 부모 List의 Context 소비
  const context = React.useContext(ListContext);

  // 자식에게 전달할 Context 생성
  const childContext = React.useMemo(
    () => ({
      dense: dense || context.dense || false,
    }),
    [context.dense, dense],
  );

  const isDense = childContext.dense;

  // 스타일 계산
  const computedStyle = {
    ...baseStyle,
    ...style,
  };

  return (
    <ListContext.Provider value={childContext}>
      <Component
        ref={ref}
        className={className}
        style={computedStyle}
        {...other}
      >
        {children}
      </Component>
    </ListContext.Provider>
  );
});

export default ListItem;
