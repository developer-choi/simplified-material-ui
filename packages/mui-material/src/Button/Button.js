'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import resolveProps from '@mui/utils/resolveProps';
import composeClasses from '@mui/utils/composeClasses';
import { unstable_useId as useId } from '../utils';
import rootShouldForwardProp from '../styles/rootShouldForwardProp';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import ButtonBase from '../ButtonBase';
import CircularProgress from '../CircularProgress';
import capitalize from '../utils/capitalize';
import buttonClasses, { getButtonUtilityClass } from './buttonClasses';
import ButtonGroupContext from '../ButtonGroup/ButtonGroupContext';
import ButtonGroupButtonContext from '../ButtonGroup/ButtonGroupButtonContext';

const useUtilityClasses = (ownerState) => {
  const { color, size, variant, loading, classes } =
    ownerState;

  const slots = {
    root: [
      'root',
      loading && 'loading',
      variant,
      `${variant}${capitalize(color)}`,
      `size${capitalize(size)}`,
      `${variant}Size${capitalize(size)}`,
      `color${capitalize(color)}`,
    ],
    startIcon: ['icon', 'startIcon', `iconSize${capitalize(size)}`],
    endIcon: ['icon', 'endIcon', `iconSize${capitalize(size)}`],
    loadingIndicator: ['loadingIndicator'],
    loadingWrapper: ['loadingWrapper'],
  };

  const composedClasses = composeClasses(slots, getButtonUtilityClass, classes);

  return {
    ...classes, // forward the focused, disabled, etc. classes to the ButtonBase
    ...composedClasses,
  };
};

const commonIconStyles = [
  {
    props: { size: 'small' },
    style: {
      '& > *:nth-of-type(1)': {
        fontSize: 18,
      },
    },
  },
  {
    props: { size: 'medium' },
    style: {
      '& > *:nth-of-type(1)': {
        fontSize: 20,
      },
    },
  },
  {
    props: { size: 'large' },
    style: {
      '& > *:nth-of-type(1)': {
        fontSize: 22,
      },
    },
  },
];

const ButtonRoot = styled(ButtonBase, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiButton',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.variant],
      styles[`${ownerState.variant}${capitalize(ownerState.color)}`],
      styles[`size${capitalize(ownerState.size)}`],
      styles[`${ownerState.variant}Size${capitalize(ownerState.size)}`],
      ownerState.loading && styles.loading,
    ];
  },
})(
  memoTheme(({ theme }) => {
    return {
      ...theme.typography.button,
      minWidth: 64,
      padding: '6px 16px',
      border: 0,
      borderRadius: (theme.vars || theme).shape.borderRadius,
      transition: theme.transitions.create(
        ['background-color', 'box-shadow', 'border-color', 'color'],
        {
          duration: theme.transitions.duration.short,
        },
      ),
      '&:hover': {
        textDecoration: 'none',
      },
      [`&.${buttonClasses.disabled}`]: {
        color: (theme.vars || theme).palette.action.disabled,
      },
      variants: [
        {
          props: { variant: 'contained' },
          style: {
            color: `var(--variant-containedColor)`,
            backgroundColor: `var(--variant-containedBg)`,
            boxShadow: (theme.vars || theme).shadows[2],
            '&:hover': {
              boxShadow: (theme.vars || theme).shadows[4],
              // Reset on touch devices, it doesn't add specificity
              '@media (hover: none)': {
                boxShadow: (theme.vars || theme).shadows[2],
              },
            },
            '&:active': {
              boxShadow: (theme.vars || theme).shadows[8],
            },
            [`&.${buttonClasses.focusVisible}`]: {
              boxShadow: (theme.vars || theme).shadows[6],
            },
            [`&.${buttonClasses.disabled}`]: {
              color: (theme.vars || theme).palette.action.disabled,
              boxShadow: (theme.vars || theme).shadows[0],
              backgroundColor: (theme.vars || theme).palette.action.disabledBackground,
            },
          },
        },
        {
          props: { variant: 'outlined' },
          style: {
            padding: '5px 15px',
            border: '1px solid currentColor',
            borderColor: `var(--variant-outlinedBorder, currentColor)`,
            backgroundColor: `var(--variant-outlinedBg)`,
            color: `var(--variant-outlinedColor)`,
            [`&.${buttonClasses.disabled}`]: {
              border: `1px solid ${(theme.vars || theme).palette.action.disabledBackground}`,
            },
          },
        },
        {
          props: { variant: 'text' },
          style: {
            padding: '6px 8px',
            color: `var(--variant-textColor)`,
            backgroundColor: `var(--variant-textBg)`,
          },
        },
        {
          props: { color: 'primary' },
          style: {
            '--variant-textColor': (theme.vars || theme).palette.primary.main,
            '--variant-outlinedColor': (theme.vars || theme).palette.primary.main,
            '--variant-outlinedBorder': theme.alpha(
              (theme.vars || theme).palette.primary.main,
              0.5,
            ),
            '--variant-containedColor': (theme.vars || theme).palette.primary.contrastText,
            '--variant-containedBg': (theme.vars || theme).palette.primary.main,
            '@media (hover: hover)': {
              '&:hover': {
                '--variant-containedBg': (theme.vars || theme).palette.primary.dark,
                '--variant-textBg': theme.alpha(
                  (theme.vars || theme).palette.primary.main,
                  (theme.vars || theme).palette.action.hoverOpacity,
                ),
                '--variant-outlinedBorder': (theme.vars || theme).palette.primary.main,
                '--variant-outlinedBg': theme.alpha(
                  (theme.vars || theme).palette.primary.main,
                  (theme.vars || theme).palette.action.hoverOpacity,
                ),
              },
            },
          },
        },
        {
          props: { color: 'secondary' },
          style: {
            '--variant-textColor': (theme.vars || theme).palette.secondary.main,
            '--variant-outlinedColor': (theme.vars || theme).palette.secondary.main,
            '--variant-outlinedBorder': theme.alpha(
              (theme.vars || theme).palette.secondary.main,
              0.5,
            ),
            '--variant-containedColor': (theme.vars || theme).palette.secondary.contrastText,
            '--variant-containedBg': (theme.vars || theme).palette.secondary.main,
            '@media (hover: hover)': {
              '&:hover': {
                '--variant-containedBg': (theme.vars || theme).palette.secondary.dark,
                '--variant-textBg': theme.alpha(
                  (theme.vars || theme).palette.secondary.main,
                  (theme.vars || theme).palette.action.hoverOpacity,
                ),
                '--variant-outlinedBorder': (theme.vars || theme).palette.secondary.main,
                '--variant-outlinedBg': theme.alpha(
                  (theme.vars || theme).palette.secondary.main,
                  (theme.vars || theme).palette.action.hoverOpacity,
                ),
              },
            },
          },
        },
        {
          props: { color: 'error' },
          style: {
            '--variant-textColor': (theme.vars || theme).palette.error.main,
            '--variant-outlinedColor': (theme.vars || theme).palette.error.main,
            '--variant-outlinedBorder': theme.alpha(
              (theme.vars || theme).palette.error.main,
              0.5,
            ),
            '--variant-containedColor': (theme.vars || theme).palette.error.contrastText,
            '--variant-containedBg': (theme.vars || theme).palette.error.main,
            '@media (hover: hover)': {
              '&:hover': {
                '--variant-containedBg': (theme.vars || theme).palette.error.dark,
                '--variant-textBg': theme.alpha(
                  (theme.vars || theme).palette.error.main,
                  (theme.vars || theme).palette.action.hoverOpacity,
                ),
                '--variant-outlinedBorder': (theme.vars || theme).palette.error.main,
                '--variant-outlinedBg': theme.alpha(
                  (theme.vars || theme).palette.error.main,
                  (theme.vars || theme).palette.action.hoverOpacity,
                ),
              },
            },
          },
        },
        {
          props: {
            size: 'small',
            variant: 'text',
          },
          style: {
            padding: '4px 5px',
            fontSize: theme.typography.pxToRem(13),
          },
        },
        {
          props: {
            size: 'large',
            variant: 'text',
          },
          style: {
            padding: '8px 11px',
            fontSize: theme.typography.pxToRem(15),
          },
        },
        {
          props: {
            size: 'small',
            variant: 'outlined',
          },
          style: {
            padding: '3px 9px',
            fontSize: theme.typography.pxToRem(13),
          },
        },
        {
          props: {
            size: 'large',
            variant: 'outlined',
          },
          style: {
            padding: '7px 21px',
            fontSize: theme.typography.pxToRem(15),
          },
        },
        {
          props: {
            size: 'small',
            variant: 'contained',
          },
          style: {
            padding: '4px 10px',
            fontSize: theme.typography.pxToRem(13),
          },
        },
        {
          props: {
            size: 'large',
            variant: 'contained',
          },
          style: {
            padding: '8px 22px',
            fontSize: theme.typography.pxToRem(15),
          },
        },
        {
          props: { loading: true },
          style: {
            transition: theme.transitions.create(
              ['background-color', 'box-shadow', 'border-color'],
              {
                duration: theme.transitions.duration.short,
              },
            ),
            [`&.${buttonClasses.loading}`]: {
              color: 'transparent',
            },
          },
        },
      ],
    };
  }),
);

const ButtonStartIcon = styled('span', {
  name: 'MuiButton',
  slot: 'StartIcon',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.startIcon,
      ownerState.loading && styles.startIconLoadingStart,
      styles[`iconSize${capitalize(ownerState.size)}`],
    ];
  },
})(({ theme }) => ({
  display: 'inherit',
  marginRight: 8,
  marginLeft: -4,
  variants: [
    {
      props: { size: 'small' },
      style: {
        marginLeft: -2,
      },
    },
    ...commonIconStyles,
  ],
}));

const ButtonEndIcon = styled('span', {
  name: 'MuiButton',
  slot: 'EndIcon',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.endIcon,
      ownerState.loading && styles.endIconLoadingEnd,
      styles[`iconSize${capitalize(ownerState.size)}`],
    ];
  },
})(({ theme }) => ({
  display: 'inherit',
  marginRight: -4,
  marginLeft: 8,
  variants: [
    {
      props: { size: 'small' },
      style: {
        marginRight: -2,
      },
    },
    ...commonIconStyles,
  ],
}));

const ButtonLoadingIndicator = styled('span', {
  name: 'MuiButton',
  slot: 'LoadingIndicator',
})(({ theme }) => ({
  display: 'none',
  position: 'absolute',
  visibility: 'visible',
  left: '50%',
  transform: 'translate(-50%)',
  color: (theme.vars || theme).palette.action.disabled,
  variants: [
    { props: { loading: true }, style: { display: 'flex' } },
  ],
}));

const ButtonLoadingIconPlaceholder = styled('span', {
  name: 'MuiButton',
  slot: 'LoadingIconPlaceholder',
})({
  display: 'inline-block',
  width: '1em',
  height: '1em',
});

const Button = React.forwardRef(function Button(inProps, ref) {
  // props priority: `inProps` > `contextProps` > `themeDefaultProps`
  const contextProps = React.useContext(ButtonGroupContext);
  const buttonGroupButtonContextPositionClassName = React.useContext(ButtonGroupButtonContext);
  const resolvedProps = resolveProps(contextProps, inProps);
  const props = useDefaultProps({ props: resolvedProps, name: 'MuiButton' });
  const {
    children,
    color = 'primary',
    component = 'button',
    className,
    disabled = false,
    disableFocusRipple = false,
    endIcon: endIconProp,
    focusVisibleClassName,
    id: idProp,
    loading = null,
    size = 'medium',
    startIcon: startIconProp,
    type,
    variant = 'text',
    ...other
  } = props;

  const loadingId = useId(idProp);

  const ownerState = {
    ...props,
    color,
    component,
    disabled,
    disableFocusRipple,
    loading,
    size,
    type,
    variant,
  };

  const classes = useUtilityClasses(ownerState);

  const startIcon = startIconProp && (
    <ButtonStartIcon className={classes.startIcon} ownerState={ownerState}>
      {startIconProp}
    </ButtonStartIcon>
  );

  const endIcon = endIconProp && (
    <ButtonEndIcon className={classes.endIcon} ownerState={ownerState}>
      {endIconProp}
    </ButtonEndIcon>
  );

  const positionClassName = buttonGroupButtonContextPositionClassName || '';

  const loader =
    typeof loading === 'boolean' ? (
      // use plain HTML span to minimize the runtime overhead
      <span className={classes.loadingWrapper} style={{ display: 'contents' }}>
        {loading && (
          <ButtonLoadingIndicator className={classes.loadingIndicator} ownerState={ownerState}>
            <CircularProgress aria-labelledby={loadingId} color="inherit" size={16} />
          </ButtonLoadingIndicator>
        )}
      </span>
    ) : null;

  return (
    <ButtonRoot
      ownerState={ownerState}
      className={clsx(contextProps.className, classes.root, className, positionClassName)}
      component={component}
      disabled={disabled || loading}
      focusRipple={!disableFocusRipple}
      focusVisibleClassName={clsx(classes.focusVisible, focusVisibleClassName)}
      ref={ref}
      type={type}
      id={loading ? loadingId : idProp}
      {...other}
      classes={classes}
    >
      {startIcon}
      {loader}
      {children}
      {endIcon}
    </ButtonRoot>
  );
});

Button.propTypes /* remove-proptypes */ = {
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
    PropTypes.oneOf(['primary', 'secondary', 'error']),
    PropTypes.string,
  ]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, the component is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, the  keyboard focus ripple is disabled.
   * @default false
   */
  disableFocusRipple: PropTypes.bool,
  /**
   * Element placed after the children.
   */
  endIcon: PropTypes.node,
  /**
   * @ignore
   */
  focusVisibleClassName: PropTypes.string,
  /**
   * The URL to link to when the button is clicked.
   * If defined, an `a` element will be used as the root node.
   */
  href: PropTypes.string,
  /**
   * @ignore
   */
  id: PropTypes.string,
  /**
   * If `true`, the loading indicator is visible and the button is disabled.
   * If `true | false`, the loading wrapper is always rendered before the children to prevent [Google Translation Crash](https://github.com/mui/material-ui/issues/27853).
   * @default null
   */
  loading: PropTypes.bool,
  /**
   * The size of the component.
   * `small` is equivalent to the dense button styling.
   * @default 'medium'
   */
  size: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large']),
    PropTypes.string,
  ]),
  /**
   * Element placed before the children.
   */
  startIcon: PropTypes.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * @ignore
   */
  type: PropTypes.oneOfType([PropTypes.oneOf(['button', 'reset', 'submit']), PropTypes.string]),
  /**
   * The variant to use.
   * @default 'text'
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['contained', 'outlined', 'text']),
    PropTypes.string,
  ]),
};

export default Button;
