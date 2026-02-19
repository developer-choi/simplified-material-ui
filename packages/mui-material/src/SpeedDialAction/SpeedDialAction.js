'use client';
// @inheritedComponent Tooltip
import * as React from 'react';
import PropTypes from 'prop-types';
import Fab from '../../../form/Fab';
import Tooltip from '../../../data-display/Tooltip';

const SpeedDialAction = React.forwardRef(function SpeedDialAction(props, ref) {
  const {
    className,
    delay = 0,
    icon,
    id,
    open,
    tooltipTitle,
    ...other
  } = props;

  const fabStyle = {
    margin: 8,
    color: 'rgba(0, 0, 0, 0.6)',
    backgroundColor: '#fff',
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s',
    transitionDelay: `${delay}ms`,
    opacity: open ? 1 : 0,
    transform: open ? 'scale(1)' : 'scale(0)',
  };

  return (
    <Tooltip
      id={id}
      ref={ref}
      title={tooltipTitle}
      placement="left"
      {...other}
    >
      <Fab
        className={className}
        style={fabStyle}
        tabIndex={-1}
        role="menuitem"
        size="small"
      >
        {icon}
      </Fab>
    </Tooltip>
  );
});

SpeedDialAction.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * Adds a transition delay, to allow a series of SpeedDialActions to be animated.
   * @default 0
   */
  delay: PropTypes.number,
  /**
   * The icon to display in the SpeedDial Fab.
   */
  icon: PropTypes.node,
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id: PropTypes.string,
  /**
   * If `true`, the component is shown.
   */
  open: PropTypes.bool,
  /**
   * Label to display in the tooltip.
   * @deprecated Use `slotProps.tooltip.title` instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  tooltipTitle: PropTypes.node,
};

export default SpeedDialAction;
