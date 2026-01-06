'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import elementTypeAcceptingRef from '@mui/utils/elementTypeAcceptingRef';
import refType from '@mui/utils/refType';
import composeClasses from '@mui/utils/composeClasses';
import TextareaAutosize from '../TextareaAutosize';
import formControlState from '../FormControl/formControlState';
import FormControlContext from '../FormControl/FormControlContext';
import useFormControl from '../FormControl/useFormControl';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import capitalize from '../utils/capitalize';
import useForkRef from '../utils/useForkRef';
import useEnhancedEffect from '../utils/useEnhancedEffect';
import { isFilled } from './utils';
import inputBaseClasses, { getInputBaseUtilityClass } from './inputBaseClasses';

export const rootOverridesResolver = (props, styles) => {
  const { ownerState } = props;

  return [
    styles.root,
    ownerState.formControl && styles.formControl,
    ownerState.startAdornment && styles.adornedStart,
    ownerState.endAdornment && styles.adornedEnd,
    ownerState.error && styles.error,
    ownerState.multiline && styles.multiline,
    ownerState.hiddenLabel && styles.hiddenLabel,
  ];
};

export const inputOverridesResolver = (props, styles) => {
  const { ownerState } = props;

  return [
    styles.input,
    ownerState.multiline && styles.inputMultiline,
    ownerState.type === 'search' && styles.inputTypeSearch,
    ownerState.startAdornment && styles.inputAdornedStart,
    ownerState.endAdornment && styles.inputAdornedEnd,
    ownerState.hiddenLabel && styles.inputHiddenLabel,
  ];
};

const useUtilityClasses = (ownerState) => {
  const {
    classes,
    disabled,
    error,
    endAdornment,
    focused,
    formControl,
    hiddenLabel,
    multiline,
    readOnly,
    startAdornment,
    type,
  } = ownerState;
  const slots = {
    root: [
      'root',
      disabled && 'disabled',
      error && 'error',
      focused && 'focused',
      formControl && 'formControl',
      multiline && 'multiline',
      startAdornment && 'adornedStart',
      endAdornment && 'adornedEnd',
      hiddenLabel && 'hiddenLabel',
      readOnly && 'readOnly',
    ],
    input: [
      'input',
      disabled && 'disabled',
      type === 'search' && 'inputTypeSearch',
      multiline && 'inputMultiline',
      hiddenLabel && 'inputHiddenLabel',
      startAdornment && 'inputAdornedStart',
      endAdornment && 'inputAdornedEnd',
      readOnly && 'readOnly',
    ],
  };

  return composeClasses(slots, getInputBaseUtilityClass, classes);
};

export const InputBaseRoot = styled('div', {
  name: 'MuiInputBase',
  slot: 'Root',
  overridesResolver: rootOverridesResolver,
})(
  memoTheme(({ theme }) => ({
    ...theme.typography.body1,
    color: (theme.vars || theme).palette.text.primary,
    lineHeight: '1.4375em', // 23px
    boxSizing: 'border-box', // Prevent padding issue with fullWidth.
    position: 'relative',
    cursor: 'text',
    display: 'inline-flex',
    alignItems: 'center',
    [`&.${inputBaseClasses.disabled}`]: {
      color: (theme.vars || theme).palette.text.disabled,
      cursor: 'default',
    },
    variants: [
      {
        props: ({ ownerState }) => ownerState.multiline,
        style: {
          padding: '4px 0 5px',
        },
      },
      {
        props: ({ ownerState, size }) => ownerState.multiline && size === 'small',
        style: {
          paddingTop: 1,
        },
      },
    ],
  })),
);

export const InputBaseInput = styled('input', {
  name: 'MuiInputBase',
  slot: 'Input',
  overridesResolver: inputOverridesResolver,
})(
  memoTheme(({ theme }) => {
    const light = theme.palette.mode === 'light';
    const placeholder = {
      color: 'currentColor',
      ...(theme.vars
        ? {
            opacity: theme.vars.opacity.inputPlaceholder,
          }
        : {
            opacity: light ? 0.42 : 0.5,
          }),
      transition: theme.transitions.create('opacity', {
        duration: theme.transitions.duration.shorter,
      }),
    };
    const placeholderHidden = {
      opacity: '0 !important',
    };
    const placeholderVisible = theme.vars
      ? {
          opacity: theme.vars.opacity.inputPlaceholder,
        }
      : {
          opacity: light ? 0.42 : 0.5,
        };

    return {
      font: 'inherit',
      letterSpacing: 'inherit',
      color: 'currentColor',
      padding: '4px 0 5px',
      border: 0,
      boxSizing: 'content-box',
      background: 'none',
      height: '1.4375em', // Reset 23pxthe native input line-height
      margin: 0, // Reset for Safari
      WebkitTapHighlightColor: 'transparent',
      display: 'block',
      // Make the flex item shrink with Firefox
      minWidth: 0,
      width: '100%',
      '&::-webkit-input-placeholder': placeholder,
      '&::-moz-placeholder': placeholder, // Firefox 19+
      '&::-ms-input-placeholder': placeholder, // Edge
      '&:focus': {
        outline: 0,
      },
      // Reset Firefox invalid required input style
      '&:invalid': {
        boxShadow: 'none',
      },
      '&::-webkit-search-decoration': {
        // Remove the padding when type=search.
        WebkitAppearance: 'none',
      },
      // Show and hide the placeholder logic
      [`label[data-shrink=false] + .${inputBaseClasses.formControl} &`]: {
        '&::-webkit-input-placeholder': placeholderHidden,
        '&::-moz-placeholder': placeholderHidden, // Firefox 19+
        '&::-ms-input-placeholder': placeholderHidden, // Edge
        '&:focus::-webkit-input-placeholder': placeholderVisible,
        '&:focus::-moz-placeholder': placeholderVisible, // Firefox 19+
        '&:focus::-ms-input-placeholder': placeholderVisible, // Edge
      },
      [`&.${inputBaseClasses.disabled}`]: {
        opacity: 1, // Reset iOS opacity
        WebkitTextFillColor: (theme.vars || theme).palette.text.disabled, // Fix opacity Safari bug
      },
      variants: [
        {
          props: {
            size: 'small',
          },
          style: {
            paddingTop: 1,
          },
        },
        {
          props: ({ ownerState }) => ownerState.multiline,
          style: {
            height: 'auto',
            resize: 'none',
            padding: 0,
            paddingTop: 0,
          },
        },
        {
          props: {
            type: 'search',
          },
          style: {
            MozAppearance: 'textfield', // Improve type search style.
          },
        },
      ],
    };
  }),
);

/**
 * `InputBase` contains as few styles as possible.
 * It aims to be a simple building block for creating an input.
 * It contains a load of style reset and some state logic.
 */
const InputBase = React.forwardRef(function InputBase(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiInputBase' });
  const {
    'aria-describedby': ariaDescribedby,
    autoComplete,
    autoFocus,
    className,
    defaultValue,
    disabled,
    endAdornment,
    error,
    id,
    inputComponent = 'input',
    inputProps: inputPropsProp = {},
    inputRef: inputRefProp,
    maxRows,
    minRows,
    multiline = false,
    name,
    onBlur,
    onChange,
    onClick,
    onFocus,
    onKeyDown,
    onKeyUp,
    placeholder,
    readOnly,
    renderSuffix,
    rows,
    startAdornment,
    type = 'text',
    value: valueProp,
    ...other
  } = props;

  const value = inputPropsProp.value != null ? inputPropsProp.value : valueProp;
  const { current: isControlled } = React.useRef(value != null);

  const inputRef = React.useRef();
  const handleInputRefWarning = React.useCallback((instance) => {
    if (process.env.NODE_ENV !== 'production') {
      if (instance && instance.nodeName !== 'INPUT' && !instance.focus) {
        console.error(
          [
            'MUI: You have provided a `inputComponent` to the input component',
            'that does not correctly handle the `ref` prop.',
            'Make sure the `ref` prop is called with a HTMLInputElement.',
          ].join('\n'),
        );
      }
    }
  }, []);

  const handleInputRef = useForkRef(
    inputRef,
    inputRefProp,
    inputPropsProp.ref,
    handleInputRefWarning,
  );

  const [focused, setFocused] = React.useState(false);
  const muiFormControl = useFormControl();

  if (process.env.NODE_ENV !== 'production') {
    // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (muiFormControl) {
        return muiFormControl.registerEffect();
      }

      return undefined;
    }, [muiFormControl]);
  }

  const fcs = formControlState({
    props,
    muiFormControl,
    states: ['disabled', 'error', 'hiddenLabel', 'required', 'filled'],
  });

  fcs.focused = muiFormControl ? muiFormControl.focused : focused;

  // The blur won't fire when the disabled state is set on a focused input.
  // We need to book keep the focused state manually.
  React.useEffect(() => {
    if (!muiFormControl && disabled && focused) {
      setFocused(false);
      if (onBlur) {
        onBlur();
      }
    }
  }, [muiFormControl, disabled, focused, onBlur]);

  const onFilled = muiFormControl && muiFormControl.onFilled;
  const onEmpty = muiFormControl && muiFormControl.onEmpty;

  const checkDirty = React.useCallback(
    (obj) => {
      if (isFilled(obj)) {
        if (onFilled) {
          onFilled();
        }
      } else if (onEmpty) {
        onEmpty();
      }
    },
    [onFilled, onEmpty],
  );

  useEnhancedEffect(() => {
    if (isControlled) {
      checkDirty({ value });
    }
  }, [value, checkDirty, isControlled]);

  const handleFocus = (event) => {
    if (onFocus) {
      onFocus(event);
    }
    if (inputPropsProp.onFocus) {
      inputPropsProp.onFocus(event);
    }

    if (muiFormControl && muiFormControl.onFocus) {
      muiFormControl.onFocus(event);
    } else {
      setFocused(true);
    }
  };

  const handleBlur = (event) => {
    if (onBlur) {
      onBlur(event);
    }
    if (inputPropsProp.onBlur) {
      inputPropsProp.onBlur(event);
    }

    if (muiFormControl && muiFormControl.onBlur) {
      muiFormControl.onBlur(event);
    } else {
      setFocused(false);
    }
  };

  const handleChange = (event, ...args) => {
    if (!isControlled) {
      const element = event.target || inputRef.current;
      if (element == null) {
        throw /* minify-error */ new Error(
          'MUI: Expected valid input target. ' +
            'Did you use a custom `inputComponent` and forget to forward refs? ' +
            'See https://mui.com/r/input-component-ref-interface for more info.',
        );
      }

      checkDirty({
        value: element.value,
      });
    }

    if (inputPropsProp.onChange) {
      inputPropsProp.onChange(event, ...args);
    }

    // Perform in the willUpdate
    if (onChange) {
      onChange(event, ...args);
    }
  };

  // Check the input state on mount, in case it was filled by the user
  // or auto filled by the browser before the hydration (for SSR).
  React.useEffect(() => {
    checkDirty(inputRef.current);
    // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (event) => {
    if (inputRef.current && event.currentTarget === event.target) {
      inputRef.current.focus();
    }

    if (onClick) {
      onClick(event);
    }
  };
  let InputComponent = inputComponent;
  let inputProps = inputPropsProp;

  if (multiline && InputComponent === 'input') {
    if (rows) {
      if (process.env.NODE_ENV !== 'production') {
        if (minRows || maxRows) {
          console.warn(
            'MUI: You can not use the `minRows` or `maxRows` props when the input `rows` prop is set.',
          );
        }
      }
      inputProps = {
        type: undefined,
        minRows: rows,
        maxRows: rows,
        ...inputProps,
      };
    } else {
      inputProps = {
        type: undefined,
        maxRows,
        minRows,
        ...inputProps,
      };
    }

    InputComponent = TextareaAutosize;
  }

  React.useEffect(() => {
    if (muiFormControl) {
      muiFormControl.setAdornedStart(Boolean(startAdornment));
    }
  }, [muiFormControl, startAdornment]);

  const ownerState = {
    ...props,
    disabled: fcs.disabled,
    endAdornment,
    error: fcs.error,
    focused: fcs.focused,
    formControl: muiFormControl,
    hiddenLabel: fcs.hiddenLabel,
    multiline,
    startAdornment,
    type,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <React.Fragment>
      <InputBaseRoot
        ref={ref}
        onClick={handleClick}
        {...other}
        ownerState={ownerState}
        className={clsx(
          classes.root,
          {
            // TODO v6: remove this class as it duplicates with the global state class Mui-readOnly
            'MuiInputBase-readOnly': readOnly,
          },
          className,
        )}
      >
        {startAdornment}
        <FormControlContext.Provider value={null}>
          <InputBaseInput
            aria-invalid={fcs.error}
            aria-describedby={ariaDescribedby}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            defaultValue={defaultValue}
            disabled={fcs.disabled}
            id={id}
            name={name}
            placeholder={placeholder}
            readOnly={readOnly}
            required={fcs.required}
            rows={rows}
            value={value}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            type={type}
            {...inputProps}
            as={InputComponent}
            ownerState={ownerState}
            ref={handleInputRef}
            className={clsx(
              classes.input,
              {
                // TODO v6: remove this class as it duplicates with the global state class Mui-readOnly
                'MuiInputBase-readOnly': readOnly,
              },
              inputProps.className,
            )}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
          />
        </FormControlContext.Provider>
        {endAdornment}
        {renderSuffix
          ? renderSuffix({
              ...fcs,
              startAdornment,
            })
          : null}
      </InputBaseRoot>
    </React.Fragment>
  );
});

InputBase.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  'aria-describedby': PropTypes.string,
  /**
   * This prop helps users to fill forms faster, especially on mobile devices.
   * The name can be confusing, as it's more like an autofill.
   * You can learn more about it [following the specification](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill).
   */
  autoComplete: PropTypes.string,
  /**
   * If `true`, the `input` element is focused during the first mount.
   */
  autoFocus: PropTypes.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue: PropTypes.any,
  /**
   * If `true`, the component is disabled.
   * The prop defaults to the value (`false`) inherited from the parent FormControl component.
   */
  disabled: PropTypes.bool,
  /**
   * End `InputAdornment` for this component.
   */
  endAdornment: PropTypes.node,
  /**
   * If `true`, the `input` will indicate an error.
   * The prop defaults to the value (`false`) inherited from the parent FormControl component.
   */
  error: PropTypes.bool,
  /**
   * The id of the `input` element.
   */
  id: PropTypes.string,
  /**
   * The component used for the `input` element.
   * Either a string to use a HTML element or a component.
   * @default 'input'
   */
  inputComponent: elementTypeAcceptingRef,
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes) applied to the `input` element.
   * @default {}
   */
  inputProps: PropTypes.object,
  /**
   * Pass a ref to the `input` element.
   */
  inputRef: refType,
  /**
   * Maximum number of rows to display when multiline option is set to true.
   */
  maxRows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * Minimum number of rows to display when multiline option is set to true.
   */
  minRows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * If `true`, a [TextareaAutosize](https://mui.com/material-ui/react-textarea-autosize/) element is rendered.
   * @default false
   */
  multiline: PropTypes.bool,
  /**
   * Name attribute of the `input` element.
   */
  name: PropTypes.string,
  /**
   * Callback fired when the `input` is blurred.
   *
   * Notice that the first argument (event) might be undefined.
   */
  onBlur: PropTypes.func,
  /**
   * Callback fired when the value is changed.
   *
   * @param {React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>} event The event source of the callback.
   * You can pull out the new value by accessing `event.target.value` (string).
   */
  onChange: PropTypes.func,
  /**
   * @ignore
   */
  onClick: PropTypes.func,
  /**
   * @ignore
   */
  onFocus: PropTypes.func,
  /**
   * Callback fired when the `input` doesn't satisfy its constraints.
   */
  onInvalid: PropTypes.func,
  /**
   * @ignore
   */
  onKeyDown: PropTypes.func,
  /**
   * @ignore
   */
  onKeyUp: PropTypes.func,
  /**
   * The short hint displayed in the `input` before the user enters a value.
   */
  placeholder: PropTypes.string,
  /**
   * It prevents the user from changing the value of the field
   * (not from interacting with the field).
   */
  readOnly: PropTypes.bool,
  /**
   * @ignore
   */
  renderSuffix: PropTypes.func,
  /**
   * If `true`, the `input` element is required.
   * The prop defaults to the value (`false`) inherited from the parent FormControl component.
   */
  required: PropTypes.bool,
  /**
   * Number of rows to display when multiline option is set to true.
   */
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * Start `InputAdornment` for this component.
   */
  startAdornment: PropTypes.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * Type of the `input` element. It should be [a valid HTML5 input type](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#input_types).
   * @default 'text'
   */
  type: PropTypes.string,
  /**
   * The value of the `input` element, required for a controlled component.
   */
  value: PropTypes.any,
};

export default InputBase;
