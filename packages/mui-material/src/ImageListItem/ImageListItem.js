'use client';
import * as React from 'react';
import ImageListContext from '../ImageList/ImageListContext';

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

  const Component = component;

  return (
    <Component
      ref={ref}
      className={className}
      style={itemStyle}
      {...other}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return null;
        }

        if (child.type === 'img') {
          return React.cloneElement(child, {
            style: {
              ...imgStyles,
              ...child.props.style,
            },
          });
        }

        return child;
      })}
    </Component>
  );
});

export default ImageListItem;
