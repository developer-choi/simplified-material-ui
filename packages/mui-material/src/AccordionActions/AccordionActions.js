'use client';
import * as React from 'react';
import PropTypes from 'prop-types';

const AccordionActions = React.forwardRef(function AccordionActions(props, ref) {
  const { className, children, style, ...other } = props;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 8,
        justifyContent: 'flex-end',
        gap: 8,
        ...style,
      }}
      {...other}
    >
      {children}
    </div>
  );
});

AccordionActions.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
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
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default AccordionActions;
