'use client';
import * as React from 'react';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import useAutocomplete, { createFilterOptions } from '../useAutocomplete';
import Popper from '../../../layout/Popper';
import Paper from '../../../surfaces/Paper';
import IconButton from '../../../form/IconButton';
import Chip from '../../../data-display/Chip';
import inputClasses from '../../../form/Input/inputClasses';
import inputBaseClasses from '../../../form/InputBase/inputBaseClasses';
import outlinedInputClasses from '../../../form/OutlinedInput/outlinedInputClasses';
import filledInputClasses from '../../../form/FilledInput/filledInputClasses';
import ClearIcon from '../internal/svg-icons/Close';
import ArrowDropDownIcon from '../internal/svg-icons/ArrowDropDown';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import autocompleteClasses, { getAutocompleteUtilityClass } from './autocompleteClasses';
import capitalize from '../utils/capitalize';

const useUtilityClasses = (ownerState) => {
  const {
    classes,
    disablePortal,
    expanded,
    focused,
    fullWidth,
    hasClearIcon,
    hasPopupIcon,
    inputFocused,
    popupOpen,
    size,
  } = ownerState;

  const slots = {
    root: [
      'root',
      expanded && 'expanded',
      focused && 'focused',
      fullWidth && 'fullWidth',
      hasClearIcon && 'hasClearIcon',
      hasPopupIcon && 'hasPopupIcon',
    ],
    inputRoot: ['inputRoot'],
    input: ['input', inputFocused && 'inputFocused'],
    tag: ['tag', `tagSize${capitalize(size)}`],
    endAdornment: ['endAdornment'],
    clearIndicator: ['clearIndicator'],
    popupIndicator: ['popupIndicator', popupOpen && 'popupIndicatorOpen'],
    popper: ['popper', disablePortal && 'popperDisablePortal'],
    paper: ['paper'],
    listbox: ['listbox'],
    loading: ['loading'],
    noOptions: ['noOptions'],
    option: ['option'],
  };

  return composeClasses(slots, getAutocompleteUtilityClass, classes);
};

const AutocompleteRoot = styled('div', {
  name: 'MuiAutocomplete',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    const { fullWidth, hasClearIcon, hasPopupIcon, inputFocused, size } = ownerState;

    return [
      { [`& .${autocompleteClasses.tag}`]: styles.tag },
      { [`& .${autocompleteClasses.tag}`]: styles[`tagSize${capitalize(size)}`] },
      { [`& .${autocompleteClasses.inputRoot}`]: styles.inputRoot },
      { [`& .${autocompleteClasses.input}`]: styles.input },
      { [`& .${autocompleteClasses.input}`]: inputFocused && styles.inputFocused },
      styles.root,
      fullWidth && styles.fullWidth,
      hasPopupIcon && styles.hasPopupIcon,
      hasClearIcon && styles.hasClearIcon,
    ];
  },
})({
  [`&.${autocompleteClasses.focused} .${autocompleteClasses.clearIndicator}`]: {
    visibility: 'visible',
  },
  /* Avoid double tap issue on iOS */
  '@media (pointer: fine)': {
    [`&:hover .${autocompleteClasses.clearIndicator}`]: {
      visibility: 'visible',
    },
  },
  [`& .${autocompleteClasses.tag}`]: {
    margin: 3,
    maxWidth: 'calc(100% - 6px)',
  },
  [`& .${autocompleteClasses.inputRoot}`]: {
    [`.${autocompleteClasses.hasPopupIcon}&, .${autocompleteClasses.hasClearIcon}&`]: {
      paddingRight: 26 + 4,
    },
    [`.${autocompleteClasses.hasPopupIcon}.${autocompleteClasses.hasClearIcon}&`]: {
      paddingRight: 52 + 4,
    },
    [`& .${autocompleteClasses.input}`]: {
      width: 0,
      minWidth: 30,
    },
  },
  [`& .${inputClasses.root}`]: {
    paddingBottom: 1,
    '& .MuiInput-input': {
      padding: '4px 4px 4px 0px',
    },
  },
  [`& .${inputClasses.root}.${inputBaseClasses.sizeSmall}`]: {
    [`& .${inputClasses.input}`]: {
      padding: '2px 4px 3px 0',
    },
  },
  [`& .${outlinedInputClasses.root}`]: {
    padding: 9,
    [`.${autocompleteClasses.hasPopupIcon}&, .${autocompleteClasses.hasClearIcon}&`]: {
      paddingRight: 26 + 4 + 9,
    },
    [`.${autocompleteClasses.hasPopupIcon}.${autocompleteClasses.hasClearIcon}&`]: {
      paddingRight: 52 + 4 + 9,
    },
    [`& .${autocompleteClasses.input}`]: {
      padding: '7.5px 4px 7.5px 5px',
    },
    [`& .${autocompleteClasses.endAdornment}`]: {
      right: 9,
    },
  },
  [`& .${outlinedInputClasses.root}.${inputBaseClasses.sizeSmall}`]: {
    // Don't specify paddingRight, as it overrides the default value set when there is only
    // one of the popup or clear icon as the specificity is equal so the latter one wins
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 6,
    [`& .${autocompleteClasses.input}`]: {
      padding: '2.5px 4px 2.5px 8px',
    },
  },
  [`& .${filledInputClasses.root}`]: {
    paddingTop: 19,
    paddingLeft: 8,
    [`.${autocompleteClasses.hasPopupIcon}&, .${autocompleteClasses.hasClearIcon}&`]: {
      paddingRight: 26 + 4 + 9,
    },
    [`.${autocompleteClasses.hasPopupIcon}.${autocompleteClasses.hasClearIcon}&`]: {
      paddingRight: 52 + 4 + 9,
    },
    [`& .${filledInputClasses.input}`]: {
      padding: '7px 4px',
    },
    [`& .${autocompleteClasses.endAdornment}`]: {
      right: 9,
    },
  },
  [`& .${filledInputClasses.root}.${inputBaseClasses.sizeSmall}`]: {
    paddingBottom: 1,
    [`& .${filledInputClasses.input}`]: {
      padding: '2.5px 4px',
    },
  },
  [`& .${inputBaseClasses.hiddenLabel}`]: {
    paddingTop: 8,
  },
  [`& .${filledInputClasses.root}.${inputBaseClasses.hiddenLabel}`]: {
    paddingTop: 0,
    paddingBottom: 0,
    [`& .${autocompleteClasses.input}`]: {
      paddingTop: 16,
      paddingBottom: 17,
    },
  },
  [`& .${filledInputClasses.root}.${inputBaseClasses.hiddenLabel}.${inputBaseClasses.sizeSmall}`]: {
    [`& .${autocompleteClasses.input}`]: {
      paddingTop: 8,
      paddingBottom: 9,
    },
  },
  [`& .${autocompleteClasses.input}`]: {
    flexGrow: 1,
    textOverflow: 'ellipsis',
    opacity: 0,
  },
  variants: [
    {
      props: { fullWidth: true },
      style: { width: '100%' },
    },
    {
      props: { size: 'small' },
      style: {
        [`& .${autocompleteClasses.tag}`]: {
          margin: 2,
          maxWidth: 'calc(100% - 4px)',
        },
      },
    },
    {
      props: { inputFocused: true },
      style: {
        [`& .${autocompleteClasses.input}`]: {
          opacity: 1,
        },
      },
    },
    {
      props: { multiple: true },
      style: {
        [`& .${autocompleteClasses.inputRoot}`]: {
          flexWrap: 'wrap',
        },
      },
    },
  ],
});

const AutocompleteEndAdornment = styled('div', {
  name: 'MuiAutocomplete',
  slot: 'EndAdornment',
})({
  // We use a position absolute to support wrapping tags.
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translate(0, -50%)',
});

const AutocompleteClearIndicator = styled(IconButton, {
  name: 'MuiAutocomplete',
  slot: 'ClearIndicator',
})({
  marginRight: -2,
  padding: 4,
  visibility: 'hidden',
});

const AutocompletePopupIndicator = styled(IconButton, {
  name: 'MuiAutocomplete',
  slot: 'PopupIndicator',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.popupIndicator, ownerState.popupOpen && styles.popupIndicatorOpen];
  },
})({
  padding: 2,
  marginRight: -2,
  variants: [
    {
      props: { popupOpen: true },
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
});

const AutocompletePopper = styled(Popper, {
  name: 'MuiAutocomplete',
  slot: 'Popper',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      { [`& .${autocompleteClasses.option}`]: styles.option },
      styles.popper,
      ownerState.disablePortal && styles.popperDisablePortal,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    zIndex: (theme.vars || theme).zIndex.modal,
    variants: [
      {
        props: { disablePortal: true },
        style: {
          position: 'absolute',
        },
      },
    ],
  })),
);

const AutocompletePaper = styled(Paper, {
  name: 'MuiAutocomplete',
  slot: 'Paper',
})(
  memoTheme(({ theme }) => ({
    ...theme.typography.body1,
    overflow: 'auto',
  })),
);

const AutocompleteLoading = styled('div', {
  name: 'MuiAutocomplete',
  slot: 'Loading',
})(
  memoTheme(({ theme }) => ({
    color: (theme.vars || theme).palette.text.secondary,
    padding: '14px 16px',
  })),
);

const AutocompleteNoOptions = styled('div', {
  name: 'MuiAutocomplete',
  slot: 'NoOptions',
})(
  memoTheme(({ theme }) => ({
    color: (theme.vars || theme).palette.text.secondary,
    padding: '14px 16px',
  })),
);

const AutocompleteListbox = styled('ul', {
  name: 'MuiAutocomplete',
  slot: 'Listbox',
})(
  memoTheme(({ theme }) => ({
    listStyle: 'none',
    margin: 0,
    padding: '8px 0',
    maxHeight: '40vh',
    overflow: 'auto',
    position: 'relative',
    [`& .${autocompleteClasses.option}`]: {
      minHeight: 48,
      display: 'flex',
      overflow: 'hidden',
      justifyContent: 'flex-start',
      alignItems: 'center',
      cursor: 'pointer',
      paddingTop: 6,
      boxSizing: 'border-box',
      outline: '0',
      WebkitTapHighlightColor: 'transparent',
      paddingBottom: 6,
      paddingLeft: 16,
      paddingRight: 16,
      [theme.breakpoints.up('sm')]: {
        minHeight: 'auto',
      },
      [`&.${autocompleteClasses.focused}`]: {
        backgroundColor: (theme.vars || theme).palette.action.hover,
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: 'transparent',
        },
      },
      '&[aria-disabled="true"]': {
        opacity: (theme.vars || theme).palette.action.disabledOpacity,
        pointerEvents: 'none',
      },
      [`&.${autocompleteClasses.focusVisible}`]: {
        backgroundColor: (theme.vars || theme).palette.action.focus,
      },
      '&[aria-selected="true"]': {
        backgroundColor: theme.alpha(
          (theme.vars || theme).palette.primary.main,
          (theme.vars || theme).palette.action.selectedOpacity,
        ),
        [`&.${autocompleteClasses.focused}`]: {
          backgroundColor: theme.alpha(
            (theme.vars || theme).palette.primary.main,
            `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.hoverOpacity}`,
          ),
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            backgroundColor: (theme.vars || theme).palette.action.selected,
          },
        },
        [`&.${autocompleteClasses.focusVisible}`]: {
          backgroundColor: theme.alpha(
            (theme.vars || theme).palette.primary.main,
            `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`,
          ),
        },
      },
    },
  })),
);
export { createFilterOptions };

const Autocomplete = React.forwardRef(function Autocomplete(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiAutocomplete' });

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    autoComplete = false,
    autoHighlight = false,
    autoSelect = false,
    blurOnSelect = false,
    ChipProps: ChipPropsProp,
    className,
    clearIcon = <ClearIcon fontSize="small" />,
    clearOnBlur = !props.freeSolo,
    clearOnEscape = false,
    clearText = 'Clear',
    closeText = 'Close',
    componentsProps,
    defaultValue = props.multiple ? [] : null,
    disableClearable = false,
    disableCloseOnSelect = false,
    disabled = false,
    disabledItemsFocusable = false,
    disableListWrap = false,
    disablePortal = false,
    filterOptions,
    filterSelectedOptions = false,
    forcePopupIcon = 'auto',
    freeSolo = false,
    fullWidth = false,
    getLimitTagsText = (more) => `+${more}`,
    getOptionDisabled,
    getOptionKey,
    getOptionLabel: getOptionLabelProp,
    isOptionEqualToValue,
    handleHomeEndKeys = !props.freeSolo,
    id: idProp,
    includeInputInList = false,
    inputValue: inputValueProp,
    limitTags = -1,
    ListboxComponent: ListboxComponentProp,
    ListboxProps: ListboxPropsProp,
    loading = false,
    loadingText = 'Loading…',
    multiple = false,
    noOptionsText = 'No options',
    onChange,
    onClose,
    onHighlightChange,
    onInputChange,
    onOpen,
    open,
    openOnFocus = false,
    openText = 'Open',
    options,
    PaperComponent: PaperComponentProp,
    PopperComponent: PopperComponentProp,
    popupIcon = <ArrowDropDownIcon />,
    readOnly = false,
    renderInput,
    renderOption: renderOptionProp,
    renderTags,
    renderValue,
    selectOnFocus = !props.freeSolo,
    size = 'medium',
    value: valueProp,
    ...other
  } = props;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const {
    getRootProps,
    getInputProps,
    getInputLabelProps,
    getPopupIndicatorProps,
    getClearProps,
    getItemProps,
    getListboxProps,
    getOptionProps,
    value,
    dirty,
    expanded,
    id,
    popupOpen,
    focused,
    focusedItem,
    anchorEl,
    setAnchorEl,
    inputValue,
    groupedOptions,
  } = useAutocomplete({ ...props, componentName: 'Autocomplete' });

  const hasClearIcon = !disableClearable && !disabled && dirty && !readOnly;
  const hasPopupIcon = (!freeSolo || forcePopupIcon === true) && forcePopupIcon !== false;

  const { onMouseDown: handleInputMouseDown } = getInputProps();
  const { ref: listboxRef, ...otherListboxProps } = getListboxProps();

  const defaultGetOptionLabel = (option) => option.label ?? option;
  const getOptionLabel = getOptionLabelProp || defaultGetOptionLabel;

  // If you modify this, make sure to keep the `AutocompleteOwnerState` type in sync.
  const ownerState = {
    ...props,
    disablePortal,
    expanded,
    focused,
    fullWidth,
    getOptionLabel,
    hasClearIcon,
    hasPopupIcon,
    inputFocused: focusedItem === -1,
    popupOpen,
    size,
  };

  const classes = useUtilityClasses(ownerState);

  let startAdornment;

  const getCustomizedItemProps = (params) => ({
    className: classes.tag,
    disabled,
    ...getItemProps(params),
  });

  if (multiple) {
    if (value.length > 0) {
      if (renderTags) {
        startAdornment = renderTags(value, getCustomizedItemProps, ownerState);
      } else if (renderValue) {
        startAdornment = renderValue(value, getCustomizedItemProps, ownerState);
      } else {
        startAdornment = value.map((option, index) => {
          const { key, ...customItemProps } = getCustomizedItemProps({ index });
          return (
            <Chip
              key={key}
              label={getOptionLabel(option)}
              size={size}
              {...customItemProps}
            />
          );
        });
      }
    }
  } else if (renderValue && value != null) {
    startAdornment = renderValue(value, getCustomizedItemProps, ownerState);
  }

  if (limitTags > -1 && Array.isArray(startAdornment)) {
    const more = startAdornment.length - limitTags;
    if (!focused && more > 0) {
      startAdornment = startAdornment.splice(0, limitTags);
      startAdornment.push(
        <span className={classes.tag} key={startAdornment.length}>
          {getLimitTagsText(more)}
        </span>,
      );
    }
  }

  const defaultRenderOption = (props2, option) => {
    // Need to clearly apply key because of https://github.com/vercel/next.js/issues/55642
    const { key, ...otherProps } = props2;
    return (
      <li key={key} {...otherProps}>
        {getOptionLabel(option)}
      </li>
    );
  };
  const renderOption = renderOptionProp || defaultRenderOption;

  const renderListOption = (option, index) => {
    const optionProps = getOptionProps({ option, index });

    return renderOption(
      { ...optionProps, className: classes.option },
      option,
      {
        selected: optionProps['aria-selected'],
        index,
        inputValue,
      },
      ownerState,
    );
  };

  return (
    <React.Fragment>
      <AutocompleteRoot
        ref={ref}
        className={clsx(classes.root, className)}
        ownerState={ownerState}
        {...getRootProps(other)}
      >
        {renderInput({
          id,
          disabled,
          fullWidth: true,
          size: size === 'small' ? 'small' : undefined,
          InputLabelProps: getInputLabelProps(),
          InputProps: {
            ref: setAnchorEl,
            className: classes.inputRoot,
            startAdornment,
            onMouseDown: (event) => {
              if (event.target === event.currentTarget) {
                handleInputMouseDown(event);
              }
            },
            ...((hasClearIcon || hasPopupIcon) && {
              endAdornment: (
                <AutocompleteEndAdornment className={classes.endAdornment} ownerState={ownerState}>
                  {hasClearIcon ? (
                    <AutocompleteClearIndicator
                      {...getClearProps()}
                      aria-label={clearText}
                      title={clearText}
                      ownerState={ownerState}
                      className={classes.clearIndicator}
                    >
                      {clearIcon}
                    </AutocompleteClearIndicator>
                  ) : null}

                  {hasPopupIcon ? (
                    <AutocompletePopupIndicator
                      {...getPopupIndicatorProps()}
                      disabled={disabled}
                      aria-label={popupOpen ? closeText : openText}
                      title={popupOpen ? closeText : openText}
                      ownerState={ownerState}
                      className={classes.popupIndicator}
                    >
                      {popupIcon}
                    </AutocompletePopupIndicator>
                  ) : null}
                </AutocompleteEndAdornment>
              ),
            }),
          },
          inputProps: {
            className: classes.input,
            disabled,
            readOnly,
            ...getInputProps(),
          },
        })}
      </AutocompleteRoot>
      {anchorEl ? (
        <AutocompletePopper
          disablePortal={disablePortal}
          style={{ width: anchorEl ? anchorEl.clientWidth : null }}
          role="presentation"
          anchorEl={anchorEl}
          open={popupOpen}
          className={classes.popper}
          ownerState={ownerState}
        >
          <AutocompletePaper className={classes.paper} ownerState={ownerState}>
            {loading && groupedOptions.length === 0 ? (
              <AutocompleteLoading className={classes.loading} ownerState={ownerState}>
                {loadingText}
              </AutocompleteLoading>
            ) : null}
            {groupedOptions.length === 0 && !freeSolo && !loading ? (
              <AutocompleteNoOptions
                className={classes.noOptions}
                ownerState={ownerState}
                role="presentation"
                onMouseDown={(event) => {
                  // Prevent input blur when interacting with the "no options" content
                  event.preventDefault();
                }}
              >
                {noOptionsText}
              </AutocompleteNoOptions>
            ) : null}
            {groupedOptions.length > 0 ? (
              <AutocompleteListbox
                className={classes.listbox}
                ownerState={ownerState}
                ref={listboxRef}
                {...otherListboxProps}
              >
                {groupedOptions.map((option, index) => renderListOption(option, index))}
              </AutocompleteListbox>
            ) : null}
          </AutocompletePaper>
        </AutocompletePopper>
      ) : null}
    </React.Fragment>
  );
});

export default Autocomplete;
