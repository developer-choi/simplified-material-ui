'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled } from '../zero-styled';
import Paper from '../Paper';

const AppBarRoot = styled(Paper)({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxSizing: 'border-box',
  flexShrink: 0,
  variants: [
    {
      props: { position: 'fixed' },
      style: {
        position: 'fixed',
        zIndex: 1100,
        top: 0,
        left: 'auto',
        right: 0,
        '@media print': {
          position: 'absolute',
        },
      },
    },
    {
      props: { position: 'absolute' },
      style: {
        position: 'absolute',
        zIndex: 1100,
        top: 0,
        left: 'auto',
        right: 0,
      },
    },
    {
      props: { position: 'sticky' },
      style: {
        position: 'sticky',
        zIndex: 1100,
        top: 0,
        left: 'auto',
        right: 0,
      },
    },
    {
      props: { position: 'static' },
      style: {
        position: 'static',
      },
    },
    {
      props: { position: 'relative' },
      style: {
        position: 'relative',
      },
    },
    {
      props: { color: 'primary' },
      style: {
        '--AppBar-background': '#1976d2',
        '--AppBar-color': '#fff',
        backgroundColor: 'var(--AppBar-background)',
        color: 'var(--AppBar-color)',
      },
    },
  ],
});

const AppBar = React.forwardRef(function AppBar(props, ref) {
  const {
    className,
    color = 'primary',
    position = 'fixed',
    ...other
  } = props;

  const ownerState = {
    ...props,
    color,
    position,
  };

  return (
    <AppBarRoot
      square
      component="header"
      ownerState={ownerState}
      elevation={4}
      className={clsx(
        {
          'mui-fixed': position === 'fixed', // Useful for the Dialog
        },
        className,
      )}
      ref={ref}
      {...other}
    />
  );
});

AppBar.propTypes /* remove-proptypes */ = {
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
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'primary'
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf([
      'default',
      'inherit',
      'primary',
      'secondary',
      'transparent',
      'error',
      'info',
      'success',
      'warning',
    ]),
    PropTypes.string,
  ]),
  /**
   * Shadow depth, corresponds to `dp` in the spec.
   * It accepts values between 0 and 24 inclusive.
   * @default 4
   */
  elevation: PropTypes.number,
  /**
   * If true, the `color` prop is applied in dark mode.
   * @default false
   */
  enableColorOnDark: PropTypes.bool,
  /**
   * The positioning type. The behavior of the different options is described
   * [in the MDN web docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position).
   * Note: `sticky` is not universally supported and will fall back to `static` when unavailable.
   * @default 'fixed'
   */
  position: PropTypes.oneOf(['absolute', 'fixed', 'relative', 'static', 'sticky']),
  /**
   * If `false`, rounded corners are enabled.
   * @default true
   */
  square: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default AppBar;
