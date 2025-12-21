'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import rootShouldForwardProp from '../styles/rootShouldForwardProp';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import ListContext from '../List/ListContext';
import ButtonBase from '../ButtonBase';
import useForkRef from '../utils/useForkRef';
import { listItemIconClasses } from '../ListItemIcon';
import { listItemTextClasses } from '../ListItemText';
import menuItemClasses, { getMenuItemUtilityClass } from './menuItemClasses';

export const overridesResolver = (props, styles) => {
  const { ownerState } = props;

  return [
    styles.root,
  ];
};

const useUtilityClasses = (ownerState) => {
  const { disabled, selected, classes } = ownerState;
  const slots = {
    root: [
      'root',
      disabled && 'disabled',
      selected && 'selected',
    ],
  };

  const composedClasses = composeClasses(slots, getMenuItemUtilityClass, classes);

  return {
    ...classes,
    ...composedClasses,
  };
};

const MenuItemRoot = styled(ButtonBase, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiMenuItem',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    ...theme.typography.body1,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    textDecoration: 'none',
    minHeight: 48,
    paddingTop: 6,
    paddingBottom: 6,
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    '&:hover': {
      textDecoration: 'none',
      backgroundColor: (theme.vars || theme).palette.action.hover,
    },
    [`&.${menuItemClasses.selected}`]: {
      backgroundColor: '#e3f2fd',
    },
    [`&.${menuItemClasses.focusVisible}`]: {
      backgroundColor: (theme.vars || theme).palette.action.focus,
    },
    [`&.${menuItemClasses.disabled}`]: {
      opacity: (theme.vars || theme).palette.action.disabledOpacity,
    },
    [`& .${listItemTextClasses.root}`]: {
      marginTop: 0,
      marginBottom: 0,
    },
    [`& .${listItemTextClasses.inset}`]: {
      paddingLeft: 36,
    },
    [`& .${listItemIconClasses.root}`]: {
      minWidth: 36,
    },
    paddingLeft: 16,
    paddingRight: 16,
  })),
);

const MenuItem = React.forwardRef(function MenuItem(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiMenuItem' });
  const {
    component = 'li',
    role = 'menuitem',
    tabIndex: tabIndexProp,
    className,
    ...other
  } = props;

  const context = React.useContext(ListContext);
  const childContext = React.useMemo(
    () => ({
      dense: context.dense || false,
      disableGutters: false,
    }),
    [context.dense],
  );

  const ownerState = {
    ...props,
  };

  const classes = useUtilityClasses(props);

  const handleRef = useForkRef(null, ref);

  let tabIndex;
  if (!props.disabled) {
    tabIndex = tabIndexProp !== undefined ? tabIndexProp : -1;
  }

  return (
    <ListContext.Provider value={childContext}>
      <MenuItemRoot
        ref={handleRef}
        role={role}
        tabIndex={tabIndex}
        component={component}
        className={clsx(classes.root, className)}
        {...other}
        ownerState={ownerState}
        classes={classes}
      />
    </ListContext.Provider>
  );
});

MenuItem.propTypes /* remove-proptypes */ = {
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
   * @ignore
   */
  disabled: PropTypes.bool,
  /**
   * @ignore
   */
  role: PropTypes.string,
  /**
   * If `true`, the component is selected.
   * @default false
   */
  selected: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * @default 0
   */
  tabIndex: PropTypes.number,
};

export default MenuItem;
