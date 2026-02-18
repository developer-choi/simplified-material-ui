'use client';
import * as React from 'react';
import clamp from '@mui/utils/clamp';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { useRtl } from '@mui/system/RtlProvider';
import isFocusVisible from '@mui/utils/isFocusVisible';
import { useForkRef, useControlled, unstable_useId as useId } from '../utils';
import Star from '../internal/svg-icons/Star';
import StarBorder from '../internal/svg-icons/StarBorder';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import slotShouldForwardProp from '../styles/slotShouldForwardProp';
import ratingClasses from './ratingClasses';


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


const RatingRoot = styled('span', {
  name: 'MuiRating',
  slot: 'Root',
})(
  memoTheme(({ theme }) => ({
    display: 'inline-flex',
    // Required to position the pristine input absolutely
    position: 'relative',
    fontSize: theme.typography.pxToRem(24),
    color: '#faaf00',
    cursor: 'pointer',
    textAlign: 'left',
    width: 'min-content',
    WebkitTapHighlightColor: 'transparent',
    [`&.${ratingClasses.disabled}`]: {
      opacity: (theme.vars || theme).palette.action.disabledOpacity,
      pointerEvents: 'none',
    },
    [`&.${ratingClasses.focusVisible} .${ratingClasses.iconActive}`]: {
      outline: '1px solid #999',
    },
    [`& .${ratingClasses.visuallyHidden}`]: visuallyHidden,
    variants: [
      {
        props: {
          size: 'small',
        },
        style: {
          fontSize: theme.typography.pxToRem(18),
        },
      },
      {
        props: {
          size: 'large',
        },
        style: {
          fontSize: theme.typography.pxToRem(30),
        },
      },
      {
        // TODO v6: use the .Mui-readOnly global state class
        props: ({ ownerState }) => ownerState.readOnly,
        style: {
          pointerEvents: 'none',
        },
      },
    ],
  })),
);

const RatingLabel = styled('label', {
  name: 'MuiRating',
  slot: 'Label',
  overridesResolver: ({ ownerState }, styles) => [
    styles.label,
    ownerState.emptyValueFocused && styles.labelEmptyValueActive,
  ],
})({
  cursor: 'inherit',
  variants: [
    {
      props: ({ ownerState }) => ownerState.emptyValueFocused,
      style: {
        top: 0,
        bottom: 0,
        position: 'absolute',
        outline: '1px solid #999',
        width: '100%',
      },
    },
  ],
});

const RatingIcon = styled('span', {
  name: 'MuiRating',
  slot: 'Icon',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.icon,
      ownerState.iconEmpty && styles.iconEmpty,
      ownerState.iconFilled && styles.iconFilled,
      ownerState.iconHover && styles.iconHover,
      ownerState.iconFocus && styles.iconFocus,
      ownerState.iconActive && styles.iconActive,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    // Fit wrapper to actual icon size.
    display: 'flex',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    // Fix mouseLeave issue.
    // https://github.com/facebook/react/issues/4492
    pointerEvents: 'none',
    variants: [
      {
        props: ({ ownerState }) => ownerState.iconActive,
        style: {
          transform: 'scale(1.2)',
        },
      },
      {
        props: ({ ownerState }) => ownerState.iconEmpty,
        style: {
          color: (theme.vars || theme).palette.action.disabled,
        },
      },
    ],
  })),
);

const RatingDecimal = styled('span', {
  name: 'MuiRating',
  slot: 'Decimal',
  shouldForwardProp: (prop) => slotShouldForwardProp(prop) && prop !== 'iconActive',
  overridesResolver: (props, styles) => {
    const { iconActive } = props;

    return [styles.decimal, iconActive && styles.iconActive];
  },
})({
  position: 'relative',
  variants: [
    {
      props: ({ iconActive }) => iconActive,
      style: {
        transform: 'scale(1.2)',
      },
    },
  ],
});


function RatingItem(props) {
  const {
    disabled,
    emptyIcon,
    focus,
    getLabelText,
    highlightSelectedOnly,
    hover,
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
    ownerState,
    ratingValue,
    ratingValueRounded,
  } = props;

  const isFilled = highlightSelectedOnly ? itemValue === ratingValue : itemValue <= ratingValue;
  const isHovered = itemValue <= hover;
  const isFocused = itemValue <= focus;
  const isChecked = itemValue === ratingValueRounded;

  // "name" ensures unique IDs across different Rating components in React 17,
  // preventing one component from affecting another. React 18's useId already handles this.
  // Update to const id = useId(); when React 17 support is dropped.
  // More details: https://github.com/mui/material-ui/issues/40997
  const id = `${name}-${useId()}`;

  const iconOwnerState = {
    ...ownerState,
    iconEmpty: !isFilled,
    iconFilled: isFilled,
    iconHover: isHovered,
    iconFocus: isFocused,
    iconActive: isActive,
  };

  const container = (
    <RatingIcon ownerState={iconOwnerState} value={itemValue}>
      {emptyIcon && !isFilled ? emptyIcon : icon}
    </RatingIcon>
  );

  if (readOnly) {
    return <span {...labelProps}>{container}</span>;
  }

  return (
    <React.Fragment>
      <RatingLabel ownerState={{ ...ownerState, emptyValueFocused: undefined }} style={labelProps?.style} htmlFor={id}>
        {container}
        <span style={visuallyHidden}>{getLabelText(itemValue)}</span>
      </RatingLabel>
      <input
        style={visuallyHidden}
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

const Rating = React.forwardRef(function Rating(props, ref) {
  const {
    component = 'span',
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
  const isRtl = useRtl();
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

  const rootRef = React.useRef();
  const handleRef = useForkRef(rootRef, ref);

  const handleMouseMove = (event) => {
    if (onMouseMove) {
      onMouseMove(event);
    }

    const rootNode = rootRef.current;
    const { right, left, width: containerWidth } = rootNode.getBoundingClientRect();

    let percent;

    if (isRtl) {
      percent = (right - event.clientX) / containerWidth;
    } else {
      percent = (event.clientX - left) / containerWidth;
    }

    let newHover = roundValueToPrecision(max * percent + precision / 2, precision);
    newHover = clamp(newHover, precision, max);

    setState((prev) =>
      prev.hover === newHover && prev.focus === newHover
        ? prev
        : {
            hover: newHover,
            focus: newHover,
          },
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
    setState({
      hover: newHover,
      focus: newHover,
    });

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

    setState({
      hover: -1,
      focus: -1,
    });

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
    setState((prev) => ({
      hover: prev.hover,
      focus: newFocus,
    }));
  };

  const handleBlur = (event) => {
    if (hover !== -1) {
      return;
    }

    if (!isFocusVisible(event.target)) {
      setFocusVisible(false);
    }

    const newFocus = -1;
    setState((prev) => ({
      hover: prev.hover,
      focus: newFocus,
    }));
  };

  const [emptyValueFocused, setEmptyValueFocused] = React.useState(false);

  const ownerState = {
    ...props,
    component,
    defaultValue,
    disabled,
    emptyIcon,
    emptyLabelText,
    emptyValueFocused,
    focusVisible,
    getLabelText,
    icon,
    max,
    precision,
    readOnly,
    size,
  };

  return (
    <RatingRoot
      ref={handleRef}
      ownerState={ownerState}
      role={readOnly ? 'img' : null}
      aria-label={readOnly ? getLabelText(value) : null}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...other}
    >
      {Array.from(new Array(max)).map((_, index) => {
        const itemValue = index + 1;

        const ratingItemProps = {
          disabled,
          emptyIcon,
          focus,
          getLabelText,
          highlightSelectedOnly,
          hover,
          icon,
          name,
          onBlur: handleBlur,
          onChange: handleChange,
          onClick: handleClear,
          onFocus: handleFocus,
          ratingValue: value,
          ratingValueRounded: valueRounded,
          readOnly,
          ownerState,
        };

        const isActive = itemValue === Math.ceil(value) && (hover !== -1 || focus !== -1);
        if (precision < 1) {
          const items = Array.from(new Array(1 / precision));
          return (
            <RatingDecimal
              key={itemValue}
              ownerState={ownerState}
              iconActive={isActive}
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
            </RatingDecimal>
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
        <RatingLabel ownerState={ownerState}>
          <input
            style={visuallyHidden}
            value=""
            id={`${name}-empty`}
            type="radio"
            name={name}
            checked={valueRounded == null}
            onFocus={() => setEmptyValueFocused(true)}
            onBlur={() => setEmptyValueFocused(false)}
            onChange={handleChange}
          />
          <span style={visuallyHidden}>{emptyLabelText}</span>
        </RatingLabel>
      )}
    </RatingRoot>
  );
});

export default Rating;
