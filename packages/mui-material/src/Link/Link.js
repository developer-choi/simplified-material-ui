'use client';
import * as React from 'react';
import isFocusVisible from '@mui/utils/isFocusVisible';
import capitalize from '../utils/capitalize';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import Typography from '../Typography';
import linkClasses from './linkClasses';


const LinkRoot = styled(Typography, {
  name: 'MuiLink',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[`underline${capitalize(ownerState.underline)}`],
      ownerState.component === 'button' && styles.button,
    ];
  },
})(
  memoTheme(({ theme }) => {
    return {
      variants: [
        {
          props: {
            underline: 'none',
          },
          style: {
            textDecoration: 'none',
          },
        },
        {
          props: {
            underline: 'hover',
          },
          style: {
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        },
        {
          props: {
            underline: 'always',
          },
          style: {
            textDecoration: 'underline',
            '&:hover': {
              textDecorationColor: 'inherit',
            },
          },
        },
        {
          props: {
            component: 'button',
          },
          style: {
            position: 'relative',
            WebkitTapHighlightColor: 'transparent',
            backgroundColor: 'transparent', // Reset default value
            // We disable the focus ring for mouse, touch and keyboard users.
            outline: 0,
            border: 0,
            margin: 0, // Remove the margin in Safari
            borderRadius: 0,
            padding: 0, // Remove the padding in Firefox
            cursor: 'pointer',
            userSelect: 'none',
            verticalAlign: 'middle',
            MozAppearance: 'none', // Reset
            WebkitAppearance: 'none', // Reset
            '&::-moz-focus-inner': {
              borderStyle: 'none', // Remove Firefox dotted outline.
            },
            [`&.${linkClasses.focusVisible}`]: {
              outline: 'auto',
            },
          },
        },
      ],
    };
  }),
);

const Link = React.forwardRef(function Link(props, ref) {
  const {
    component = 'a',
    onBlur,
    onFocus,
    underline = 'always',
    variant = 'inherit',
    sx,
    ...other
  } = props;

  const [focusVisible, setFocusVisible] = React.useState(false);
  const handleBlur = (event) => {
    if (!isFocusVisible(event.target)) {
      setFocusVisible(false);
    }
    if (onBlur) {
      onBlur(event);
    }
  };
  const handleFocus = (event) => {
    if (isFocusVisible(event.target)) {
      setFocusVisible(true);
    }
    if (onFocus) {
      onFocus(event);
    }
  };

  const ownerState = {
    ...props,
    component,
    focusVisible,
    underline,
    variant,
  };

  return (
    <LinkRoot
      component={component}
      onBlur={handleBlur}
      onFocus={handleFocus}
      ref={ref}
      ownerState={ownerState}
      variant={variant}
      {...other}
      sx={Array.isArray(sx) ? sx : [sx]}
    />
  );
});

export default Link;
