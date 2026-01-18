'use client';
import * as React from 'react';

/**
 * @ignore - internal component.
 */
export default function NotchedOutline(props) {
  const { label, notched, style, ...other } = props;
  const withLabel = label != null && label !== '';

  const fieldsetStyle = {
    textAlign: 'left',
    position: 'absolute',
    bottom: 0,
    right: 0,
    top: -5,
    left: 0,
    margin: 0,
    padding: '0 8px',
    pointerEvents: 'none',
    borderRadius: 'inherit',
    borderStyle: 'solid',
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: '0%',
    ...style,
  };

  const legendStyle = {
    float: 'unset',
    width: 'auto',
    overflow: 'hidden',
    display: withLabel ? 'block' : undefined,
    padding: 0,
    height: withLabel ? 11 : undefined,
    lineHeight: withLabel ? undefined : '11px',
    fontSize: withLabel ? '0.75em' : undefined,
    visibility: withLabel ? 'hidden' : undefined,
    maxWidth: withLabel ? (notched ? '100%' : 0.01) : undefined,
    transition: withLabel
      ? notched
        ? 'max-width 100ms cubic-bezier(0.4, 0, 0.2, 1) 50ms'
        : 'max-width 50ms cubic-bezier(0.4, 0, 0.2, 1)'
      : 'width 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    whiteSpace: withLabel ? 'nowrap' : undefined,
  };

  const legendSpanStyle = withLabel
    ? {
        paddingLeft: 5,
        paddingRight: 5,
        display: 'inline-block',
        opacity: 0,
        visibility: 'visible',
      }
    : undefined;

  return (
    <fieldset aria-hidden style={fieldsetStyle} {...other}>
      <legend style={legendStyle}>
        {withLabel ? (
          <span style={legendSpanStyle}>{label}</span>
        ) : (
          <span className="notranslate" aria-hidden>
            &#8203;
          </span>
        )}
      </legend>
    </fieldset>
  );
}
