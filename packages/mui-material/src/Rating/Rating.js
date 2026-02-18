'use client';
import * as React from 'react';
import clamp from '@mui/utils/clamp';
import isFocusVisible from '@mui/utils/isFocusVisible';
import { useControlled, unstable_useId as useId } from '../utils';
import Star from '../internal/svg-icons/Star';
import StarBorder from '../internal/svg-icons/StarBorder';

const visuallyHiddenStyle = {
  border: 0,
  clip: 'rect(0,0,0,0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
};

function getDecimalPrecision(num) {
  const decimalPart = num.toString().split('.')[1];
  return decimalPart ? decimalPart.length : 0;
}

function roundValueToPrecision(value, precision) {
  if (value == null) {
    return value;
  }

  const nearest = Math.round(value / precision) * precision;
  return Number(nearest.toFixed(getDecimalPrecision(precision)));
}

function RatingItem(props) {
  const {
    disabled,
    emptyIcon,
    focusVisible,
    getLabelText,
    highlightSelectedOnly,
    icon,
    isActive,
    itemValue,
    labelProps,
    name,
    onBlur,
    onChange,
    onClick,
    onFocus,
    readOnly,
    ratingValue,
    ratingValueRounded,
  } = props;

  const isFilled = highlightSelectedOnly ? itemValue === ratingValue : itemValue <= ratingValue;
  const isChecked = itemValue === ratingValueRounded;

  const id = `${name}-${useId()}`;

  const iconStyle = {
    display: 'flex',
    pointerEvents: 'none',
    ...(isActive && { transform: 'scale(1.2)' }),
    ...(!isFilled && { color: 'rgba(0,0,0,0.38)' }),
    ...(focusVisible && isActive && { outline: '1px solid #999' }),
  };

  const container = (
    <span style={iconStyle}>
      {emptyIcon && !isFilled ? emptyIcon : icon}
    </span>
  );

  if (readOnly) {
    return <span {...labelProps}>{container}</span>;
  }

  return (
    <React.Fragment>
      <label style={{ cursor: 'inherit', ...labelProps?.style }} htmlFor={id}>
        {container}
        <span style={visuallyHiddenStyle}>{getLabelText(itemValue)}</span>
      </label>
      <input
        style={visuallyHiddenStyle}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        onClick={onClick}
        disabled={disabled}
        value={itemValue}
        id={id}
        type="radio"
        name={name}
        checked={isChecked}
      />
    </React.Fragment>
  );
}

const defaultIcon = <Star fontSize="inherit" />;
const defaultEmptyIcon = <StarBorder fontSize="inherit" />;

function defaultLabelText(value) {
  return `${value || '0'} Star${value !== 1 ? 's' : ''}`;
}

function Rating(props) {
  const {
    defaultValue = null,
    disabled = false,
    emptyIcon = defaultEmptyIcon,
    emptyLabelText = 'Empty',
    getLabelText = defaultLabelText,
    highlightSelectedOnly = false,
    icon = defaultIcon,
    max = 5,
    name: nameProp,
    onChange,
    onChangeActive,
    onMouseLeave,
    onMouseMove,
    precision = 1,
    readOnly = false,
    size = 'medium',
    value: valueProp,
    ...other
  } = props;

  const name = useId(nameProp);

  const [valueDerived, setValueState] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: 'Rating',
  });

  const valueRounded = roundValueToPrecision(valueDerived, precision);
  const [{ hover, focus }, setState] = React.useState({
    hover: -1,
    focus: -1,
  });

  let value = valueRounded;
  if (hover !== -1) {
    value = hover;
  }
  if (focus !== -1) {
    value = focus;
  }

  const [focusVisible, setFocusVisible] = React.useState(false);
  const [emptyValueFocused, setEmptyValueFocused] = React.useState(false);
  const rootRef = React.useRef();

  const handleMouseMove = (event) => {
    if (onMouseMove) {
      onMouseMove(event);
    }

    const rootNode = rootRef.current;
    const { left, width: containerWidth } = rootNode.getBoundingClientRect();

    const percent = (event.clientX - left) / containerWidth;
    let newHover = roundValueToPrecision(max * percent + precision / 2, precision);
    newHover = clamp(newHover, precision, max);

    setState((prev) =>
      prev.hover === newHover && prev.focus === newHover
        ? prev
        : { hover: newHover, focus: newHover },
    );

    setFocusVisible(false);

    if (onChangeActive && hover !== newHover) {
      onChangeActive(event, newHover);
    }
  };

  const handleMouseLeave = (event) => {
    if (onMouseLeave) {
      onMouseLeave(event);
    }

    const newHover = -1;
    setState({ hover: newHover, focus: newHover });

    if (onChangeActive && hover !== newHover) {
      onChangeActive(event, newHover);
    }
  };

  const handleChange = (event) => {
    let newValue = event.target.value === '' ? null : parseFloat(event.target.value);

    // Give mouse priority over keyboard
    // Fix https://github.com/mui/material-ui/issues/22827
    if (hover !== -1) {
      newValue = hover;
    }

    setValueState(newValue);

    if (onChange) {
      onChange(event, newValue);
    }
  };

  const handleClear = (event) => {
    // Ignore keyboard events
    // https://github.com/facebook/react/issues/7407
    if (event.clientX === 0 && event.clientY === 0) {
      return;
    }

    setState({ hover: -1, focus: -1 });
    setValueState(null);

    if (onChange && parseFloat(event.target.value) === valueRounded) {
      onChange(event, null);
    }
  };

  const handleFocus = (event) => {
    if (isFocusVisible(event.target)) {
      setFocusVisible(true);
    }

    const newFocus = parseFloat(event.target.value);
    setState((prev) => ({ hover: prev.hover, focus: newFocus }));
  };

  const handleBlur = (event) => {
    if (hover !== -1) {
      return;
    }

    if (!isFocusVisible(event.target)) {
      setFocusVisible(false);
    }

    setState((prev) => ({ hover: prev.hover, focus: -1 }));
  };

  const rootStyle = {
    display: 'inline-flex',
    position: 'relative',
    fontSize: size === 'small' ? '18px' : size === 'large' ? '30px' : '24px',
    color: '#faaf00',
    cursor: disabled ? 'default' : 'pointer',
    textAlign: 'left',
    width: 'min-content',
    WebkitTapHighlightColor: 'transparent',
    ...(disabled && { opacity: 0.38, pointerEvents: 'none' }),
    ...(readOnly && { pointerEvents: 'none' }),
  };

  const ratingItemProps = {
    disabled,
    emptyIcon,
    focusVisible,
    getLabelText,
    highlightSelectedOnly,
    icon,
    name,
    onBlur: handleBlur,
    onChange: handleChange,
    onClick: handleClear,
    onFocus: handleFocus,
    ratingValue: value,
    ratingValueRounded: valueRounded,
    readOnly,
  };

  return (
    <span
      ref={rootRef}
      role={readOnly ? 'img' : null}
      aria-label={readOnly ? getLabelText(value) : null}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={rootStyle}
      {...other}
    >
      {Array.from(new Array(max)).map((_, index) => {
        const itemValue = index + 1;
        const isActive = itemValue === Math.ceil(value) && (hover !== -1 || focus !== -1);

        if (precision < 1) {
          const items = Array.from(new Array(1 / precision));
          return (
            <span
              key={itemValue}
              style={{
                position: 'relative',
                ...(isActive && { transform: 'scale(1.2)' }),
              }}
            >
              {items.map(($, indexDecimal) => {
                const itemDecimalValue = roundValueToPrecision(
                  itemValue - 1 + (indexDecimal + 1) * precision,
                  precision,
                );

                return (
                  <RatingItem
                    key={itemDecimalValue}
                    {...ratingItemProps}
                    // The icon is already displayed as active
                    isActive={false}
                    itemValue={itemDecimalValue}
                    labelProps={{
                      style:
                        items.length - 1 === indexDecimal
                          ? {}
                          : {
                              width:
                                itemDecimalValue === value
                                  ? `${(indexDecimal + 1) * precision * 100}%`
                                  : '0%',
                              overflow: 'hidden',
                              position: 'absolute',
                            },
                    }}
                  />
                );
              })}
            </span>
          );
        }

        return (
          <RatingItem
            key={itemValue}
            {...ratingItemProps}
            isActive={isActive}
            itemValue={itemValue}
          />
        );
      })}
      {!readOnly && !disabled && (
        <label
          style={{
            cursor: 'inherit',
            ...(emptyValueFocused && {
              top: 0,
              bottom: 0,
              position: 'absolute',
              outline: '1px solid #999',
              width: '100%',
            }),
          }}
        >
          <input
            style={visuallyHiddenStyle}
            value=""
            id={`${name}-empty`}
            type="radio"
            name={name}
            checked={valueRounded == null}
            onFocus={() => setEmptyValueFocused(true)}
            onBlur={() => setEmptyValueFocused(false)}
            onChange={handleChange}
          />
          <span style={visuallyHiddenStyle}>{emptyLabelText}</span>
        </label>
      )}
    </span>
  );
}

export default Rating;
