'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '../zero-styled';

const AccordionDetailsRoot = styled('div', {
  name: 'MuiAccordionDetails',
  slot: 'Root',
})({
  padding: '8px 16px 16px',
});

const AccordionDetails = React.forwardRef(function AccordionDetails(props, ref) {
  const { className, ...other } = props;
  const ownerState = props;

  return (
    <AccordionDetailsRoot
      className={className}
      ref={ref}
      ownerState={ownerState}
      {...other}
    />
  );
});

AccordionDetails.propTypes /* remove-proptypes */ = {
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

export default AccordionDetails;
