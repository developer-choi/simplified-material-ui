'use client';
import * as React from 'react';
import { unstable_useId as useId } from '@mui/material/utils';
import ButtonBase from '../ButtonBase';
import CircularProgress from '../../feedback/CircularProgress';

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

export default IconButton;
