'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { getListItemIconUtilityClass } from './listItemIconClasses';
import ListContext from '../../../data-display/List/ListContext';

const useUtilityClasses = (ownerState) => {
  const { alignItems, classes } = ownerState;

  const slots = {
    root: ['root', alignItems === 'flex-start' && 'alignItemsFlexStart'],
  };

  return composeClasses(slots, getListItemIconUtilityClass, classes);
};

/**
 * A simple wrapper to apply `List` styles to an `Icon` or `SvgIcon`.
 */
const ListItemIcon = React.forwardRef(function ListItemIcon(props, ref) {
  const { className, ...other } = props;
  const context = React.useContext(ListContext);
  const ownerState = { ...props, alignItems: context.alignItems };
  const classes = useUtilityClasses(ownerState);
  const { alignItems } = context;

  const style = {
    minWidth: 56,
    color: 'rgba(0, 0, 0, 0.54)',
    flexShrink: 0,
    display: 'inline-flex',
    marginTop: alignItems === 'flex-start' ? 8 : undefined,
  };

  return (
    <div
      ref={ref}
      style={style}
      className={clsx(classes.root, className)}
      {...other}
    />
  );
});

ListItemIcon.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component, normally `Icon`, `SvgIcon`,
   * or a `@mui/icons-material` SVG icon element.
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

export default ListItemIcon;
