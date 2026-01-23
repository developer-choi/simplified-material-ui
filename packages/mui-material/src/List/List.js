'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
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
    disablePadding = false,
    subheader,
    style,
    ...other
  } = props;

  const context = React.useMemo(() => ({ dense }), [dense]);

  // 스타일 계산
  const computedStyle = {
    ...baseStyle,
    // disablePadding이 false면 패딩 추가
    ...(!disablePadding && {
      paddingTop: 8,
      paddingBottom: 8,
    }),
    // subheader가 있으면 상단 패딩 제거
    ...(subheader && {
      paddingTop: 0,
    }),
    // 사용자 style 오버라이드
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

List.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, compact vertical padding designed for keyboard and mouse input is used for
   * the list and list items.
   * The prop is available to descendant components as the `dense` context.
   * @default false
   */
  dense: PropTypes.bool,
  /**
   * If `true`, vertical padding is removed from the list.
   * @default false
   */
  disablePadding: PropTypes.bool,
  /**
   * The content of the subheader, normally `ListSubheader`.
   */
  subheader: PropTypes.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default List;
