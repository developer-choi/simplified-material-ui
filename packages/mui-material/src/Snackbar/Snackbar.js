'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import useSnackbar from './useSnackbar';
import ClickAwayListener from '../../../utils/ClickAwayListener';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import capitalize from '../utils/capitalize';
import SnackbarContent from '../SnackbarContent';
import { getSnackbarUtilityClass } from './snackbarClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, anchorOrigin } = ownerState;

  const slots = {
    root: [
      'root',
      `anchorOrigin${capitalize(anchorOrigin.vertical)}${capitalize(anchorOrigin.horizontal)}`,
    ],
  };

  return composeClasses(slots, getSnackbarUtilityClass, classes);
};

const SnackbarRoot = styled('div', {
  name: 'MuiSnackbar',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[
        `anchorOrigin${capitalize(ownerState.anchorOrigin.vertical)}${capitalize(
          ownerState.anchorOrigin.horizontal,
        )}`
      ],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    zIndex: (theme.vars || theme).zIndex.snackbar,
    position: 'fixed',
    display: 'flex',
    left: 8,
    right: 8,
    justifyContent: 'center',
    alignItems: 'center',
    variants: [
      {
        props: ({ ownerState }) => ownerState.anchorOrigin.vertical === 'top',
        style: { top: 8, [theme.breakpoints.up('sm')]: { top: 24 } },
      },
      {
        props: ({ ownerState }) => ownerState.anchorOrigin.vertical !== 'top',
        style: { bottom: 8, [theme.breakpoints.up('sm')]: { bottom: 24 } },
      },
      {
        props: ({ ownerState }) => ownerState.anchorOrigin.horizontal === 'left',
        style: {
          justifyContent: 'flex-start',
          [theme.breakpoints.up('sm')]: {
            left: 24,
            right: 'auto',
          },
        },
      },
      {
        props: ({ ownerState }) => ownerState.anchorOrigin.horizontal === 'right',
        style: {
          justifyContent: 'flex-end',
          [theme.breakpoints.up('sm')]: {
            right: 24,
            left: 'auto',
          },
        },
      },
      {
        props: ({ ownerState }) => ownerState.anchorOrigin.horizontal === 'center',
        style: {
          [theme.breakpoints.up('sm')]: {
            left: '50%',
            right: 'auto',
            transform: 'translateX(-50%)',
          },
        },
      },
    ],
  })),
);

const Snackbar = React.forwardRef(function Snackbar(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiSnackbar' });

  const {
    action,
    anchorOrigin: { vertical, horizontal } = { vertical: 'bottom', horizontal: 'left' },
    autoHideDuration = null,
    children,
    className,
    ClickAwayListenerProps: ClickAwayListenerPropsProp,
    ContentProps: ContentPropsProp,
    disableWindowBlurListener = false,
    message,
    onBlur,
    onClose,
    onFocus,
    onMouseEnter,
    onMouseLeave,
    open,
    resumeHideDuration,
    slots = {},
    slotProps = {},
    TransitionComponent: TransitionComponentProp,
    transitionDuration,
    TransitionProps: TransitionPropsProp = {},
    ...other
  } = props;

  const ownerState = {
    ...props,
    anchorOrigin: { vertical, horizontal },
    autoHideDuration,
    disableWindowBlurListener,
    TransitionComponent: TransitionComponentProp,
    transitionDuration,
  };

  const classes = useUtilityClasses(ownerState);

  const { getRootProps, onClickAway } = useSnackbar(ownerState);

  const clickAwayProps = {
    ...(ClickAwayListenerPropsProp || {}),
    ...(slotProps.clickAwayListener || {}),
    onClickAway: (event) => {
      ClickAwayListenerPropsProp?.onClickAway?.(event);
      slotProps.clickAwayListener?.onClickAway?.(event);
      if (!event?.defaultMuiPrevented) {
        onClickAway(event);
      }
    },
  };

  const contentProps = {
    ...(ContentPropsProp || {}),
    ...(slotProps.content || {}),
    message,
    action,
  };

  const rootProps = {
    ...getRootProps(other),
    ref,
    className: [classes.root, className].filter(Boolean).join(' '),
    ownerState,
  };

  if (!open) {
    return null;
  }

  return (
    <ClickAwayListener {...clickAwayProps}>
      <SnackbarRoot {...rootProps}>
        {children || <SnackbarContent {...contentProps} />}
      </SnackbarRoot>
    </ClickAwayListener>
  );
});

Snackbar.propTypes /* remove-proptypes */ = {
  action: PropTypes.node,
  anchorOrigin: PropTypes.shape({
    horizontal: PropTypes.oneOf(['center', 'left', 'right']).isRequired,
    vertical: PropTypes.oneOf(['bottom', 'top']).isRequired,
  }),
  autoHideDuration: PropTypes.number,
  children: PropTypes.element,
  classes: PropTypes.object,
  className: PropTypes.string,
  ClickAwayListenerProps: PropTypes.object,
  ContentProps: PropTypes.object,
  disableWindowBlurListener: PropTypes.bool,
  key: () => null,
  message: PropTypes.node,
  onBlur: PropTypes.func,
  onClose: PropTypes.func,
  onFocus: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  open: PropTypes.bool,
  resumeHideDuration: PropTypes.number,
  slotProps: PropTypes.shape({
    clickAwayListener: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    content: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    root: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    transition: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  }),
  slots: PropTypes.shape({
    clickAwayListener: PropTypes.elementType,
    content: PropTypes.elementType,
    root: PropTypes.elementType,
    transition: PropTypes.elementType,
  }),
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default Snackbar;
