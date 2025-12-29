'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import unsupportedProp from '../utils/unsupportedProp';
import bottomNavigationActionClasses, {
  getBottomNavigationActionUtilityClass,
} from './bottomNavigationActionClasses';

const BottomNavigationAction = React.forwardRef(function BottomNavigationAction(
  {
    className,
    icon,
    label,
    onChange,
    onClick,
    // eslint-disable-next-line react/prop-types -- private, always overridden by BottomNavigation
    selected,
    showLabel,
    value,
    ...other
  },
  ref,
) {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event, value);
    }

    if (onClick) {
      onClick(event);
    }
  };

  const rootClasses = clsx(
    getBottomNavigationActionUtilityClass('root'),
    !showLabel && !selected && getBottomNavigationActionUtilityClass('iconOnly'),
    selected && getBottomNavigationActionUtilityClass('selected'),
    className,
  );

  const labelClasses = clsx(
    getBottomNavigationActionUtilityClass('label'),
    !showLabel && !selected && getBottomNavigationActionUtilityClass('iconOnly'),
    selected && getBottomNavigationActionUtilityClass('selected'),
  );

  // Determine padding based on showLabel and selected states
  const paddingTop = !showLabel && !selected ? (!label ? 0 : 14) : 6;

  return (
    <button
      ref={ref}
      className={rootClasses}
      onClick={handleChange}
      style={{
        padding: `${paddingTop}px 12px 8px`,
        minWidth: 80,
        maxWidth: 168,
        color: selected ? '#1976d2' : 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        alignItems: 'center',
      }}
      {...other}
    >
      {icon}
      <span
        className={labelClasses}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: selected ? 14 : 12,
          opacity: showLabel || selected ? 1 : 0,
        }}
      >
        {label}
      </span>
    </button>
  );
});

BottomNavigationAction.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * This prop isn't supported.
   * Use the `component` prop if you need to change the children structure.
   */
  children: unsupportedProp,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The icon to display.
   */
  icon: PropTypes.node,
  /**
   * The label element.
   */
  label: PropTypes.node,
  /**
   * @ignore
   */
  onChange: PropTypes.func,
  /**
   * @ignore
   */
  onClick: PropTypes.func,
  /**
   * If `true`, the `BottomNavigationAction` will show its label.
   * By default, only the selected `BottomNavigationAction`
   * inside `BottomNavigation` will show its label.
   *
   * The prop defaults to the value (`false`) inherited from the parent BottomNavigation component.
   */
  showLabel: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * You can provide your own value. Otherwise, we fallback to the child position index.
   */
  value: PropTypes.any,
};

export default BottomNavigationAction;
