'use client';
import * as React from 'react';

const ImageListItemBar = React.forwardRef(function ImageListItemBar(props, ref) {
  const {
    actionIcon,
    actionPosition = 'right',
    className,
    subtitle,
    title,
    position = 'bottom',
    ...other
  } = props;

  const rootStyle = {
    position: position === 'below' ? 'relative' : 'absolute',
    left: position === 'below' ? undefined : 0,
    right: position === 'below' ? undefined : 0,
    top: position === 'top' ? 0 : undefined,
    bottom: position === 'bottom' ? 0 : undefined,
    background: position === 'below' ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: position === 'below' ? 'normal' : 'center',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  };

  const titleWrapStyle = {
    flexGrow: 1,
    padding: position === 'below' ? '6px 0 12px' : '12px 16px',
    paddingLeft: actionIcon && actionPosition === 'left' ? 0 : undefined,
    paddingRight: actionIcon && actionPosition === 'right' ? 0 : undefined,
    color: position === 'below' ? 'inherit' : '#fff',
    overflow: 'hidden',
  };

  const titleStyle = {
    fontSize: '16px',
    lineHeight: '24px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const subtitleStyle = {
    fontSize: '12px',
    lineHeight: 1,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const actionIconStyle = {
    order: actionPosition === 'left' ? -1 : undefined,
  };

  return (
    <div
      ref={ref}
      style={rootStyle}
      className={className}
      {...other}
    >
      <div style={titleWrapStyle}>
        <div style={titleStyle}>{title}</div>
        {subtitle ? <div style={subtitleStyle}>{subtitle}</div> : null}
      </div>
      {actionIcon ? <div style={actionIconStyle}>{actionIcon}</div> : null}
    </div>
  );
});

export default ImageListItemBar;
