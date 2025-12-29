'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import ButtonBase from '../ButtonBase';
import unsupportedProp from '../utils/unsupportedProp';
import bottomNavigationActionClasses, {
  getBottomNavigationActionUtilityClass,
} from './bottomNavigationActionClasses';

const BottomNavigationActionRoot = styled(ButtonBase, {
  name: 'MuiBottomNavigationAction',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.root, !ownerState.showLabel && !ownerState.selected && styles.iconOnly];
  },
})(
  memoTheme(({ theme }) => ({
    padding: '0px 12px',
    minWidth: 80,
    maxWidth: 168,
    color: (theme.vars || theme).palette.text.secondary,
    flexDirection: 'column',
    flex: '1',
    [`&.${bottomNavigationActionClasses.selected}`]: {
      color: (theme.vars || theme).palette.primary.main,
    },
    variants: [
      {
        props: ({ showLabel, selected }) => !showLabel && !selected,
        style: {
          paddingTop: 14,
        },
      },
      {
        props: ({ showLabel, selected, label }) => !showLabel && !selected && !label,
        style: {
          paddingTop: 0,
        },
      },
    ],
  })),
);

const BottomNavigationActionLabel = styled('span', {
  name: 'MuiBottomNavigationAction',
  slot: 'Label',
})(
  memoTheme(({ theme }) => ({
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.pxToRem(12),
    opacity: 1,
    [`&.${bottomNavigationActionClasses.selected}`]: {
      fontSize: theme.typography.pxToRem(14),
    },
    variants: [
      {
        props: ({ showLabel, selected }) => !showLabel && !selected,
        style: {
          opacity: 0,
        },
      },
    ],
  })),
);

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
  const ownerState = { selected, showLabel, label };

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

  return (
    <BottomNavigationActionRoot
      ref={ref}
      className={rootClasses}
      focusRipple
      onClick={handleChange}
      ownerState={ownerState}
      {...other}
    >
      {icon}
      <BottomNavigationActionLabel className={labelClasses} ownerState={ownerState}>
        {label}
      </BottomNavigationActionLabel>
    </BottomNavigationActionRoot>
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
