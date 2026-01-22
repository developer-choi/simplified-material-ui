'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import chainPropTypes from '@mui/utils/chainPropTypes';
import { unstable_useId as useId } from '../utils';
import ButtonBase from '../../../form/ButtonBase';
import CircularProgress from '../CircularProgress';

// 색상 매핑 (하드코딩)
const colorMap = {
  default: '#0000008a', // action.active
  inherit: 'inherit',
  primary: '#1976d2',
  secondary: '#9c27b0',
  error: '#d32f2f',
  info: '#0288d1',
  success: '#2e7d32',
  warning: '#ed6c02',
};

// 크기별 스타일
const sizeStyles = {
  small: { padding: 5, fontSize: '1.125rem' }, // 18px
  medium: { padding: 8, fontSize: '1.5rem' }, // 24px
  large: { padding: 12, fontSize: '1.75rem' }, // 28px
};

// edge별 마진 (size에 따라 다름)
const getEdgeMargin = (edge, size) => {
  if (!edge) return {};
  const isSmall = size === 'small';
  if (edge === 'start') {
    return { marginLeft: isSmall ? -3 : -12 };
  }
  if (edge === 'end') {
    return { marginRight: isSmall ? -3 : -12 };
  }
  return {};
};

// 기본 스타일
const baseStyle = {
  textAlign: 'center',
  flex: '0 0 auto',
  borderRadius: '50%',
  overflow: 'visible', // ripple이 보이도록
  transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
};

// 로딩 인디케이터 스타일
const loadingIndicatorStyle = {
  position: 'absolute',
  visibility: 'visible',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: '#0000001f', // action.disabled
};

/**
 * Refer to the [Icons](/material-ui/icons/) section of the documentation
 * regarding the available icon options.
 */
const IconButton = React.forwardRef(function IconButton(props, ref) {
  const {
    edge = false,
    children,
    className,
    color = 'default',
    disabled = false,
    disableFocusRipple = false,
    size = 'medium',
    style,
    id: idProp,
    loading = null,
    loadingIndicator: loadingIndicatorProp,
    ...other
  } = props;

  const loadingId = useId(idProp);
  const loadingIndicator = loadingIndicatorProp ?? (
    <CircularProgress aria-labelledby={loadingId} color="inherit" size={16} />
  );

  // 스타일 계산
  const buttonColor = colorMap[color] || colorMap.default;
  const sizeStyle = sizeStyles[size] || sizeStyles.medium;
  const edgeMargin = getEdgeMargin(edge, size);

  const computedStyle = {
    ...baseStyle,
    ...sizeStyle,
    ...edgeMargin,
    color: loading ? 'transparent' : buttonColor,
    ...(disabled && {
      backgroundColor: 'transparent',
      color: '#0000001f', // action.disabled
    }),
    ...style,
  };

  return (
    <ButtonBase
      id={loading ? loadingId : idProp}
      className={className}
      style={computedStyle}
      centerRipple
      focusRipple={!disableFocusRipple}
      disabled={disabled || loading}
      ref={ref}
      {...other}
    >
      {typeof loading === 'boolean' && (
        <span style={{ display: 'contents' }}>
          <span style={{ ...loadingIndicatorStyle, display: loading ? 'flex' : 'none' }}>
            {loading && loadingIndicator}
          </span>
        </span>
      )}
      {children}
    </ButtonBase>
  );
});

IconButton.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The icon to display.
   */
  children: chainPropTypes(PropTypes.node, (props) => {
    const found = React.Children.toArray(props.children).some(
      (child) => React.isValidElement(child) && child.props.onClick,
    );

    if (found) {
      return new Error(
        [
          'MUI: You are providing an onClick event listener to a child of a button element.',
          'Prefer applying it to the IconButton directly.',
          'This guarantees that the whole <button> will be responsive to click events.',
        ].join('\n'),
      );
    }

    return null;
  }),
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
   * @default 'default'
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf([
      'inherit',
      'default',
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
   * If `true`, the ripple effect is disabled.
   *
   * ⚠️ Without a ripple there is no styling for :focus-visible by default. Be sure
   * to highlight the element by applying separate styles with the `.Mui-focusVisible` class.
   * @default false
   */
  disableRipple: PropTypes.bool,
  /**
   * If given, uses a negative margin to counteract the padding on one
   * side (this is often helpful for aligning the left or right
   * side of the icon with content above or below, without ruining the border
   * size and shape).
   * @default false
   */
  edge: PropTypes.oneOf(['end', 'start', false]),
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
   * Element placed before the children if the button is in loading state.
   * The node should contain an element with `role="progressbar"` with an accessible name.
   * By default, it renders a `CircularProgress` that is labeled by the button itself.
   * @default <CircularProgress color="inherit" size={16} />
   */
  loadingIndicator: PropTypes.node,
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
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default IconButton;
