'use client';
import * as React from 'react';
import { isFragment } from 'react-is';
import PropTypes from 'prop-types';
import chainPropTypes from '@mui/utils/chainPropTypes';
import Paper from '../Paper';
import AccordionContext from './AccordionContext';
import useControlled from '../utils/useControlled';

const Accordion = React.forwardRef(function Accordion(
  {
    children: childrenProp,
    className,
    defaultExpanded = false,
    expanded: expandedProp,
    onChange,
    ...other
  },
  ref,
) {

  const [expanded, setExpandedState] = useControlled({
    controlled: expandedProp,
    default: defaultExpanded,
    name: 'Accordion',
    state: 'expanded',
  });

  const handleChange = React.useCallback(
    (event) => {
      setExpandedState(!expanded);

      if (onChange) {
        onChange(event, !expanded);
      }
    },
    [expanded, onChange, setExpandedState],
  );

  const [summary, ...children] = React.Children.toArray(childrenProp);
  const contextValue = React.useMemo(
    () => ({ expanded, toggle: handleChange }),
    [expanded, handleChange],
  );

  return (
    <Paper
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        overflowAnchor: 'none',
        margin: expanded ? '16px 0' : '0',
      }}
      {...other}
    >
      <h3 style={{ all: 'unset' }}>
        <AccordionContext.Provider value={contextValue}>{summary}</AccordionContext.Provider>
      </h3>
      {expanded && (
        <div
          aria-labelledby={summary.props.id}
          id={summary.props['aria-controls']}
          role="region"
        >
          {children}
        </div>
      )}
    </Paper>
  );
});

Accordion.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: chainPropTypes(PropTypes.node.isRequired, (props) => {
    const summary = React.Children.toArray(props.children)[0];
    if (isFragment(summary)) {
      return new Error(
        "MUI: The Accordion doesn't accept a Fragment as a child. " +
          'Consider providing an array instead.',
      );
    }

    if (!React.isValidElement(summary)) {
      return new Error('MUI: Expected the first child of Accordion to be a valid element.');
    }

    return null;
  }),
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * If `true`, expands the accordion by default.
   * @default false
   */
  defaultExpanded: PropTypes.bool,
  /**
   * If `true`, expands the accordion, otherwise collapse it.
   * Setting this prop enables control over the accordion.
   */
  expanded: PropTypes.bool,
  /**
   * Callback fired when the expand/collapse state is changed.
   *
   * @param {React.SyntheticEvent} event The event source of the callback. **Warning**: This is a generic event not a change event.
   * @param {boolean} expanded The `expanded` state of the accordion.
   */
  onChange: PropTypes.func,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default Accordion;
