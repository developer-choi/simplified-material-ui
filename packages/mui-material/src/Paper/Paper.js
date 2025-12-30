'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import integerPropType from '@mui/utils/integerPropType';
import chainPropTypes from '@mui/utils/chainPropTypes';
import { styled } from '../zero-styled';

// Hardcoded shadows for elevation 0-8
const SHADOWS = [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
  '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
  '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
  '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
  '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
  '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
];

const PaperRoot = styled('div', {
  name: 'MuiPaper',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles.elevation,
      styles.rounded,
      styles[`elevation${ownerState.elevation}`],
    ];
  },
})({
  backgroundColor: '#fff',
  color: 'rgba(0, 0, 0, 0.87)',
  borderRadius: 4,
  boxShadow: 'var(--Paper-shadow)',
});

const Paper = React.forwardRef(function Paper(props, ref) {
  const {
    className,
    elevation = 1,
    ...other
  } = props;

  // Limit elevation to 0-8
  const validElevation = Math.min(Math.max(0, elevation), 8);

  const ownerState = {
    ...props,
    elevation: validElevation,
  };

  return (
    <PaperRoot
      ownerState={ownerState}
      className={className}
      ref={ref}
      {...other}
      style={{
        '--Paper-shadow': SHADOWS[validElevation],
        ...other.style,
      }}
    />
  );
});

Paper.propTypes /* remove-proptypes */ = {
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
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * Shadow depth, corresponds to `dp` in the spec.
   * It accepts values between 0 and 24 inclusive.
   * @default 1
   */
  elevation: chainPropTypes(integerPropType, (props) => {
    const { elevation, variant } = props;
    if (elevation > 0 && variant === 'outlined') {
      return new Error(
        `MUI: Combining \`elevation={${elevation}}\` with \`variant="${variant}"\` has no effect. Either use \`elevation={0}\` or use a different \`variant\`.`,
      );
    }

    return null;
  }),
  /**
   * If `true`, rounded corners are disabled.
   * @default false
   */
  square: PropTypes.bool,
  /**
   * @ignore
   */
  style: PropTypes.object,
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
   * @default 'elevation'
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['elevation', 'outlined']),
    PropTypes.string,
  ]),
};

export default Paper;
