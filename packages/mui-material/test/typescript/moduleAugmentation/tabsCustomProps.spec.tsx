import * as React from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '../../../../navigation/Tabs';
import { createTheme } from '@mui/material/styles';

declare module '../../../../navigation/Tabs' {
  interface TabsPropsIndicatorColorOverrides {
    success: true;
  }
}

// theme typings should work as expected
const theme = createTheme({
  components: {
    MuiTabs: {
      variants: [
        {
          props: { indicatorColor: 'success' },
          style: {
            backgroundColor: '#e70000',
          },
        },
      ],
    },
  },
});

<Tabs indicatorColor="success">
  <Tab label="Item One" />
  <Tab label="Item Two" />
</Tabs>;

// @ts-expect-error unknown indicatorColor
<Tabs indicatorColor="error">
  <Tab label="Item One" />
  <Tab label="Item Two" />
</Tabs>;
