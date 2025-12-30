'use client';
import * as React from 'react';
import Paper from '../Paper';
import useControlled from '@mui/material/utils/useControlled';
import AccordionContext from './AccordionContext';

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

export default Accordion;
