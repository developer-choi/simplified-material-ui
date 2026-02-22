'use client';
import * as React from 'react';
import Input from '../Input';
import FilledInput from '../FilledInput';
import OutlinedInput from '../OutlinedInput';
import InputLabel from '../InputLabel';
import FormControl from '../FormControl';
import FormHelperText from '../FormHelperText';
import Select from '../Select';

const variantComponent = {
  standard: Input,
  filled: FilledInput,
  outlined: OutlinedInput,
};

const TextField = React.forwardRef(function TextField(props, ref) {
  const {
    autoComplete,
    autoFocus = false,
    children,
    className,
    color = 'primary',
    defaultValue,
    disabled = false,
    error = false,
    FormHelperTextProps,
    fullWidth = false,
    helperText,
    id: idOverride,
    InputLabelProps,
    inputProps,
    InputProps,
    inputRef,
    label,
    maxRows,
    minRows,
    multiline = false,
    name,
    onBlur,
    onChange,
    onFocus,
    placeholder,
    required = false,
    rows,
    select = false,
    SelectProps,
    type,
    value,
    variant = 'outlined',
    ...other
  } = props;

  const generatedId = React.useId();
  const rootId = idOverride || generatedId;
  const helperTextId = helperText && rootId ? `${rootId}-helper-text` : undefined;
  const inputLabelId = label && rootId ? `${rootId}-label` : undefined;
  const InputComponent = variantComponent[variant];

  const inputAdditionalProps = {};
  if (variant === 'outlined') {
    if (InputLabelProps && typeof InputLabelProps.shrink !== 'undefined') {
      inputAdditionalProps.notched = InputLabelProps.shrink;
    }
    inputAdditionalProps.label = label;
  }
  if (select) {
    if (!SelectProps || !SelectProps.native) {
      inputAdditionalProps.id = undefined;
    }
    inputAdditionalProps['aria-describedby'] = undefined;
  }

  const InputElement = (
    <InputComponent
      aria-describedby={helperTextId}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      defaultValue={defaultValue}
      fullWidth={fullWidth}
      multiline={multiline}
      name={name}
      rows={rows}
      maxRows={maxRows}
      minRows={minRows}
      type={type}
      value={value}
      id={rootId}
      inputRef={inputRef}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
      placeholder={placeholder}
      inputProps={inputProps}
      {...InputProps}
      {...inputAdditionalProps}
    />
  );

  return (
    <FormControl
      ref={ref}
      className={className}
      disabled={disabled}
      error={error}
      fullWidth={fullWidth}
      required={required}
      color={color}
      variant={variant}
      {...other}
    >
      {label != null && label !== '' && (
        <InputLabel htmlFor={rootId} id={inputLabelId} {...InputLabelProps}>
          {label}
        </InputLabel>
      )}

      {select ? (
        <Select
          aria-describedby={helperTextId}
          id={rootId}
          labelId={inputLabelId}
          value={value}
          input={InputElement}
          {...SelectProps}
        >
          {children}
        </Select>
      ) : (
        InputElement
      )}

      {helperText && (
        <FormHelperText id={helperTextId} {...FormHelperTextProps}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
});

export default TextField;
