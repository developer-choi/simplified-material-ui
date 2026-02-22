'use client';
import * as React from 'react';

const fontSizeMap = {
  inherit: 'inherit',
  small: '1.25rem',
  medium: '1.5rem',
  large: '2.1875rem',
};

const SvgIcon = React.forwardRef(function SvgIcon(props, ref) {
  const {
    children,
    className,
    fontSize = 'medium',
    htmlColor,
    inheritViewBox = false,
    titleAccess,
    viewBox = '0 0 24 24',
    style,
    ...other
  } = props;

  const hasSvgAsChild = React.isValidElement(children) && children.type === 'svg';

  return (
    <svg
      className={className}
      focusable="false"
      color={htmlColor}
      aria-hidden={titleAccess ? undefined : true}
      role={titleAccess ? 'img' : undefined}
      ref={ref}
      {...(!inheritViewBox && { viewBox })}
      style={{
        userSelect: 'none',
        width: '1em',
        height: '1em',
        display: 'inline-block',
        flexShrink: 0,
        fill: hasSvgAsChild ? undefined : 'currentColor',
        fontSize: fontSizeMap[fontSize] ?? fontSize,
        ...style,
      }}
      {...other}
      {...(hasSvgAsChild && children.props)}
    >
      {hasSvgAsChild ? children.props.children : children}
      {titleAccess ? <title>{titleAccess}</title> : null}
    </svg>
  );
});

export default SvgIcon;
