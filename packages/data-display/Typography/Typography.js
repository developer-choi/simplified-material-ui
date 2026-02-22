'use client';
import * as React from 'react';

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

const Typography = React.forwardRef(function Typography(props, ref) {
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

  const Component = component || variantMapping[variant] || defaultVariantMapping[variant] || 'span';

  return (
    <Component
      ref={ref}
      className={className}
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

export default Typography;
