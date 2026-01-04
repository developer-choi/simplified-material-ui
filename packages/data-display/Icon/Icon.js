'use client';
import * as React from 'react';
import clsx from 'clsx';

const Icon = React.forwardRef(function Icon(props, ref) {
  const {
    className,
    style,
    ...other
  } = props;

  const iconStyle = {
    userSelect: 'none',
    width: '1em',
    height: '1em',
    // Chrome fix for https://issues.chromium.org/issues/41375697
    // To remove at some point.
    overflow: 'hidden',
    display: 'inline-block', // allow overflow hidden to take action
    textAlign: 'center', // support non-square icon
    flexShrink: 0,
    fontSize: '1.5rem', // 24px
    ...style,
  };

  return (
    <span
      className={clsx(
        'material-icons',
        // Prevent the translation of the text content.
        // The font relies on the exact text content to render the icon.
        'notranslate',
        className,
      )}
      style={iconStyle}
      aria-hidden
      ref={ref}
      {...other}
    />
  );
});

export default Icon;
