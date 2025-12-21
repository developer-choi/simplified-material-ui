'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import HTMLElementType from '@mui/utils/HTMLElementType';
import MenuList from '../MenuList';
import Popover, { PopoverPaper } from '../Popover';
import rootShouldForwardProp from '../styles/rootShouldForwardProp';
import { styled } from '../zero-styled';
import { useDefaultProps } from '../DefaultPropsProvider';
import { getMenuUtilityClass } from './menuClasses';

const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    paper: ['paper'],
    list: ['list'],
  };

  return composeClasses(slots, getMenuUtilityClass, classes);
};

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

const Menu = React.forwardRef(function Menu(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiMenu' });

  const {
    children,
    className,
    onClose,
    open,
    PopoverClasses,
    ...other
  } = props;

  const ownerState = {
    ...props,
  };

  const classes = useUtilityClasses(ownerState);

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
        className: classes.paper,
        component: MenuPaper,
      }}
      open={open}
      ref={ref}
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      {...other}
      classes={PopoverClasses}
    >
      <MenuMenuList
        autoFocus
        className={classes.list}
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
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
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
  /**
   * `classes` prop applied to the [`Popover`](https://mui.com/material-ui/api/popover/) element.
   */
  PopoverClasses: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default Menu;
