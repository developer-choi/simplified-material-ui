'use client';
import * as React from 'react';
import MenuList from '../MenuList';
import Popover from '../Popover';

const Menu = React.forwardRef(function Menu(props, ref) {
  const {
    children,
    className,
    onClose,
    open,
    ...other
  } = props;

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();

      if (onClose) {
        onClose(event, 'tabKeyDown');
      }
    }
  };

  return (
    <Popover
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        style: {
          maxHeight: 'calc(100% - 96px)',
          WebkitOverflowScrolling: 'touch',
        },
      }}
      open={open}
      ref={ref}
      className={className}
      {...other}
    >
      <MenuList
        autoFocus
        onKeyDown={handleListKeyDown}
        style={{ outline: 0 }}
      >
        {children}
      </MenuList>
    </Popover>
  );
});

export default Menu;
