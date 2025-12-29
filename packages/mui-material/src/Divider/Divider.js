'use client';
import * as React from 'react';
import PropTypes from 'prop-types';

const Divider = React.forwardRef(function Divider(props, ref) {
  const {
    children,
    className,
    orientation = 'horizontal',
    variant = 'fullWidth',
    ...other
  } = props;

  const component = children || orientation === 'vertical' ? 'div' : 'hr';
  const role = component !== 'hr' ? 'separator' : undefined;

  // Base styles
  const baseStyle = {
    margin: 0,
    flexShrink: 0,
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.12)',
  };

  // Variant styles
  let variantStyle = {};
  if (variant === 'inset') {
    variantStyle.marginLeft = 72;
  } else if (variant === 'middle' && orientation === 'horizontal') {
    variantStyle.marginLeft = '16px';
    variantStyle.marginRight = '16px';
  } else if (variant === 'middle' && orientation === 'vertical') {
    variantStyle.marginTop = '8px';
    variantStyle.marginBottom = '8px';
  }

  // Orientation styles
  let orientationStyle = {};
  if (orientation === 'vertical') {
    orientationStyle.height = '100%';
    orientationStyle.borderRightWidth = 'thin';
  } else {
    orientationStyle.borderBottomWidth = 'thin';
  }

  // Children styles
  let childrenContainerStyle = {};
  let lineStyle = {};
  if (children) {
    childrenContainerStyle = {
      ...baseStyle,
      ...variantStyle,
      display: 'flex',
      alignItems: 'center',
      textAlign: 'center',
      border: 0,
      ...(orientation === 'vertical' ? { flexDirection: 'column' } : {}),
    };

    lineStyle = {
      flexGrow: 1,
      ...(orientation === 'vertical'
        ? {
            borderLeft: 'thin solid rgba(0, 0, 0, 0.12)',
            borderLeftStyle: 'solid',
          }
        : {
            borderTop: 'thin solid rgba(0, 0, 0, 0.12)',
            borderTopStyle: 'solid',
          }),
    };
  }

  const wrapperStyle = {
    display: 'inline-block',
    paddingLeft: '9.6px',
    paddingRight: '9.6px',
    whiteSpace: 'nowrap',
    ...(orientation === 'vertical'
      ? {
          paddingTop: '9.6px',
          paddingBottom: '9.6px',
        }
      : {}),
  };

  if (children) {
    return React.createElement(
      component,
      {
        ref,
        className,
        role,
        'aria-orientation':
          role === 'separator' && (component !== 'hr' || orientation === 'vertical')
            ? orientation
            : undefined,
        style: childrenContainerStyle,
        ...other,
      },
      <div style={lineStyle} />,
      <span style={wrapperStyle}>{children}</span>,
      <div style={lineStyle} />,
    );
  }

  return React.createElement(component, {
    ref,
    className,
    role,
    'aria-orientation':
      role === 'separator' && (component !== 'hr' || orientation === 'vertical')
        ? orientation
        : undefined,
    style: {
      ...baseStyle,
      ...variantStyle,
      ...orientationStyle,
    },
    ...other,
  });
});

/**
 * The following flag is used to ensure that this component isn't tabbable i.e.
 * does not get highlight/focus inside of MUI List.
 */
if (Divider) {
  Divider.muiSkipListHighlight = true;
}

Divider.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The component orientation.
   * @default 'horizontal'
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  /**
   * @ignore
   */
  role: PropTypes.string,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The variant to use.
   * @default 'fullWidth'
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['fullWidth', 'inset', 'middle']),
    PropTypes.string,
  ]),
};

export default Divider;
