'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import ListContext from '../../../data-display/List/ListContext';
import { getListItemAvatarUtilityClass } from './listItemAvatarClasses';

const useUtilityClasses = (ownerState) => {
  const { alignItems, classes } = ownerState;

  const slots = {
    root: ['root', alignItems === 'flex-start' && 'alignItemsFlexStart'],
  };

  return composeClasses(slots, getListItemAvatarUtilityClass, classes);
};

const ListItemAvatar = React.forwardRef(function ListItemAvatar(props, ref) {
  const { className, ...other } = props;
  const context = React.useContext(ListContext);
  const { alignItems } = context;

  const style = {
    minWidth: 56,
    flexShrink: 0,
    marginTop: alignItems === 'flex-start' ? 8 : undefined,
  };

  const ownerState = { ...props, alignItems };
  const classes = useUtilityClasses(ownerState);

  return (
    <div
      ref={ref}
      style={style}
      className={clsx(classes.root, className)}
      {...other}
    />
  );
});

ListItemAvatar.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component, normally an `Avatar`.
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
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default ListItemAvatar;
