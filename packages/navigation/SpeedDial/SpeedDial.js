'use client';
import * as React from 'react';
import Zoom from '../../utils/Zoom';
import Fab from '../../form/Fab';

const SpeedDial = React.forwardRef(function SpeedDial(props, ref) {
  const {
    ariaLabel,
    children: childrenProp,
    className,
    hidden = false,
    icon,
    onClose,
    onOpen,
    ...other
  } = props;

  const [open, setOpenState] = React.useState(false);

  const timerRef = React.useRef();
  const fabRef = React.useRef(null);

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpenState(false);
      fabRef.current?.focus();

      if (onClose) {
        onClose(event, 'escapeKeyDown');
      }
    }
  };

  const handleClose = (event) => {
    clearTimeout(timerRef.current);
    if (event.type === 'blur') {
      timerRef.current = setTimeout(() => {
        setOpenState(false);
        if (onClose) {
          onClose(event, 'blur');
        }
      }, 0);
    } else {
      setOpenState(false);
      if (onClose) {
        onClose(event, 'mouseLeave');
      }
    }
  };

  const handleClick = (event) => {
    clearTimeout(timerRef.current);

    if (open) {
      setOpenState(false);
      if (onClose) {
        onClose(event, 'toggle');
      }
    } else {
      setOpenState(true);
      if (onOpen) {
        onOpen(event, 'toggle');
      }
    }
  };

  const handleOpen = (event) => {
    clearTimeout(timerRef.current);

    if (!open) {
      timerRef.current = setTimeout(() => {
        setOpenState(true);
        if (onOpen) {
          const eventMap = {
            focus: 'focus',
            mouseenter: 'mouseEnter',
          };

          onOpen(event, eventMap[event.type]);
        }
      }, 0);
    }
  };

  // Filter the label for valid id characters.
  const id = ariaLabel.replace(/^[^a-z]+|[^\w:.-]+/gi, '');

  const allItems = React.Children.toArray(childrenProp).filter(React.isValidElement);

  const children = allItems.map((child, index) => {
    return React.cloneElement(child, {
      delay: 30 * (open ? index : allItems.length - index),
      open,
      id: `${id}-action-${index}`,
    });
  });

  const rootStyle = {
    zIndex: 1050,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    flexDirection: 'column-reverse',
  };

  const actionsStyle = {
    display: 'flex',
    flexDirection: 'column-reverse',
    marginBottom: -32,
    paddingBottom: 48,
    pointerEvents: open ? 'auto' : 'none',
    transition: open ? undefined : 'top 0s linear 0.2s',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={rootStyle}
      role="presentation"
      onKeyDown={handleKeyDown}
      onBlur={handleClose}
      onFocus={handleOpen}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      {...other}
    >
      <Zoom in={!hidden} timeout={{ enter: 225, exit: 195 }} unmountOnExit>
        <Fab
          color="primary"
          aria-label={ariaLabel}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={`${id}-actions`}
          onClick={handleClick}
          ref={fabRef}
          style={{ pointerEvents: 'auto' }}
        >
          {React.isValidElement(icon)
            ? React.cloneElement(icon, { open })
            : icon}
        </Fab>
      </Zoom>
      <div id={`${id}-actions`} role="menu" style={actionsStyle}>
        {children}
      </div>
    </div>
  );
});

export default SpeedDial;
