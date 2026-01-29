'use client';
import * as React from 'react';
import { isFragment } from 'react-is';
import useId from '@mui/utils/useId';
import ownerDocument from '../utils/ownerDocument';
import Menu from '../../../menu/Menu/Menu';
import { isFilled } from '../../../form/InputBase/utils';
import useForkRef from '../utils/useForkRef';
import useControlled from '../utils/useControlled';


function areEqualValues(a, b) {
  if (typeof b === 'object' && b !== null) {
    return a === b;
  }

  // The value could be a number, the DOM will stringify it anyway.
  return String(a) === String(b);
}

function isEmpty(display) {
  return display == null || (typeof display === 'string' && !display.trim());
}

function capitalize(string) {
  if (typeof string !== 'string') {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @ignore - internal component.
 */
const SelectInput = React.forwardRef(function SelectInput(props, ref) {
  const {
    'aria-describedby': ariaDescribedby,
    'aria-label': ariaLabel,
    autoFocus,
    autoWidth,
    children,
    className,
    defaultOpen,
    defaultValue,
    disabled,
    displayEmpty,
    error = false,
    IconComponent,
    inputRef: inputRefProp,
    labelId,
    MenuProps = {},
    multiple,
    name,
    onBlur,
    onChange,
    onClose,
    onFocus,
    // eslint-disable-next-line react/prop-types
    onKeyDown,
    // eslint-disable-next-line react/prop-types
    onMouseDown,
    onOpen,
    open: openProp,
    readOnly,
    renderValue,
    required,
    SelectDisplayProps = {},
    tabIndex: tabIndexProp,
    // catching `type` from Input which makes no sense for SelectInput
    type,
    value: valueProp,
    variant = 'standard',
    ...other
  } = props;

  const [value, setValueState] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: 'Select',
  });
  const [openState, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen,
    name: 'Select',
  });

  const inputRef = React.useRef(null);
  const displayRef = React.useRef(null);
  const [displayNode, setDisplayNode] = React.useState(null);
  const { current: isOpenControlled } = React.useRef(openProp != null);
  const [menuMinWidthState, setMenuMinWidthState] = React.useState();

  const handleRef = useForkRef(ref, inputRefProp);

  const handleDisplayRef = React.useCallback((node) => {
    displayRef.current = node;

    if (node) {
      setDisplayNode(node);
    }
  }, []);

  const anchorElement = displayNode?.parentNode;

  React.useImperativeHandle(
    handleRef,
    () => ({
      focus: () => {
        displayRef.current.focus();
      },
      node: inputRef.current,
      value,
    }),
    [value],
  );

  // Resize menu on `defaultOpen` automatic toggle.
  React.useEffect(() => {
    if (defaultOpen && openState && displayNode && !isOpenControlled) {
      setMenuMinWidthState(autoWidth ? null : anchorElement.clientWidth);
      displayRef.current.focus();
    }
    // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayNode, autoWidth]);
  // `isOpenControlled` is ignored because the component should never switch between controlled and uncontrolled modes.
  // `defaultOpen` and `openState` are ignored to avoid unnecessary callbacks.
  React.useEffect(() => {
    if (autoFocus) {
      displayRef.current.focus();
    }
  }, [autoFocus]);

  React.useEffect(() => {
    if (!labelId) {
      return undefined;
    }
    const label = ownerDocument(displayRef.current).getElementById(labelId);
    if (label) {
      const handler = () => {
        if (getSelection().isCollapsed) {
          displayRef.current.focus();
        }
      };
      label.addEventListener('click', handler);
      return () => {
        label.removeEventListener('click', handler);
      };
    }
    return undefined;
  }, [labelId]);

  const update = (open, event) => {
    if (open) {
      if (onOpen) {
        onOpen(event);
      }
    } else if (onClose) {
      onClose(event);
    }

    if (!isOpenControlled) {
      setMenuMinWidthState(autoWidth ? null : anchorElement.clientWidth);
      setOpenState(open);
    }
  };

  const handleMouseDown = (event) => {
    onMouseDown?.(event);
    // Ignore everything but left-click
    if (event.button !== 0) {
      return;
    }
    // Hijack the default focus behavior.
    event.preventDefault();
    displayRef.current.focus();

    update(true, event);
  };

  const handleClose = (event) => {
    update(false, event);
  };

  const childrenArray = React.Children.toArray(children);

  // Support autofill.
  const handleChange = (event) => {
    const child = childrenArray.find((childItem) => childItem.props.value === event.target.value);

    if (child === undefined) {
      return;
    }

    setValueState(child.props.value);

    if (onChange) {
      onChange(event, child);
    }
  };

  const handleItemClick = (child) => (event) => {
    let newValue;

    // We use the tabindex attribute to signal the available options.
    if (!event.currentTarget.hasAttribute('tabindex')) {
      return;
    }

    if (multiple) {
      newValue = Array.isArray(value) ? value.slice() : [];
      const itemIndex = value.indexOf(child.props.value);
      if (itemIndex === -1) {
        newValue.push(child.props.value);
      } else {
        newValue.splice(itemIndex, 1);
      }
    } else {
      newValue = child.props.value;
    }

    if (child.props.onClick) {
      child.props.onClick(event);
    }

    if (value !== newValue) {
      setValueState(newValue);

      if (onChange) {
        // Redefine target to allow name and value to be read.
        // This allows seamless integration with the most popular form libraries.
        // https://github.com/mui/material-ui/issues/13485#issuecomment-676048492
        // Clone the event to not override `target` of the original event.
        const nativeEvent = event.nativeEvent || event;
        const clonedEvent = new nativeEvent.constructor(nativeEvent.type, nativeEvent);

        Object.defineProperty(clonedEvent, 'target', {
          writable: true,
          value: { value: newValue, name },
        });
        onChange(clonedEvent, child);
      }
    }

    if (!multiple) {
      update(false, event);
    }
  };

  const handleKeyDown = (event) => {
    if (!readOnly) {
      const validKeys = [
        ' ',
        'ArrowUp',
        'ArrowDown',
        // The native select doesn't respond to enter on macOS, but it's recommended by
        // https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
        'Enter',
      ];

      if (validKeys.includes(event.key)) {
        event.preventDefault();
        update(true, event);
      }
      onKeyDown?.(event);
    }
  };

  const open = displayNode !== null && openState;

  const handleBlur = (event) => {
    // if open event.stopImmediatePropagation
    if (!open && onBlur) {
      // Preact support, target is read only property on a native event.
      Object.defineProperty(event, 'target', { writable: true, value: { value, name } });
      onBlur(event);
    }
  };

  delete other['aria-invalid'];

  let display;
  let displaySingle;
  const displayMultiple = [];
  let computeDisplay = false;
  let foundMatch = false;

  // No need to display any value if the field is empty.
  if (isFilled({ value }) || displayEmpty) {
    if (renderValue) {
      display = renderValue(value);
    } else {
      computeDisplay = true;
    }
  }

  const items = childrenArray.map((child) => {
    if (!React.isValidElement(child)) {
      return null;
    }

    if (process.env.NODE_ENV !== 'production') {
      if (isFragment(child)) {
        console.error(
          [
            "MUI: The Select component doesn't accept a Fragment as a child.",
            'Consider providing an array instead.',
          ].join('\n'),
        );
      }
    }

    let selected;

    if (multiple) {
      if (!Array.isArray(value)) {
        throw /* minify-error */ new Error(
          'MUI: The `value` prop must be an array ' +
            'when using the `Select` component with `multiple`.',
        );
      }

      selected = value.some((v) => areEqualValues(v, child.props.value));
      if (selected && computeDisplay) {
        displayMultiple.push(child.props.children);
      }
    } else {
      selected = areEqualValues(value, child.props.value);
      if (selected && computeDisplay) {
        displaySingle = child.props.children;
      }
    }

    if (selected) {
      foundMatch = true;
    }

    return React.cloneElement(child, {
      'aria-selected': selected ? 'true' : 'false',
      onClick: handleItemClick(child),
      onKeyUp: (event) => {
        if (event.key === ' ') {
          // otherwise our MenuItems dispatches a click event
          // it's not behavior of the native <option> and causes
          // the select to close immediately since we open on space keydown
          event.preventDefault();
        }

        if (child.props.onKeyUp) {
          child.props.onKeyUp(event);
        }
      },
      role: 'option',
      selected,
      value: undefined, // The value is most likely not a valid HTML attribute.
      'data-value': child.props.value, // Instead, we provide it as a data attribute.
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (!foundMatch && !multiple && value !== '') {
        const values = childrenArray.map((child) => child.props.value);
        console.warn(
          [
            `MUI: You have provided an out-of-range value \`${value}\` for the select ${
              name ? `(name="${name}") ` : ''
            }component.`,
            "Consider providing a value that matches one of the available options or ''.",
            `The available values are ${
              values
                .filter((x) => x != null)
                .map((x) => `\`${x}\``)
                .join(', ') || '""'
            }.`,
          ].join('\n'),
        );
      }
    }, [foundMatch, childrenArray, multiple, name, value]);
  }

  if (computeDisplay) {
    if (multiple) {
      if (displayMultiple.length === 0) {
        display = null;
      } else {
        display = displayMultiple.reduce((output, child, index) => {
          output.push(child);
          if (index < displayMultiple.length - 1) {
            output.push(', ');
          }
          return output;
        }, []);
      }
    } else {
      display = displaySingle;
    }
  }

  // Avoid performing a layout computation in the render method.
  let menuMinWidth = menuMinWidthState;

  if (!autoWidth && isOpenControlled && displayNode) {
    menuMinWidth = anchorElement.clientWidth;
  }

  let tabIndex;
  if (typeof tabIndexProp !== 'undefined') {
    tabIndex = tabIndexProp;
  } else {
    tabIndex = disabled ? null : 0;
  }

  const buttonId = SelectDisplayProps.id || (name ? `mui-component-select-${name}` : undefined);

  const ownerState = {
    ...props,
    variant,
    value,
    open,
    error,
  };

  const paperProps = {
    ...MenuProps.PaperProps,
    ...(typeof MenuProps.slotProps?.paper === 'function'
      ? MenuProps.slotProps.paper(ownerState)
      : MenuProps.slotProps?.paper),
  };

  const listProps = {
    ...MenuProps.MenuListProps,
    ...(typeof MenuProps.slotProps?.list === 'function'
      ? MenuProps.slotProps.list(ownerState)
      : MenuProps.slotProps?.list),
  };

  const listboxId = useId();

  return (
    <React.Fragment>
      <div
        ref={handleDisplayRef}
        tabIndex={tabIndex}
        role="combobox"
        aria-controls={open ? listboxId : undefined}
        aria-disabled={disabled ? 'true' : undefined}
        aria-expanded={open ? 'true' : 'false'}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-labelledby={[labelId, buttonId].filter(Boolean).join(' ') || undefined}
        aria-describedby={ariaDescribedby}
        aria-required={required ? 'true' : undefined}
        aria-invalid={error ? 'true' : undefined}
        onKeyDown={handleKeyDown}
        onMouseDown={disabled || readOnly ? null : handleMouseDown}
        onBlur={handleBlur}
        onFocus={onFocus}
        {...SelectDisplayProps}
        style={{
          height: 'auto',
          minHeight: '1.4375em',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          cursor: disabled ? 'default' : 'text',
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          ...SelectDisplayProps.style,
        }}
        className={SelectDisplayProps.className || className}
        // The id is required for proper a11y
        id={buttonId}
      >
        {/* So the vertical align positioning algorithm kicks in. */}
        {isEmpty(display) ? (
          // notranslate needed while Google Translate will not fix zero-width space issue
          <span className="notranslate" aria-hidden>
            &#8203;
          </span>
        ) : (
          display
        )}
      </div>
      <input
        aria-invalid={error}
        value={Array.isArray(value) ? value.join(',') : value}
        name={name}
        ref={inputRef}
        aria-hidden
        onChange={handleChange}
        tabIndex={-1}
        disabled={disabled}
        style={{
          bottom: 0,
          left: 0,
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
        autoFocus={autoFocus}
        required={required}
        {...other}
      />
      <IconComponent />
      <Menu
        id={`menu-${name || ''}`}
        anchorEl={anchorElement}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        {...MenuProps}
        slotProps={{
          ...MenuProps.slotProps,
          list: {
            'aria-labelledby': labelId,
            role: 'listbox',
            'aria-multiselectable': multiple ? 'true' : undefined,
            disableListWrap: true,
            id: listboxId,
            ...listProps,
          },
          paper: {
            ...paperProps,
            style: {
              minWidth: menuMinWidth,
              ...(paperProps != null ? paperProps.style : null),
            },
          },
        }}
      >
        {items}
      </Menu>
    </React.Fragment>
  );
});

export default SelectInput;
