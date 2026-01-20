'use client';
import * as React from 'react';
import formControlState from '../../../form/FormControl/formControlState';
import useFormControl from '../../../form/FormControl/useFormControl';

const FormHelperText = React.forwardRef(function FormHelperText(inProps, ref) {
  const {
    children,
    className,
    disabled,
    error,
    filled,
    focused,
    required,
    ...other
  } = inProps;

  const muiFormControl = useFormControl();
  const fcs = formControlState({
    props: inProps,
    muiFormControl,
    states: ['disabled', 'error', 'filled', 'focused', 'required'],
  });

  // 상태 기반 동적 색상 결정 (error > disabled > default)
  const getTextColor = () => {
    if (fcs.error) return '#d32f2f'; // error.main
    if (fcs.disabled) return 'rgba(0, 0, 0, 0.38)'; // text.disabled
    return 'rgba(0, 0, 0, 0.6)'; // text.secondary
  };

  const rootStyle = {
    color: getTextColor(),
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
    textAlign: 'left',
    marginTop: 3,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
  };

  return (
    <p
      className={className}
      ref={ref}
      style={rootStyle}
      {...other}
    >
      {children === ' ' ? (
        // notranslate needed while Google Translate will not fix zero-width space issue
        <span className="notranslate" aria-hidden>
          &#8203;
        </span>
      ) : (
        children
      )}
    </p>
  );
});

export default FormHelperText;
