'use client';
import * as React from 'react';
import clsx from 'clsx';

const InputAdornment = React.forwardRef(function InputAdornment(props, ref) {
  const {
    children,
    className,
    disablePointerEvents = false,
    position,
    variant: variantProp,
    ...other
  } = props;

  return (
    <div
      ref={ref}
      className={clsx('MuiInputAdornment-root', className)}
      style={{
        display: 'flex',
        maxHeight: '2em',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        color: '#757575',
        ...(position === 'start' && { marginRight: 8 }),
        ...(position === 'end' && { marginLeft: 8 }),
        ...(disablePointerEvents && { pointerEvents: 'none' }),
        ...(variantProp === 'filled' && position === 'start' && { marginTop: 16 }),
      }}
      {...other}
    >
      {/* To have the correct vertical alignment baseline */}
      {position === 'start' ? (
        /* notranslate needed while Google Translate will not fix zero-width space issue */
        <span className="notranslate" aria-hidden>
          &#8203;
        </span>
      ) : null}
      {children}
    </div>
  );
});

export default InputAdornment;
