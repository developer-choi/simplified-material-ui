'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import chainPropTypes from '@mui/utils/chainPropTypes';
import composeClasses from '@mui/utils/composeClasses';
import { getCardMediaUtilityClass } from './cardMediaClasses';

const MEDIA_COMPONENTS = ['video', 'audio', 'picture', 'iframe', 'img'];
const IMAGE_COMPONENTS = ['picture', 'img'];

const styles = {
  root: {
    display: 'block',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  media: {
    width: '100%',
  },
  img: {
    objectFit: 'cover',
  },
};

const useUtilityClasses = (ownerState) => {
  const { classes, isMediaComponent, isImageComponent } = ownerState;

  const slots = {
    root: ['root', isMediaComponent && 'media', isImageComponent && 'img'],
  };

  return composeClasses(slots, getCardMediaUtilityClass, classes);
};

const CardMedia = React.forwardRef(function CardMedia(props, ref) {
  const { children, className, component = 'div', image, src, style, ...other } = props;

  const isMediaComponent = MEDIA_COMPONENTS.includes(component);
  const isImageComponent = IMAGE_COMPONENTS.includes(component);

  const composedStyle = {
    ...styles.root,
    ...(isMediaComponent && styles.media),
    ...(isImageComponent && styles.img),
    ...(!isMediaComponent && image && { backgroundImage: `url("${image}")` }),
    ...style,
  };

  const ownerState = {
    ...props,
    component,
    isMediaComponent,
    isImageComponent,
  };

  const classes = useUtilityClasses(ownerState);

  const Component = component;

  return (
    <Component
      ref={ref}
      className={clsx(classes.root, className)}
      role={!isMediaComponent && image ? 'img' : undefined}
      style={composedStyle}
      src={isMediaComponent ? image || src : undefined}
      {...other}
    >
      {children}
    </Component>
  );
});

CardMedia.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: chainPropTypes(PropTypes.node, (props) => {
    if (!props.children && !props.image && !props.src && !props.component) {
      return new Error(
        'MUI: Either `children`, `image`, `src` or `component` prop must be specified.',
      );
    }
    return null;
  }),
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
   * Image to be displayed as a background image.
   * Either `image` or `src` prop must be specified.
   * Note that caller must specify height otherwise the image will not be visible.
   */
  image: PropTypes.string,
  /**
   * An alias for `image` property.
   * Available only with media components.
   * Media components: `video`, `audio`, `picture`, `iframe`, `img`.
   */
  src: PropTypes.string,
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

export default CardMedia;
