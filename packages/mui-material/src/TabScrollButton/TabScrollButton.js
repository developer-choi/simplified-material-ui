'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { useDefaultProps } from '../DefaultPropsProvider';
import tabScrollButtonClasses, { getTabScrollButtonUtilityClass } from './tabScrollButtonClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, orientation, disabled } = ownerState;

  const slots = {
    root: ['root', orientation, disabled && 'disabled'],
  };

  return composeClasses(slots, getTabScrollButtonUtilityClass, classes);
};

const KeyboardArrowLeft = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}
  >
    <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
  </svg>
);

const KeyboardArrowRight = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}
  >
    <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
  </svg>
);

const TabScrollButton = React.forwardRef(function TabScrollButton(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiTabScrollButton' });
  const {
    className,
    direction,
    disabled,
    orientation,
    ...other
  } = props;

  const ownerState = { ...props };

  const classes = useUtilityClasses(ownerState);

  const isVertical = orientation === 'vertical';

  return (
    <div
      ref={ref}
      className={[classes.root, className].filter(Boolean).join(' ')}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: isVertical ? '100%' : 40,
        height: isVertical ? 40 : undefined,
        opacity: disabled ? 0 : 0.8,
        cursor: disabled ? 'default' : 'pointer',
        ...other.style,
      }}
      {...other}
    >
      <span style={{ display: 'block', transform: isVertical ? 'rotate(90deg)' : undefined }}>
        {direction === 'left' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </span>
    </div>
  );
});

TabScrollButton.propTypes /* remove-proptypes */ = {
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  direction: PropTypes.oneOf(['left', 'right']).isRequired,
  disabled: PropTypes.bool,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
  style: PropTypes.object,
};

export default TabScrollButton;
