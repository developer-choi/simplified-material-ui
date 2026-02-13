'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import ListContext from '../../../data-display/List/ListContext';
import { getListItemSecondaryActionClassesUtilityClass } from './listItemSecondaryActionClasses';

const useUtilityClasses = (ownerState) => {
  const { disableGutters, classes } = ownerState;

  const slots = {
    root: ['root', disableGutters && 'disableGutters'],
  };

  return composeClasses(slots, getListItemSecondaryActionClassesUtilityClass, classes);
};

/**
 * Must be used as the last child of ListItem to function properly.
 *
 * @deprecated Use the `secondaryAction` prop in the `ListItem` component instead. This component will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
 */
const ListItemSecondaryAction = React.forwardRef(function ListItemSecondaryAction(props, ref) {
  const { className, ...other } = props;
  const context = React.useContext(ListContext);
  const { disableGutters } = context;

  const style = {
    position: 'absolute',
    right: disableGutters ? 0 : 16,
    top: '50%',
    transform: 'translateY(-50%)',
  };

  const ownerState = { ...props, disableGutters };
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

ListItemSecondaryAction.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component, normally an `IconButton` or selection control.
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

ListItemSecondaryAction.muiName = 'ListItemSecondaryAction';

export default ListItemSecondaryAction;
