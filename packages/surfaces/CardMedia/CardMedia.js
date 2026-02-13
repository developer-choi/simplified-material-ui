'use client';
import * as React from 'react';

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

  const Component = component;

  return (
    <Component
      ref={ref}
      className={className}
      role={!isMediaComponent && image ? 'img' : undefined}
      style={composedStyle}
      src={isMediaComponent ? image || src : undefined}
      {...other}
    >
      {children}
    </Component>
  );
});

export default CardMedia;
