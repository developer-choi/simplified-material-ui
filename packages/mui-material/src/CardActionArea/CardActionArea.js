'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import cardActionAreaClasses, { getCardActionAreaUtilityClass } from './cardActionAreaClasses';
import ButtonBase from '../../../form/ButtonBase';

const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    focusHighlight: ['focusHighlight'],
  };

  return composeClasses(slots, getCardActionAreaUtilityClass, classes);
};

const styles = {
  root: {
    display: 'block',
    textAlign: 'inherit',
    borderRadius: 'inherit',
    width: '100%',
  },
  focusHighlight: {
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 'inherit',
    opacity: 0,
    backgroundColor: 'currentcolor',
    transition: 'opacity 250ms',
  },
};

const CardActionArea = React.forwardRef(function CardActionArea(props, ref) {
  const {
    children,
    className,
    focusVisibleClassName,
    ...other
  } = props;

  const ownerState = props;
  const classes = useUtilityClasses(ownerState);

  return (
    <ButtonBase
      ref={ref}
      className={clsx(classes.root, className)}
      style={styles.root}
      focusVisibleClassName={clsx(focusVisibleClassName, classes.focusVisible)}
      onMouseEnter={(e) => {
        const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
        if (highlight) highlight.style.opacity = '0.04';
      }}
      onMouseLeave={(e) => {
        const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
        if (highlight) highlight.style.opacity = '0';
      }}
      onFocus={(e) => {
        const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
        if (highlight) highlight.style.opacity = '0.12';
      }}
      onBlur={(e) => {
        const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
        if (highlight) highlight.style.opacity = '0';
      }}
      {...other}
    >
      {children}
      <span data-focus-highlight style={styles.focusHighlight} className={classes.focusHighlight} />
    </ButtonBase>
  );
});

CardActionArea.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * @ignore
   */
  focusVisibleClassName: PropTypes.string,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default CardActionArea;
