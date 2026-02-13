'use client';
import * as React from 'react';
import clsx from 'clsx';
import getValidReactChildren from '@mui/utils/getValidReactChildren';
import ButtonGroupContext from './ButtonGroupContext';
import ButtonGroupButtonContext from './ButtonGroupButtonContext';

const ButtonGroup = React.forwardRef(function ButtonGroup(props, ref) {
  const {
    children,
    className,
    ...other
  } = props;
  const variant = 'outlined';
  const orientation = 'horizontal';
  const color = 'primary';
  const size = 'medium';

  const classes = {
    root: 'MuiButtonGroup-root',
    grouped: 'MuiButtonGroup-grouped',
    firstButton: 'MuiButtonGroup-firstButton',
    lastButton: 'MuiButtonGroup-lastButton',
    middleButton: 'MuiButtonGroup-middleButton',
  };

  const context = React.useMemo(
    () => ({
      className: classes.grouped,
      color,
      size,
      variant,
    }),
    [
      color,
      size,
      variant,
      classes.grouped,
    ],
  );

  const validChildren = getValidReactChildren(children);
  const childrenCount = validChildren.length;

  const getButtonPositionClassName = (index) => {
    const isFirstButton = index === 0;
    const isLastButton = index === childrenCount - 1;

    if (isFirstButton && isLastButton) {
      return '';
    }
    if (isFirstButton) {
      return classes.firstButton;
    }
    if (isLastButton) {
      return classes.lastButton;
    }
    return classes.middleButton;
  };

  const rootStyle = {
    display: 'inline-flex',
    borderRadius: 4,
  };

  return (
    <div
      role="group"
      className={clsx(classes.root, className)}
      ref={ref}
      style={rootStyle}
      {...other}
    >
      <ButtonGroupContext.Provider value={context}>
        {validChildren.map((child, index) => {
          return (
            <ButtonGroupButtonContext.Provider
              key={index}
              value={getButtonPositionClassName(index)}
            >
              {child}
            </ButtonGroupButtonContext.Provider>
          );
        })}
      </ButtonGroupContext.Provider>
    </div>
  );
});

export default ButtonGroup;
