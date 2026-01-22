'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import useFormControl from '../../../form/FormControl/useFormControl';
import formControlState from '../../../form/FormControl/formControlState';

// 기본 스타일
const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
};

// row 스타일
const rowStyle = {
  ...baseStyle,
  flexDirection: 'row',
};

/**
 * `FormGroup` wraps controls such as `Checkbox` and `Switch`.
 * It provides compact row layout.
 * For the `Radio`, you should be using the `RadioGroup` component instead of this one.
 */
const FormGroup = React.forwardRef(function FormGroup(props, ref) {
  const { className, row = false, style, ...other } = props;
  const muiFormControl = useFormControl();
  const fcs = formControlState({
    props,
    muiFormControl,
    states: ['error'],
  });

  // error 상태는 FormControl과 연동되지만 스타일에는 사용하지 않음
  // 필요 시 fcs.error로 접근 가능

  const formGroupStyle = row ? rowStyle : baseStyle;

  return (
    <div
      className={className}
      ref={ref}
      style={{ ...formGroupStyle, ...style }}
      {...other}
    />
  );
});

FormGroup.propTypes /* remove-proptypes */ = {
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
   * Display group of elements in a compact row.
   * @default false
   */
  row: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default FormGroup;
