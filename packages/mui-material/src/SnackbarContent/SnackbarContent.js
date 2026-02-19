'use client';
import * as React from 'react';
import clsx from 'clsx';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import Paper from '../../../surfaces/Paper';

const SnackbarContentRoot = styled(Paper, {
  name: 'MuiSnackbarContent',
  slot: 'Root',
})(
  memoTheme(({ theme }) => {
    const emphasis = theme.palette.mode === 'light' ? 0.8 : 0.98;

    return {
      ...theme.typography.body2,
      color: theme.vars
        ? theme.vars.palette.SnackbarContent.color
        : theme.palette.getContrastText(emphasize(theme.palette.background.default, emphasis)),
      backgroundColor: theme.vars
        ? theme.vars.palette.SnackbarContent.bg
        : emphasize(theme.palette.background.default, emphasis),
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      padding: '6px 16px',
      flexGrow: 1,
      [theme.breakpoints.up('sm')]: {
        flexGrow: 'initial',
        minWidth: 288,
      },
    };
  }),
);

const SnackbarContentMessage = styled('div', {
  name: 'MuiSnackbarContent',
  slot: 'Message',
})({
  padding: '8px 0',
});

const SnackbarContentAction = styled('div', {
  name: 'MuiSnackbarContent',
  slot: 'Action',
})({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 'auto',
  paddingLeft: 16,
  marginRight: -8,
});

function SnackbarContent({ action, className, message, role = 'alert', ...other }) {
  return (
    <SnackbarContentRoot
      role={role}
      elevation={6}
      className={clsx(className)}
      {...other}
    >
      <SnackbarContentMessage>
        {message}
      </SnackbarContentMessage>
      {action ? (
        <SnackbarContentAction>
          {action}
        </SnackbarContentAction>
      ) : null}
    </SnackbarContentRoot>
  );
}

export default SnackbarContent;
