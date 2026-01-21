'use client';
import * as React from 'react';
import clsx from 'clsx';
import resolveProps from '@mui/utils/resolveProps';
import { unstable_useId as useId } from '@mui/material/utils';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import ButtonGroupContext from '@mui/material/ButtonGroup/ButtonGroupContext';
import ButtonGroupButtonContext from '@mui/material/ButtonGroup/ButtonGroupButtonContext';

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

// 아이콘 스타일 계산 함수
const getIconStyles = (size, isStart) => {
  const styles = {
    display: 'inherit',
    marginRight: isStart ? 8 : -4,
    marginLeft: isStart ? -4 : 8,
  };

  if (size === 'small') {
    if (isStart) styles.marginLeft = -2;
    else styles.marginRight = -2;
  }

  return styles;
};

// 로딩 인디케이터 스타일
const loadingIndicatorStyles = {
  display: 'flex',
  position: 'absolute',
  visibility: 'visible',
  left: '50%',
  transform: 'translate(-50%)',
  color: 'rgba(0, 0, 0, 0.26)',
};

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
  const buttonStyles = getButtonStyles(variant, color, size, loading);

  const startIcon = startIconProp && (
    <span style={getIconStyles(size, true)}>{startIconProp}</span>
  );

  const endIcon = endIconProp && (
    <span style={getIconStyles(size, false)}>{endIconProp}</span>
  );

  const positionClassName = buttonGroupButtonContextPositionClassName || '';

  const loader =
    typeof loading === 'boolean' ? (
      <span style={{ display: 'contents' }}>
        {loading && (
          <span style={loadingIndicatorStyles}>
            <CircularProgress aria-labelledby={loadingId} color="inherit" size={16} />
          </span>
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
    </ButtonBase>
  );
});

export default Button;
