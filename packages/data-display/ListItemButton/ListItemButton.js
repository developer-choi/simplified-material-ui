'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useDefaultProps } from '../DefaultPropsProvider';

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

const ListItemButton = React.forwardRef(function ListItemButton(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiListItemButton' });
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

ListItemButton.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component if a `ListItemSecondaryAction` is used it must
   * be the last child.
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
   * If `true`, the component is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * @ignore
   */
  style: PropTypes.object,
};

export default ListItemButton;
