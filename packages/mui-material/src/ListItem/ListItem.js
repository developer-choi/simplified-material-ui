'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import ListContext from '../../../data-display/List/ListContext';
import ListItemSecondaryAction from '../ListItemSecondaryAction';

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
    alignItems = 'center',
    children,
    className,
    component: Component = 'li',
    dense = false,
    disableGutters = false,
    disablePadding = false,
    divider = false,
    secondaryAction,
    style,
    ...other
  } = props;

  // 부모 List의 Context 소비
  const context = React.useContext(ListContext);

  // 자식에게 전달할 Context 생성
  const childContext = React.useMemo(
    () => ({
      dense: dense || context.dense || false,
      alignItems,
      disableGutters,
    }),
    [alignItems, context.dense, dense, disableGutters],
  );

  const isDense = childContext.dense;

  // 스타일 계산
  const computedStyle = {
    ...baseStyle,
    // alignItems
    ...(alignItems === 'flex-start' && {
      alignItems: 'flex-start',
    }),
    // 패딩 (disablePadding이 false일 때)
    ...(!disablePadding && {
      paddingTop: isDense ? 4 : 8,
      paddingBottom: isDense ? 4 : 8,
    }),
    // 좌우 패딩 (disablePadding과 disableGutters가 둘 다 false일 때)
    ...(!disablePadding && !disableGutters && {
      paddingLeft: 16,
      paddingRight: 16,
    }),
    // secondaryAction이 있으면 오른쪽 여백 추가
    ...(secondaryAction && {
      paddingRight: 48,
    }),
    // 구분선
    ...(divider && {
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      backgroundClip: 'padding-box',
    }),
    // 사용자 style 오버라이드
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
        {secondaryAction && (
          <ListItemSecondaryAction>{secondaryAction}</ListItemSecondaryAction>
        )}
      </Component>
    </ListContext.Provider>
  );
});

ListItem.propTypes /* remove-proptypes */ = {
  /**
   * Defines the `align-items` style property.
   * @default 'center'
   */
  alignItems: PropTypes.oneOf(['center', 'flex-start']),
  /**
   * The content of the component.
   */
  children: PropTypes.node,
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
   * If `true`, compact vertical padding designed for keyboard and mouse input is used.
   * The prop defaults to the value inherited from the parent List component.
   * @default false
   */
  dense: PropTypes.bool,
  /**
   * If `true`, the left and right padding is removed.
   * @default false
   */
  disableGutters: PropTypes.bool,
  /**
   * If `true`, all padding is removed.
   * @default false
   */
  disablePadding: PropTypes.bool,
  /**
   * If `true`, a 1px light border is added to the bottom of the list item.
   * @default false
   */
  divider: PropTypes.bool,
  /**
   * The element to display at the end of ListItem.
   */
  secondaryAction: PropTypes.node,
  /**
   * @ignore
   */
  style: PropTypes.object,
};

export default ListItem;
