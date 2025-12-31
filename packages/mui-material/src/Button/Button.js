'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import resolveProps from '@mui/utils/resolveProps';
import { unstable_useId as useId } from '../utils';
import { styled } from '../zero-styled';
import ButtonBase from '../ButtonBase';
import CircularProgress from '../CircularProgress';
import capitalize from '../utils/capitalize';
import ButtonGroupContext from '../ButtonGroup/ButtonGroupContext';
import ButtonGroupButtonContext from '../ButtonGroup/ButtonGroupButtonContext';

// 스타일 계산 함수
const getButtonStyles = (variant, color, size, loading) => {
  const styles = {
    minWidth: 64,
    padding: '6px 16px',
    border: 0,
    borderRadius: 4,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
  };

  // variant별 기본 스타일
  if (variant === 'text') {
    styles.padding = '6px 8px';
  } else if (variant === 'outlined') {
    styles.padding = '5px 15px';
    styles.border = '1px solid';
  } else if (variant === 'contained') {
    styles.boxShadow = '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)';
  }

  // size별 스타일
  if (size === 'small') {
    styles.fontSize = '0.8125rem';
    if (variant === 'text') styles.padding = '4px 5px';
    else if (variant === 'outlined') styles.padding = '3px 9px';
    else if (variant === 'contained') styles.padding = '4px 10px';
  } else if (size === 'large') {
    styles.fontSize = '0.9375rem';
    if (variant === 'text') styles.padding = '8px 11px';
    else if (variant === 'outlined') styles.padding = '7px 21px';
    else if (variant === 'contained') styles.padding = '8px 22px';
  }

  // color별 스타일
  const colorMap = {
    primary: { main: '#1976d2', contrastText: '#fff' },
    secondary: { main: '#9c27b0', contrastText: '#fff' },
    error: { main: '#d32f2f', contrastText: '#fff' },
  };

  const selectedColor = colorMap[color];
  if (variant === 'text') {
    styles.color = selectedColor.main;
  } else if (variant === 'outlined') {
    styles.color = selectedColor.main;
    styles.borderColor = selectedColor.main;
  } else if (variant === 'contained') {
    styles.color = selectedColor.contrastText;
    styles.backgroundColor = selectedColor.main;
  }

  // loading 상태
  if (loading) {
    styles.color = 'transparent';
  }

  return styles;
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
  // props priority: `inProps` > `contextProps`
  const contextProps = React.useContext(ButtonGroupContext);
  const buttonGroupButtonContextPositionClassName = React.useContext(ButtonGroupButtonContext);
  const props = resolveProps(contextProps, inProps);
  const {
    children,
    color = 'primary',
    className,
    disabled = false,
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
    size,
    loading,
  };

  const buttonStyles = getButtonStyles(variant, color, size, loading);

  const startIcon = startIconProp && (
    <ButtonStartIcon ownerState={ownerState}>
      {startIconProp}
    </ButtonStartIcon>
  );

  const endIcon = endIconProp && (
    <ButtonEndIcon ownerState={ownerState}>
      {endIconProp}
    </ButtonEndIcon>
  );

  const positionClassName = buttonGroupButtonContextPositionClassName || '';

  const loader =
    typeof loading === 'boolean' ? (
      // use plain HTML span to minimize the runtime overhead
      <span style={{ display: 'contents' }}>
        {loading && (
          <ButtonLoadingIndicator ownerState={ownerState}>
            <CircularProgress aria-labelledby={loadingId} color="inherit" size={16} />
          </ButtonLoadingIndicator>
        )}
      </span>
    ) : null;

  return (
    <ButtonBase
      className={clsx(contextProps.className, className, positionClassName)}
      disabled={disabled || loading}
      focusVisibleClassName={focusVisibleClassName}
      ref={ref}
      type={type}
      id={loading ? loadingId : idProp}
      style={buttonStyles}
      {...other}
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
   * If `true`, the component is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
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
