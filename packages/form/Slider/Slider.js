'use client';
import * as React from 'react';
import { useSlider, valueToPercent } from './useSlider';
import SliderValueLabel from './SliderValueLabel';

function Identity(x) {
  return x;
}

function Slider(props) {
  const {
    'aria-label': ariaLabel,
    'aria-valuetext': ariaValuetext,
    'aria-labelledby': ariaLabelledby,
    color = 'primary',
    disableSwap = false,
    disabled = false,
    getAriaLabel,
    getAriaValueText,
    marks: marksProp = false,
    max = 100,
    min = 0,
    name,
    onChange,
    onChangeCommitted,
    orientation = 'horizontal',
    shiftStep = 10,
    size = 'medium',
    step = 1,
    scale = Identity,
    tabIndex,
    track = 'normal',
    value: valueProp,
    valueLabelDisplay = 'off',
    valueLabelFormat = Identity,
    ...other
  } = props;

  const ownerState = {
    ...props,
    max,
    min,
    disabled,
    disableSwap,
    orientation,
    marks: marksProp,
    color,
    size,
    step,
    shiftStep,
    scale,
    track,
    valueLabelDisplay,
    valueLabelFormat,
  };

  const {
    axisProps,
    getRootProps,
    getHiddenInputProps,
    getThumbProps,
    open,
    active,
    axis,
    focusedThumbIndex,
    range,
    dragging,
    marks,
    values,
    trackOffset,
    trackLeap,
    getThumbStyle,
  } = useSlider({ ...ownerState });

  ownerState.marked = marks.length > 0 && marks.some((mark) => mark.label);
  ownerState.dragging = dragging;
  ownerState.focusedThumbIndex = focusedThumbIndex;

  const horizontal = orientation === 'horizontal';
  const small = size === 'small';

  return (
    <span
      {...getRootProps()}
      style={{
        borderRadius: 12,
        boxSizing: 'content-box',
        display: 'inline-block',
        position: 'relative',
        cursor: disabled ? 'default' : 'pointer',
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
        color: '#1976d2',
        ...(horizontal
          ? {
              height: small ? 2 : 4,
              width: '100%',
              padding: '13px 0',
              ...(ownerState.marked && { marginBottom: 20 }),
            }
          : {
              height: '100%',
              width: small ? 2 : 4,
              padding: '0 13px',
              ...(ownerState.marked && { marginRight: 44 }),
            }),
        ...(disabled && { opacity: 0.38, pointerEvents: 'none' }),
      }}
      {...other}
    >
      {/* Rail */}
      <span
        style={{
          display: 'block',
          position: 'absolute',
          borderRadius: 'inherit',
          backgroundColor: 'currentColor',
          opacity: track === 'inverted' ? 1 : 0.38,
          ...(horizontal
            ? { width: '100%', height: 'inherit', top: '50%', transform: 'translateY(-50%)' }
            : { height: '100%', width: 'inherit', left: '50%', transform: 'translateX(-50%)' }),
        }}
      />
      {/* Track */}
      <span
        style={{
          display: track === false ? 'none' : 'block',
          position: 'absolute',
          borderRadius: 'inherit',
          border: small ? 'none' : '1px solid currentColor',
          backgroundColor: 'currentColor',
          ...(horizontal
            ? { height: 'inherit', top: '50%', transform: 'translateY(-50%)' }
            : { width: 'inherit', left: '50%', transform: 'translateX(-50%)' }),
          ...axisProps[axis].offset(trackOffset),
          ...axisProps[axis].leap(trackLeap),
        }}
      />
      {marks
        .filter((mark) => mark.value >= min && mark.value <= max)
        .map((mark, index) => {
          const percent = valueToPercent(mark.value, min, max);
          const markStyle = axisProps[axis].offset(percent);

          let markActive;
          if (track === false) {
            markActive = values.includes(mark.value);
          } else {
            markActive =
              (track === 'normal' &&
                (range
                  ? mark.value >= values[0] && mark.value <= values[values.length - 1]
                  : mark.value <= values[0])) ||
              (track === 'inverted' &&
                (range
                  ? mark.value <= values[0] || mark.value >= values[values.length - 1]
                  : mark.value >= values[0]));
          }

          return (
            <React.Fragment key={index}>
              {/* Mark */}
              <span
                data-index={index}
                style={{
                  position: 'absolute',
                  width: 2,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: markActive ? '#fff' : 'currentColor',
                  opacity: markActive ? 0.8 : 1,
                  ...(horizontal
                    ? { top: '50%', transform: 'translate(-1px, -50%)' }
                    : { left: '50%', transform: 'translate(-50%, 1px)' }),
                  ...markStyle,
                }}
              />
              {mark.label != null ? (
                /* Mark Label */
                <span
                  aria-hidden
                  data-index={index}
                  style={{
                    fontSize: '0.875rem',
                    color: markActive ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.6)',
                    position: 'absolute',
                    whiteSpace: 'nowrap',
                    ...(horizontal
                      ? { top: 30, transform: 'translateX(-50%)' }
                      : { left: 36, transform: 'translateY(50%)' }),
                    ...markStyle,
                  }}
                >
                  {mark.label}
                </span>
              ) : null}
            </React.Fragment>
          );
        })}
      {values.map((value, index) => {
        const percent = valueToPercent(value, min, max);
        const thumbStyle = axisProps[axis].offset(percent);

        const thumbNode = (
          <span
            data-index={index}
            {...getThumbProps()}
            style={{
              position: 'absolute',
              width: small ? 12 : 20,
              height: small ? 12 : 20,
              boxSizing: 'border-box',
              borderRadius: '50%',
              outline: 0,
              backgroundColor: 'currentColor',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...(horizontal
                ? { top: '50%', transform: 'translate(-50%, -50%)' }
                : { left: '50%', transform: 'translate(-50%, 50%)' }),
              ...thumbStyle,
              ...getThumbStyle(index),
            }}
          >
            <input
              data-index={index}
              aria-label={getAriaLabel ? getAriaLabel(index) : ariaLabel}
              aria-valuenow={scale(value)}
              aria-labelledby={ariaLabelledby}
              aria-valuetext={
                getAriaValueText ? getAriaValueText(scale(value), index) : ariaValuetext
              }
              value={values[index]}
              {...getHiddenInputProps()}
            />
          </span>
        );

        return valueLabelDisplay !== 'off' ? (
          <SliderValueLabel
            key={index}
            valueLabelFormat={valueLabelFormat}
            valueLabelDisplay={valueLabelDisplay}
            value={
              typeof valueLabelFormat === 'function'
                ? valueLabelFormat(scale(value), index)
                : valueLabelFormat
            }
            index={index}
            open={open === index || active === index || valueLabelDisplay === 'on'}
            disabled={disabled}
          >
            {thumbNode}
          </SliderValueLabel>
        ) : React.cloneElement(thumbNode, { key: index });
      })}
    </span>
  );
}

export default Slider;
