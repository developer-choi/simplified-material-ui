'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '../zero-styled';

const DividerRoot = styled('div', {
  name: 'MuiDivider',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.variant],
      ownerState.orientation === 'vertical' && styles.vertical,
      ownerState.children && styles.withChildren,
      ownerState.children && ownerState.orientation === 'vertical' && styles.withChildrenVertical,
    ];
  },
})({
  margin: 0, // Reset browser default style.
  flexShrink: 0,
  borderWidth: 0,
  borderStyle: 'solid',
  borderColor: 'rgba(0, 0, 0, 0.12)',
  borderBottomWidth: 'thin',
  variants: [
      {
        props: {
          variant: 'inset',
        },
        style: {
          marginLeft: 72,
        },
      },
      {
        props: {
          variant: 'middle',
          orientation: 'horizontal',
        },
        style: {
          marginLeft: '16px',
          marginRight: '16px',
        },
      },
      {
        props: {
          variant: 'middle',
          orientation: 'vertical',
        },
        style: {
          marginTop: '8px',
          marginBottom: '8px',
        },
      },
      {
        props: {
          orientation: 'vertical',
        },
        style: {
          height: '100%',
          borderBottomWidth: 0,
          borderRightWidth: 'thin',
        },
      },
      {
        props: ({ ownerState }) => !!ownerState.children,
        style: {
          display: 'flex',
          textAlign: 'center',
          border: 0,
          borderTopStyle: 'solid',
          borderLeftStyle: 'solid',
          '&::before, &::after': {
            content: '""',
            alignSelf: 'center',
          },
        },
      },
      {
        props: ({ ownerState }) => ownerState.children && ownerState.orientation !== 'vertical',
        style: {
          '&::before, &::after': {
            width: '100%',
            borderTop: 'thin solid rgba(0, 0, 0, 0.12)',
            borderTopStyle: 'inherit',
          },
        },
      },
      {
        props: ({ ownerState }) => ownerState.orientation === 'vertical' && ownerState.children,
        style: {
          flexDirection: 'column',
          '&::before, &::after': {
            height: '100%',
            borderLeft: 'thin solid rgba(0, 0, 0, 0.12)',
            borderLeftStyle: 'inherit',
          },
        },
      },
    ],
  },
);

const DividerWrapper = styled('span', {
  name: 'MuiDivider',
  slot: 'Wrapper',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.wrapper, ownerState.orientation === 'vertical' && styles.wrapperVertical];
  },
})({
  display: 'inline-block',
  paddingLeft: '9.6px', // 8px * 1.2
  paddingRight: '9.6px',
  whiteSpace: 'nowrap',
  variants: [
    {
      props: {
        orientation: 'vertical',
      },
      style: {
        paddingTop: '9.6px',
        paddingBottom: '9.6px',
      },
    },
  ],
});

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

  const ownerState = {
    ...props,
    orientation,
    role,
    variant,
  };

  return (
    <DividerRoot
      as={component}
      className={className}
      role={role}
      ref={ref}
      ownerState={ownerState}
      aria-orientation={
        role === 'separator' && (component !== 'hr' || orientation === 'vertical')
          ? orientation
          : undefined
      }
      {...other}
    >
      {children ? (
        <DividerWrapper ownerState={ownerState}>
          {children}
        </DividerWrapper>
      ) : null}
    </DividerRoot>
  );
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
