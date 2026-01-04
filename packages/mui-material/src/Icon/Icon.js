'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';

const IconRoot = styled('span', {
  name: 'MuiIcon',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    return styles.root;
  },
})(
  memoTheme(({ theme }) => ({
    userSelect: 'none',
    width: '1em',
    height: '1em',
    // Chrome fix for https://issues.chromium.org/issues/41375697
    // To remove at some point.
    overflow: 'hidden',
    display: 'inline-block', // allow overflow hidden to take action
    textAlign: 'center', // support non-square icon
    flexShrink: 0,
    fontSize: theme.typography.pxToRem(24),
    variants: [
      {
        props: {
          color: 'inherit',
        },
        style: {
          color: undefined,
        },
      },
    ],
  })),
);

const Icon = React.forwardRef(function Icon(props, ref) {
  const {
    className,
    color = 'inherit',
    ...other
  } = props;

  const ownerState = {
    ...props,
    color,
  };

  return (
    <IconRoot
      className={clsx(
        'material-icons',
        // Prevent the translation of the text content.
        // The font relies on the exact text content to render the icon.
        'notranslate',
        className,
      )}
      ownerState={ownerState}
      aria-hidden
      ref={ref}
      {...other}
    />
  );
});

Icon.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The base class applied to the icon. Defaults to 'material-icons', but can be changed to any
   * other base class that suits the icon font you're using (for example material-icons-rounded, fas, etc).
   * @default 'material-icons'
   */
  baseClassName: PropTypes.string,
  /**
   * The name of the icon font ligature.
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
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'inherit'
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf([
      'inherit',
      'action',
      'disabled',
      'primary',
      'secondary',
      'error',
      'info',
      'success',
      'warning',
    ]),
    PropTypes.string,
  ]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * The fontSize applied to the icon. Defaults to 24px, but can be configure to inherit font size.
   * @default 'medium'
   */
  fontSize: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['inherit', 'large', 'medium', 'small']),
    PropTypes.string,
  ]),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

Icon.muiName = 'Icon';

export default Icon;
