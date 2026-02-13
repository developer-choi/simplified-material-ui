'use client';
import composeClasses from '@mui/utils/composeClasses';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';
import capitalize from '../utils/capitalize';
import { getImageListItemBarUtilityClass } from './imageListItemBarClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, position, actionIcon, actionPosition } = ownerState;

  const slots = {
    root: [
      'root',
      `position${capitalize(position)}`,
      `actionPosition${capitalize(actionPosition)}`,
    ],
    titleWrap: [
      'titleWrap',
      `titleWrap${capitalize(position)}`,
      actionIcon && `titleWrapActionPos${capitalize(actionPosition)}`,
    ],
    title: ['title'],
    subtitle: ['subtitle'],
    actionIcon: ['actionIcon', `actionIconActionPos${capitalize(actionPosition)}`],
  };

  return composeClasses(slots, getImageListItemBarUtilityClass, classes);
};

const ImageListItemBar = React.forwardRef(function ImageListItemBar(props, ref) {
  const {
    actionIcon,
    actionPosition = 'right',
    className,
    subtitle,
    title,
    position = 'bottom',
    ...other
  } = props;

  const rootStyle = {
    position: position === 'below' ? 'relative' : 'absolute',
    left: position === 'below' ? undefined : 0,
    right: position === 'below' ? undefined : 0,
    top: position === 'top' ? 0 : undefined,
    bottom: position === 'bottom' ? 0 : undefined,
    background: position === 'below' ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: position === 'below' ? 'normal' : 'center',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  };

  const titleWrapStyle = {
    flexGrow: 1,
    padding: position === 'below' ? '6px 0 12px' : '12px 16px',
    paddingLeft: actionIcon && actionPosition === 'left' ? 0 : undefined,
    paddingRight: actionIcon && actionPosition === 'right' ? 0 : undefined,
    color: position === 'below' ? 'inherit' : '#fff',
    overflow: 'hidden',
  };

  const titleStyle = {
    fontSize: '16px',
    lineHeight: '24px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const subtitleStyle = {
    fontSize: '12px',
    lineHeight: 1,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const actionIconStyle = {
    order: actionPosition === 'left' ? -1 : undefined,
  };

  const ownerState = { ...props, position, actionPosition };

  const classes = useUtilityClasses(ownerState);

  return (
    <div
      ref={ref}
      style={rootStyle}
      className={clsx(classes.root, className)}
      {...other}
    >
      <div style={titleWrapStyle} className={classes.titleWrap}>
        <div style={titleStyle} className={classes.title}>{title}</div>
        {subtitle ? <div style={subtitleStyle} className={classes.subtitle}>{subtitle}</div> : null}
      </div>
      {actionIcon ? <div style={actionIconStyle} className={classes.actionIcon}>{actionIcon}</div> : null}
    </div>
  );
});

ImageListItemBar.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * An IconButton element to be used as secondary action target
   * (primary action target is the item itself).
   */
  actionIcon: PropTypes.node,
  /**
   * Position of secondary action IconButton.
   * @default 'right'
   */
  actionPosition: PropTypes.oneOf(['left', 'right']),
  /**
   * @ignore
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
   * Position of the title bar.
   * @default 'bottom'
   */
  position: PropTypes.oneOf(['below', 'bottom', 'top']),
  /**
   * String or element serving as subtitle (support text).
   */
  subtitle: PropTypes.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * Title to be displayed.
   */
  title: PropTypes.node,
};

export default ImageListItemBar;
