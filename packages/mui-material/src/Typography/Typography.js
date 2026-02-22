'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { useDefaultProps } from '../DefaultPropsProvider';
import { getTypographyUtilityClass } from './typographyClasses';

const useUtilityClasses = (ownerState) => {
  const { align, gutterBottom, noWrap, variant, classes } = ownerState;

  const slots = {
    root: ['root', variant],
  };

  return composeClasses(slots, getTypographyUtilityClass, classes);
};

const defaultVariantMapping = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'h6',
  subtitle2: 'h6',
  body1: 'p',
  body2: 'p',
  inherit: 'p',
};

const typographyStyles = {
  h1:        { fontSize: '6rem',     fontWeight: 300, lineHeight: 1.167, letterSpacing: '-0.01562em' },
  h2:        { fontSize: '3.75rem',  fontWeight: 300, lineHeight: 1.2,   letterSpacing: '-0.00833em' },
  h3:        { fontSize: '3rem',     fontWeight: 400, lineHeight: 1.167, letterSpacing: '0em' },
  h4:        { fontSize: '2.125rem', fontWeight: 400, lineHeight: 1.235, letterSpacing: '0.00735em' },
  h5:        { fontSize: '1.5rem',   fontWeight: 400, lineHeight: 1.334, letterSpacing: '0em' },
  h6:        { fontSize: '1.25rem',  fontWeight: 500, lineHeight: 1.6,   letterSpacing: '0.0075em' },
  subtitle1: { fontSize: '1rem',     fontWeight: 400, lineHeight: 1.75,  letterSpacing: '0.00938em' },
  subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57,  letterSpacing: '0.00714em' },
  body1:     { fontSize: '1rem',     fontWeight: 400, lineHeight: 1.5,   letterSpacing: '0.00938em' },
  body2:     { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43,  letterSpacing: '0.01071em' },
  button:    { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.75,  letterSpacing: '0.02857em', textTransform: 'uppercase' },
  caption:   { fontSize: '0.75rem',  fontWeight: 400, lineHeight: 1.66,  letterSpacing: '0.03333em' },
  overline:  { fontSize: '0.75rem',  fontWeight: 400, lineHeight: 2.66,  letterSpacing: '0.08333em', textTransform: 'uppercase' },
  inherit:   { font: 'inherit', lineHeight: 'inherit', letterSpacing: 'inherit' },
};

const Typography = React.forwardRef(function Typography(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiTypography' });

  const {
    align = 'inherit',
    children,
    className,
    component,
    gutterBottom = false,
    noWrap = false,
    variant = 'body1',
    variantMapping = defaultVariantMapping,
    style,
    ...other
  } = props;

  const ownerState = {
    ...props,
    align,
    gutterBottom,
    noWrap,
    variant,
    variantMapping,
  };

  const Component = component || variantMapping[variant] || defaultVariantMapping[variant] || 'span';

  const classes = useUtilityClasses(ownerState);

  return (
    <Component
      ref={ref}
      className={clsx(classes.root, className)}
      style={{
        margin: 0,
        ...typographyStyles[variant],
        ...(align !== 'inherit' && { textAlign: align }),
        ...(noWrap && { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
        ...(gutterBottom && { marginBottom: '0.35em' }),
        ...style,
      }}
      {...other}
    >
      {children}
    </Component>
  );
});

Typography.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Set the text-align on the component.
   * @default 'inherit'
   */
  align: PropTypes.oneOf(['center', 'inherit', 'justify', 'left', 'right']),
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The component used for the root node.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, the text will have a bottom margin.
   * @default false
   */
  gutterBottom: PropTypes.bool,
  /**
   * If `true`, the text will not wrap, but instead will truncate with a text overflow ellipsis.
   * @default false
   */
  noWrap: PropTypes.bool,
  /**
   * @ignore
   */
  style: PropTypes.object,
  /**
   * Applies the theme typography styles.
   * @default 'body1'
   */
  variant: PropTypes.oneOf([
    'body1', 'body2', 'button', 'caption',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'inherit', 'overline', 'subtitle1', 'subtitle2',
  ]),
  /**
   * The component maps the variant prop to a range of different HTML element types.
   */
  variantMapping: PropTypes.object,
};

export default Typography;
