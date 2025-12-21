'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import HTMLElementType from '@mui/utils/HTMLElementType';
import MenuList from '../MenuList';
import Popover, { PopoverPaper } from '../Popover';
import rootShouldForwardProp from '../styles/rootShouldForwardProp';
import { styled } from '../zero-styled';

const MenuRoot = styled(Popover, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiMenu',
  slot: 'Root',
})({});

export const MenuPaper = styled(PopoverPaper, {
  name: 'MuiMenu',
  slot: 'Paper',
})({
  // specZ: The maximum height of a simple menu should be one or more rows less than the view
  // height. This ensures a tappable area outside of the simple menu with which to dismiss
  // the menu.
  maxHeight: 'calc(100% - 96px)',
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: 'touch',
});

const MenuMenuList = styled(MenuList, {
  name: 'MuiMenu',
  slot: 'List',
})({
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0,
});

const Menu = React.forwardRef(function Menu(props, ref) {
  const {
    children,
    className,
    onClose,
    open,
    ...other
  } = props;

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();

      if (onClose) {
        onClose(event, 'tabKeyDown');
      }
    }
  };

  return (
    <MenuRoot
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        component: MenuPaper,
      }}
      open={open}
      ref={ref}
      className={className}
      {...other}
    >
      <MenuMenuList
        autoFocus
        onKeyDown={handleListKeyDown}
      >
        {children}
      </MenuMenuList>
    </MenuRoot>
  );
});

Menu.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * An HTML element, or a function that returns one.
   * It's used to set the position of the menu.
   */
  anchorEl: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    HTMLElementType,
    PropTypes.func,
  ]),
  /**
   * Menu contents, normally `MenuItem`s.
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * Callback fired when the component requests to be closed.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"escapeKeyDown"`, `"backdropClick"`, `"tabKeyDown"`.
   */
  onClose: PropTypes.func,
  /**
   * If `true`, the component is shown.
   */
  open: PropTypes.bool.isRequired,
};

export default Menu;
