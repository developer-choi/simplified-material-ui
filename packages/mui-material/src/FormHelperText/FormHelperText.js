'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
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

FormHelperText.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   *
   * If `' '` is provided, the component reserves one line height for displaying a future message.
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
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, the helper text should be displayed in a disabled state.
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, helper text should be displayed in an error state.
   */
  error: PropTypes.bool,
  /**
   * If `true`, the helper text should use filled classes key.
   */
  filled: PropTypes.bool,
  /**
   * If `true`, the helper text should use focused classes key.
   */
  focused: PropTypes.bool,
  /**
   * If `dense`, will adjust vertical spacing. This is normally obtained via context from
   * FormControl.
   */
  margin: PropTypes.oneOf(['dense']),
  /**
   * If `true`, the helper text should use required classes key.
   */
  required: PropTypes.bool,
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
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['filled', 'outlined', 'standard']),
    PropTypes.string,
  ]),
};

export default FormHelperText;
