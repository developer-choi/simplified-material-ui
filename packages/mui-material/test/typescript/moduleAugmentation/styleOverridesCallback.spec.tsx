import * as React from 'react';
import Chip from '../../../../data-display/Chip';
import { createTheme } from '@mui/material/styles';

// Update the Chip's extendable props options
declare module '../../../../data-display/Chip' {
  interface ChipPropsVariantOverrides {
    dashed: true;
    outlined: false;
  }
  interface ChipPropsColorOverrides {
    success: true;
  }
  interface ChipPropsSizeOverrides {
    extraLarge: true;
  }
}

// theme typings should work as expected
const finalTheme = createTheme({
  components: {
    MuiChip: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.variant &&
            {
              dashed: {
                border: '1px dashed',
              },
              filled: {
                backgroundColor: ownerState.color === 'success' ? 'lime' : theme.palette.grey[100],
              },
            }[ownerState.variant]),
        }),
        label: ({ ownerState }) => [
          ownerState.color === 'success' && {
            color: 'lime',
          },
        ],
      },
    },
  },
});

<Chip variant="dashed" color="success" size="extraLarge" label="Content" />;

// @ts-expect-error The contained variant was disabled
<Chip variant="outlined" color="primary" label="Content" />;
