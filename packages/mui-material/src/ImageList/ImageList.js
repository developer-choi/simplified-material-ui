'use client';
import composeClasses from '@mui/utils/composeClasses';
import integerPropType from '@mui/utils/integerPropType';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';
import { getImageListUtilityClass } from './imageListClasses';
import ImageListContext from './ImageListContext';

const useUtilityClasses = (ownerState) => {
  const { classes, variant } = ownerState;

  const slots = {
    root: ['root', variant],
  };

  return composeClasses(slots, getImageListUtilityClass, classes);
};

const ImageList = React.forwardRef(function ImageList(props, ref) {
  const {
    children,
    className,
    cols = 2,
    component = 'ul',
    rowHeight = 'auto',
    gap = 4,
    style: styleProp,
    variant = 'standard',
    ...other
  } = props;

  const contextValue = React.useMemo(
    () => ({ rowHeight, gap, variant }),
    [rowHeight, gap, variant],
  );

  const baseStyles = {
    display: variant === 'masonry' ? 'block' : 'grid',
    overflowY: 'auto',
    listStyle: 'none',
    padding: 0,
    WebkitOverflowScrolling: 'touch',
  };

  const layoutStyle =
    variant === 'masonry'
      ? { columnCount: cols, columnGap: gap }
      : { gridTemplateColumns: `repeat(${cols}, 1fr)`, gap };

  const finalStyle = {
    ...baseStyles,
    ...layoutStyle,
    ...styleProp,
  };

  const ownerState = { ...props, component, gap, rowHeight, variant };

  const classes = useUtilityClasses(ownerState);

  const Component = component;

  return (
    <Component
      ref={ref}
      className={clsx(classes.root, classes[variant], className)}
      style={finalStyle}
      {...other}
    >
      <ImageListContext.Provider value={contextValue}>{children}</ImageListContext.Provider>
    </Component>
  );
});

ImageList.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component, normally `ImageListItem`s.
   */
  children: PropTypes /* @typescript-to-proptypes-ignore */.node.isRequired,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * Number of columns.
   * @default 2
   */
  cols: integerPropType,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * The gap between items in px.
   * @default 4
   */
  gap: PropTypes.number,
  /**
   * The height of one row in px.
   * @default 'auto'
   */
  rowHeight: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.number]),
  /**
   * @ignore
   */
  style: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The variant to use.
   * @default 'standard'
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['masonry', 'quilted', 'standard', 'woven']),
    PropTypes.string,
  ]),
};

export default ImageList;
