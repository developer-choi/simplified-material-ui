'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
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

InputAdornment.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component, normally an `IconButton` or string.
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
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * Disable pointer events on the root.
   * This allows for the content of the adornment to focus the `input` on click.
   * @default false
   */
  disablePointerEvents: PropTypes.bool,
  /**
   * If children is a string then disable wrapping in a Typography component.
   * @default false
   */
  disableTypography: PropTypes.bool,
  /**
   * The position this adornment should appear relative to the `Input`.
   */
  position: PropTypes.oneOf(['end', 'start']).isRequired,
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
   * Note: If you are using the `TextField` component or the `FormControl` component
   * you do not have to set this manually.
   */
  variant: PropTypes.oneOf(['filled', 'outlined', 'standard']),
};

export default InputAdornment;
