import * as React from 'react';
import List from './index';

// custom host
// https://github.com/mui/material-ui/issues/13746
{
  <List component="div" />;
  <List
    component="div"
    onChange={(event: React.FormEvent<HTMLDivElement>) => {
      event.currentTarget;
    }}
  />;
}
