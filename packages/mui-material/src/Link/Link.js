'use client';
import * as React from 'react';
import isFocusVisible from '@mui/utils/isFocusVisible';
import capitalize from '../utils/capitalize';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import Typography from '../Typography';


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
      ],
    };
  }),
);

const Link = React.forwardRef(function Link(props, ref) {
  const {
    underline = 'always',
    ...other
  } = props;

  const [focusVisible, setFocusVisible] = React.useState(false);
  const handleBlur = (event) => {
    if (!isFocusVisible(event.target)) {
      setFocusVisible(false);
    }
  };
  const handleFocus = (event) => {
    if (isFocusVisible(event.target)) {
      setFocusVisible(true);
    }
  };

  const ownerState = {
    ...props,
    focusVisible,
    underline,
  };

  return (
    <LinkRoot
      onBlur={handleBlur}
      onFocus={handleFocus}
      ref={ref}
      ownerState={ownerState}
      {...other}
    />
  );
});

export default Link;
