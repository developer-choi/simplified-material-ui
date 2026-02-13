'use client';
import * as React from 'react';
import ImageListContext from './ImageListContext';

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

  const Component = component;

  return (
    <Component
      ref={ref}
      className={className}
      style={finalStyle}
      {...other}
    >
      <ImageListContext.Provider value={contextValue}>{children}</ImageListContext.Provider>
    </Component>
  );
});

export default ImageList;
