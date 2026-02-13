'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import capitalize from '../utils/capitalize';
import { getListSubheaderUtilityClass } from './listSubheaderClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, color, disableGutters, inset, disableSticky } = ownerState;

  const slots = {
    root: [
      'root',
      color !== 'default' && `color${capitalize(color)}`,
      !disableGutters && 'gutters',
      inset && 'inset',
      !disableSticky && 'sticky',
    ],
  };

  return composeClasses(slots, getListSubheaderUtilityClass, classes);
};

const ListSubheader = React.forwardRef(function ListSubheader(props, ref) {
  const {
    className,
    color = 'default',
    component = 'li',
    disableGutters = false,
    disableSticky = false,
    inset = false,
    ...other
  } = props;

  const Component = component;

  const baseStyle = {
    boxSizing: 'border-box',
    lineHeight: '48px',
    listStyle: 'none',
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: 500,
    fontSize: '14px',
  };

  const colorStyle =
    color === 'primary'
      ? { color: '#1976d2' }
      : color === 'inherit'
        ? { color: 'inherit' }
        : { color: 'rgba(0, 0, 0, 0.6)' };

  const gutterStyle = !disableGutters
    ? { paddingLeft: 16, paddingRight: 16 }
    : {};

  const insetStyle = inset ? { paddingLeft: 72 } : {};

  const stickyStyle = !disableSticky
    ? {
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: '#fff',
      }
    : {};

  const style = {
    ...baseStyle,
    ...colorStyle,
    ...gutterStyle,
    ...insetStyle,
    ...stickyStyle,
  };

  const ownerState = {
    ...props,
    color,
    component,
    disableGutters,
    disableSticky,
    inset,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <Component
      ref={ref}
      style={style}
      className={clsx(classes.root, className)}
      {...other}
    />
  );
});

if (ListSubheader) {
  ListSubheader.muiSkipListHighlight = true;
}

ListSubheader.propTypes /* remove-proptypes */ = {
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
   * The color of the component. It supports those theme colors that make sense for this component.
   * @default 'default'
   */
  color: PropTypes.oneOf(['default', 'inherit', 'primary']),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, the List Subheader will not have gutters.
   * @default false
   */
  disableGutters: PropTypes.bool,
  /**
   * If `true`, the List Subheader will not stick to the top during scroll.
   * @default false
   */
  disableSticky: PropTypes.bool,
  /**
   * If `true`, the List Subheader is indented.
   * @default false
   */
  inset: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default ListSubheader;
