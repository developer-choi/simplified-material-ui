'use client';
import composeClasses from '@mui/utils/composeClasses';
import integerPropType from '@mui/utils/integerPropType';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';
import { isFragment } from 'react-is';
import ImageListContext from '../ImageList/ImageListContext';
import isMuiElement from '../utils/isMuiElement';
import { getImageListItemUtilityClass } from './imageListItemClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, variant } = ownerState;

  const slots = {
    root: ['root', variant],
    img: ['img'],
  };

  return composeClasses(slots, getImageListItemUtilityClass, classes);
};

const ImageListItem = React.forwardRef(function ImageListItem(props, ref) {
  const { children, className, cols = 1, component = 'li', rows = 1, style, ...other } = props;

  const { rowHeight = 'auto', gap, variant } = React.useContext(ImageListContext);

  let height = 'auto';
  if (variant === 'woven') {
    height = undefined;
  } else if (rowHeight !== 'auto') {
    height = rowHeight * rows + gap * (rows - 1);
  }

  const baseStyles = {
    display: variant === 'standard' ? 'flex' : 'block',
    flexDirection: variant === 'standard' ? 'column' : undefined,
    position: 'relative',
  };

  const wovenStyles = variant === 'woven' ? {
    height: '100%',
    alignSelf: 'center',
  } : {};

  const itemStyle = {
    ...baseStyles,
    ...wovenStyles,
    height,
    gridColumnEnd: variant !== 'masonry' ? `span ${cols}` : undefined,
    gridRowEnd: variant !== 'masonry' ? `span ${rows}` : undefined,
    marginBottom: variant === 'masonry' ? gap : undefined,
    breakInside: variant === 'masonry' ? 'avoid' : undefined,
    ...style,
  };

  const imgStyles = {
    objectFit: 'cover',
    width: '100%',
    height: variant === 'standard' ? 'auto' : '100%',
    flexGrow: variant === 'standard' ? 1 : undefined,
    display: 'block',
  };

  const ownerState = {
    ...props,
    cols,
    component,
    gap,
    rowHeight,
    rows,
    variant,
  };

  const classes = useUtilityClasses(ownerState);

  const Component = component;

  return (
    <Component
      ref={ref}
      className={clsx(classes.root, classes[variant], className)}
      style={itemStyle}
      {...other}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return null;
        }

        if (process.env.NODE_ENV !== 'production') {
          if (isFragment(child)) {
            console.error(
              [
                "MUI: The ImageListItem component doesn't accept a Fragment as a child.",
                'Consider providing an array instead.',
              ].join('\n'),
            );
          }
        }

        if (child.type === 'img' || isMuiElement(child, ['Image'])) {
          return React.cloneElement(child, {
            className: clsx(classes.img, child.props.className),
          });
        }

        return child;
      })}
    </Component>
  );
});

ImageListItem.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component, normally an `<img>`.
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
   * Width of the item in number of grid columns.
   * @default 1
   */
  cols: integerPropType,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * Height of the item in number of grid rows.
   * @default 1
   */
  rows: integerPropType,
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
};

export default ImageListItem;
