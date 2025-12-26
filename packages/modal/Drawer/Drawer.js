'use client';
import * as React from 'react';
import Modal from '../Modal';
import Paper from '@mui/material/Paper';

const Drawer = React.forwardRef(function Drawer(inProps, ref) {
  const {
    children,
    className,
    onClose,
    open = false,
    ...other
  } = inProps;

  return (
    <Modal
      ref={ref}
      className={className}
      open={open}
      onClose={onClose}
      style={{ zIndex: 1200 }}
      {...other}
    >
      <Paper
        elevation={16}
        square
        role="dialog"
        aria-modal="true"
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flex: '1 0 auto',
          zIndex: 1200,
          WebkitOverflowScrolling: 'touch',
          position: 'fixed',
          top: 0,
          left: 0,
          outline: 0,
        }}
      >
        {children}
      </Paper>
    </Modal>
  );
});

export default Drawer;
