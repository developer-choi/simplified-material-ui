'use client';
import * as React from 'react';
import refType from '@mui/utils/refType';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import InputBase from '../../../form/InputBase';
import rootShouldForwardProp from '../styles/rootShouldForwardProp';
import { styled } from '../zero-styled';
import filledInputClasses, { getFilledInputUtilityClass } from './filledInputClasses';
import {
  rootOverridesResolver as inputBaseRootOverridesResolver,
  inputOverridesResolver as inputBaseInputOverridesResolver,
  InputBaseRoot,
  InputBaseInput,
} from '../../../form/InputBase/InputBase';
import { capitalize } from '../utils';

const useUtilityClasses = (ownerState) => {
  const { classes, disableUnderline, startAdornment, endAdornment, size, hiddenLabel, multiline } =
    ownerState;

  const slots = {
    root: [
      'root',
      !disableUnderline && 'underline',
      startAdornment && 'adornedStart',
      endAdornment && 'adornedEnd',
      size === 'small' && `size${capitalize(size)}`,
      hiddenLabel && 'hiddenLabel',
      multiline && 'multiline',
    ],
    input: ['input'],
  };

  const composedClasses = composeClasses(slots, getFilledInputUtilityClass, classes);

  return {
    ...classes, // forward classes to the InputBase
    ...composedClasses,
  };
};

const FilledInputRoot = styled(InputBaseRoot, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiFilledInput',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      ...inputBaseRootOverridesResolver(props, styles),
      !ownerState.disableUnderline && styles.underline,
    ];
  },
)({
  position: 'relative',
  backgroundColor: 'rgba(0, 0, 0, 0.06)',
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  transition: 'background-color 150ms cubic-bezier(0.0, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.09)',
    '@media (hover: none)': {
      backgroundColor: 'rgba(0, 0, 0, 0.06)',
    },
  },
  [`&.${filledInputClasses.focused}`]: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  [`&.${filledInputClasses.disabled}`]: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  variants: [
    {
      props: ({ ownerState }) => !ownerState.disableUnderline,
      style: {
        '&::after': {
          left: 0,
          bottom: 0,
          content: '""',
          position: 'absolute',
          right: 0,
          transform: 'scaleX(0)',
          transition: 'transform 150ms cubic-bezier(0.0, 0, 0.2, 1)',
          pointerEvents: 'none',
        },
        [`&.${filledInputClasses.focused}:after`]: {
          transform: 'scaleX(1) translateX(0)',
        },
        [`&.${filledInputClasses.error}`]: {
          '&::before, &::after': {
            borderBottomColor: '#d32f2f',
          },
        },
        '&::before': {
          borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
          left: 0,
          bottom: 0,
          content: '"\\00a0"',
          position: 'absolute',
          right: 0,
          transition: 'border-bottom-color 150ms',
          pointerEvents: 'none',
        },
        [`&:hover:not(.${filledInputClasses.disabled}, .${filledInputClasses.error}):before`]: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.87)',
        },
        [`&.${filledInputClasses.disabled}:before`]: {
          borderBottomStyle: 'dotted',
        },
      },
    },
    {
      props: { disableUnderline: false },
      style: {
        '&::after': {
          borderBottom: '2px solid #1976d2',
        },
      },
    },
    {
      props: ({ ownerState }) => ownerState.startAdornment,
      style: {
        paddingLeft: 12,
      },
    },
    {
      props: ({ ownerState }) => ownerState.endAdornment,
      style: {
        paddingRight: 12,
      },
    },
    {
      props: ({ ownerState }) => ownerState.multiline,
      style: {
        padding: '25px 12px 8px',
      },
    },
    {
      props: ({ ownerState, size }) => ownerState.multiline && size === 'small',
      style: {
        paddingTop: 21,
        paddingBottom: 4,
      },
    },
    {
      props: ({ ownerState }) => ownerState.multiline && ownerState.hiddenLabel,
      style: {
        paddingTop: 16,
        paddingBottom: 17,
      },
    },
    {
      props: ({ ownerState }) =>
        ownerState.multiline && ownerState.hiddenLabel && ownerState.size === 'small',
      style: {
        paddingTop: 8,
        paddingBottom: 9,
      },
    },
  ],
});

const FilledInputInput = styled(InputBaseInput, {
  name: 'MuiFilledInput',
  slot: 'Input',
  overridesResolver: inputBaseInputOverridesResolver,
})({
  paddingTop: 25,
  paddingRight: 12,
  paddingBottom: 8,
  paddingLeft: 12,
  '&:-webkit-autofill': {
    borderTopLeftRadius: 'inherit',
    borderTopRightRadius: 'inherit',
  },
  variants: [
    {
      props: {
        size: 'small',
      },
      style: {
        paddingTop: 21,
        paddingBottom: 4,
      },
    },
    {
      props: ({ ownerState }) => ownerState.hiddenLabel,
      style: {
        paddingTop: 16,
        paddingBottom: 17,
      },
    },
    {
      props: ({ ownerState }) => ownerState.startAdornment,
      style: {
        paddingLeft: 0,
      },
    },
    {
      props: ({ ownerState }) => ownerState.endAdornment,
      style: {
        paddingRight: 0,
      },
    },
    {
      props: ({ ownerState }) => ownerState.hiddenLabel && ownerState.size === 'small',
      style: {
        paddingTop: 8,
        paddingBottom: 9,
      },
    },
    {
      props: ({ ownerState }) => ownerState.multiline,
      style: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
  ],
});

const FilledInput = React.forwardRef(function FilledInput(props, ref) {
  const {
    disableUnderline = false,
    fullWidth = false,
    hiddenLabel, // declare here to prevent spreading to DOM
    inputComponent = 'input',
    multiline = false,
    slotProps,
    slots = {},
    type = 'text',
    ...other
  } = props;

  const ownerState = {
    ...props,
    disableUnderline,
    fullWidth,
    inputComponent,
    multiline,
    type,
  };

  const classes = useUtilityClasses(props);
  const filledInputComponentsProps = { root: { ownerState }, input: { ownerState } };

  const mergedSlotProps = slotProps
    ? { ...filledInputComponentsProps, ...slotProps }
    : filledInputComponentsProps;

  const RootSlot = slots.root ?? FilledInputRoot;
  const InputSlot = slots.input ?? FilledInputInput;

  return (
    <InputBase
      slots={{ root: RootSlot, input: InputSlot }}
      slotProps={mergedSlotProps}
      fullWidth={fullWidth}
      inputComponent={inputComponent}
      multiline={multiline}
      ref={ref}
      type={type}
      {...other}
      classes={classes}
    />
  );
});

FilledInput.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
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
   * The default value. Use when the component is not controlled.
   */
  defaultValue: PropTypes.any,
  /**
   * If `true`, the component is disabled.
   * The prop defaults to the value (`false`) inherited from the parent FormControl component.
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, the input will not have an underline.
   * @default false
   */
  disableUnderline: PropTypes.bool,
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
   * If `true`, the `input` will take up the full width of its container.
   * @default false
   */
  fullWidth: PropTypes.bool,
  /**
   * If `true`, the label is hidden.
   * This is used to increase density for a `FilledInput`.
   * Be sure to add `aria-label` to the `input` element.
   * @default false
   */
  hiddenLabel: PropTypes.bool,
  /**
   * The id of the `input` element.
   */
  id: PropTypes.string,
  /**
   * The component used for the `input` element.
   * Either a string to use a HTML element or a component.
   * @default 'input'
   */
  inputComponent: PropTypes.elementType,
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
   * If `dense`, will adjust vertical spacing. This is normally obtained via context from
   * FormControl.
   * The prop defaults to the value (`'none'`) inherited from the parent FormControl component.
   */
  margin: PropTypes.oneOf(['dense', 'none']),
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
   * Callback fired when the value is changed.
   *
   * @param {React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>} event The event source of the callback.
   * You can pull out the new value by accessing `event.target.value` (string).
   */
  onChange: PropTypes.func,
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
   * If `true`, the `input` element is required.
   * The prop defaults to the value (`false`) inherited from the parent FormControl component.
   */
  required: PropTypes.bool,
  /**
   * Number of rows to display when multiline option is set to true.
   */
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * The extra props for the slot components.
   * You can override the existing props or add new ones.
   *
   * This prop is an alias for the `componentsProps` prop, which will be deprecated in the future.
   *
   * @default {}
   */
  slotProps: PropTypes.shape({
    input: PropTypes.object,
    root: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   *
   * This prop is an alias for the `components` prop, which will be deprecated in the future.
   *
   * @default {}
   */
  slots: PropTypes.shape({
    input: PropTypes.elementType,
    root: PropTypes.elementType,
  }),
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

FilledInput.muiName = 'Input';

export default FilledInput;
