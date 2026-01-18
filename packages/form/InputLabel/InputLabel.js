'use client';
import * as React from 'react';
import formControlState from '../FormControl/formControlState';
import useFormControl from '../FormControl/useFormControl';

// variant와 shrink에 따른 transform 계산 함수
function getTransform(variant, shrink, formControl) {
  if (!formControl) {
    return undefined;
  }

  if (variant === 'filled') {
    if (shrink) {
      return 'translate(12px, 7px) scale(0.75)';
    }
    return 'translate(12px, 16px) scale(1)';
  }

  if (variant === 'outlined') {
    if (shrink) {
      return 'translate(14px, -9px) scale(0.75)';
    }
    return 'translate(14px, 16px) scale(1)';
  }

  // standard variant
  if (shrink) {
    return 'translate(0, -1.5px) scale(0.75)';
  }
  return 'translate(0, 20px) scale(1)';
}

// variant와 shrink에 따른 maxWidth 계산 함수
function getMaxWidth(variant, shrink, formControl) {
  if (!formControl) {
    return '100%';
  }

  if (variant === 'filled') {
    if (shrink) {
      return 'calc(133% - 24px)';
    }
    return 'calc(100% - 24px)';
  }

  if (variant === 'outlined') {
    if (shrink) {
      return 'calc(133% - 32px)';
    }
    return 'calc(100% - 24px)';
  }

  // standard variant
  if (shrink) {
    return '133%';
  }
  return '100%';
}

// FormControl 상태 기반 색상 계산 함수
function getColor(disabled, error, focused) {
  if (disabled) {
    return '#00000042'; // rgba(0, 0, 0, 0.26)
  }
  if (error) {
    return '#d32f2f';
  }
  if (focused) {
    return '#1976d2'; // primary.main
  }
  return '#0000008a'; // rgba(0, 0, 0, 0.54) - text.secondary
}

const InputLabel = React.forwardRef(function InputLabel(props, ref) {
  const {
    children,
    margin,
    shrink: shrinkProp,
    variant: variantProp,
    className,
    disabled: disabledProp,
    error: errorProp,
    focused: focusedProp,
    required: requiredProp,
    color,
    ...other
  } = props;

  const muiFormControl = useFormControl();

  // shrink 자동 계산
  let shrink = shrinkProp;
  if (typeof shrink === 'undefined' && muiFormControl) {
    shrink = muiFormControl.filled || muiFormControl.focused || muiFormControl.adornedStart;
  }

  // FormControl에서 상태 가져오기
  const fcs = formControlState({
    props,
    muiFormControl,
    states: ['variant', 'required', 'focused', 'disabled', 'error'],
  });

  const variant = fcs.variant || variantProp;
  const required = fcs.required ?? requiredProp;
  const focused = fcs.focused ?? focusedProp;
  const disabled = fcs.disabled ?? disabledProp;
  const error = fcs.error ?? errorProp;

  // 스타일 계산
  const transform = getTransform(variant, shrink, muiFormControl);
  const maxWidth = getMaxWidth(variant, shrink, muiFormControl);
  const labelColor = getColor(disabled, error, focused);

  const baseStyle = {
    display: 'block',
    transformOrigin: 'top left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth,
    color: labelColor,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: '1.4375em',
    padding: 0,
    transition: 'color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms, transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms, max-width 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
  };

  // formControl 내부일 때만 절대 위치 스타일 적용
  if (muiFormControl) {
    baseStyle.position = 'absolute';
    baseStyle.left = 0;
    baseStyle.top = 0;
    baseStyle.transform = transform;
  }

  // filled, outlined variant일 때 추가 스타일
  if (variant === 'filled' || variant === 'outlined') {
    baseStyle.zIndex = 1;
    baseStyle.pointerEvents = shrink ? 'auto' : 'none';
    if (shrink) {
      baseStyle.userSelect = 'none';
    }
  }

  return (
    <label
      ref={ref}
      className={className}
      data-shrink={shrink}
      style={baseStyle}
      {...other}
    >
      {children}
      {required && (
        <span
          aria-hidden="true"
          style={{
            color: error ? '#d32f2f' : 'inherit',
            marginLeft: '4px',
          }}
        >
          {' *'}
        </span>
      )}
    </label>
  );
});

export default InputLabel;
