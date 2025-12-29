'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { getDividerUtilityClass } from './dividerClasses';

const useUtilityClasses = (ownerState) => {
  const { children, classes, orientation, variant } =
    ownerState;

  const slots = {
    root: [
      'root',
      variant,
      orientation === 'vertical' && 'vertical',
      children && 'withChildren',
      children && orientation === 'vertical' && 'withChildrenVertical',
    ],
    wrapper: ['wrapper', orientation === 'vertical' && 'wrapperVertical'],
  };

  return composeClasses(slots, getDividerUtilityClass, classes);
};

const DividerRoot = styled('div', {
  name: 'MuiDivider',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.variant],
      ownerState.orientation === 'vertical' && styles.vertical,
      ownerState.children && styles.withChildren,
      ownerState.children && ownerState.orientation === 'vertical' && styles.withChildrenVertical,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    margin: 0, // Reset browser default style.
    flexShrink: 0,
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: (theme.vars || theme).palette.divider,
    borderBottomWidth: 'thin',
    variants: [
      {
        props: {
          variant: 'inset',
        },
        style: {
          marginLeft: 72,
        },
      },
      {
        props: {
          variant: 'middle',
          orientation: 'horizontal',
        },
        style: {
          marginLeft: theme.spacing(2),
          marginRight: theme.spacing(2),
        },
      },
      {
        props: {
          variant: 'middle',
          orientation: 'vertical',
        },
        style: {
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(1),
        },
      },
      {
        props: {
          orientation: 'vertical',
        },
        style: {
          height: '100%',
          borderBottomWidth: 0,
          borderRightWidth: 'thin',
        },
      },
      {
        props: ({ ownerState }) => !!ownerState.children,
        style: {
          display: 'flex',
          textAlign: 'center',
          border: 0,
          borderTopStyle: 'solid',
          borderLeftStyle: 'solid',
          '&::before, &::after': {
            content: '""',
            alignSelf: 'center',
          },
        },
      },
      {
        props: ({ ownerState }) => ownerState.children && ownerState.orientation !== 'vertical',
        style: {
          '&::before, &::after': {
            width: '100%',
            borderTop: `thin solid ${(theme.vars || theme).palette.divider}`,
            borderTopStyle: 'inherit',
          },
        },
      },
      {
        props: ({ ownerState }) => ownerState.orientation === 'vertical' && ownerState.children,
        style: {
          flexDirection: 'column',
          '&::before, &::after': {
            height: '100%',
            borderLeft: `thin solid ${(theme.vars || theme).palette.divider}`,
            borderLeftStyle: 'inherit',
          },
        },
      },
    ],
  })),
);

const DividerWrapper = styled('span', {
  name: 'MuiDivider',
  slot: 'Wrapper',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.wrapper, ownerState.orientation === 'vertical' && styles.wrapperVertical];
  },
})(
  memoTheme(({ theme }) => ({
    display: 'inline-block',
    paddingLeft: `calc(${theme.spacing(1)} * 1.2)`,
    paddingRight: `calc(${theme.spacing(1)} * 1.2)`,
    whiteSpace: 'nowrap',
    variants: [
      {
        props: {
          orientation: 'vertical',
        },
        style: {
          paddingTop: `calc(${theme.spacing(1)} * 1.2)`,
          paddingBottom: `calc(${theme.spacing(1)} * 1.2)`,
        },
      },
    ],
  })),
);

const Divider = React.forwardRef(function Divider(props, ref) {
  const {
    children,
    className,
    orientation = 'horizontal',
    variant = 'fullWidth',
    ...other
  } = props;

  const component = children || orientation === 'vertical' ? 'div' : 'hr';
  const role = component !== 'hr' ? 'separator' : undefined;

  const ownerState = {
    ...props,
    orientation,
    role,
    variant,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <DividerRoot
      as={component}
      className={clsx(classes.root, className)}
      role={role}
      ref={ref}
      ownerState={ownerState}
      aria-orientation={
        role === 'separator' && (component !== 'hr' || orientation === 'vertical')
          ? orientation
          : undefined
      }
      {...other}
    >
      {children ? (
        <DividerWrapper className={classes.wrapper} ownerState={ownerState}>
          {children}
        </DividerWrapper>
      ) : null}
    </DividerRoot>
  );
});

/**
 * The following flag is used to ensure that this component isn't tabbable i.e.
 * does not get highlight/focus inside of MUI List.
 */
if (Divider) {
  Divider.muiSkipListHighlight = true;
}

Divider.propTypes /* remove-proptypes */ = {
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
   * The component orientation.
   * @default 'horizontal'
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  /**
   * @ignore
   */
  role: PropTypes.string,
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
   * @default 'fullWidth'
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['fullWidth', 'inset', 'middle']),
    PropTypes.string,
  ]),
};

export default Divider;
