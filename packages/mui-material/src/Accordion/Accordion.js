'use client';
import * as React from 'react';
import { isFragment } from 'react-is';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import chainPropTypes from '@mui/utils/chainPropTypes';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import Paper from '../Paper';
import AccordionContext from './AccordionContext';
import useControlled from '../utils/useControlled';
import accordionClasses, { getAccordionUtilityClass } from './accordionClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, expanded, disabled } = ownerState;

  const slots = {
    root: [
      'root',
      'rounded',
      expanded && 'expanded',
      disabled && 'disabled',
      'gutters',
    ],
    heading: ['heading'],
    region: ['region'],
  };

  return composeClasses(slots, getAccordionUtilityClass, classes);
};

const AccordionRoot = styled(Paper, {
  name: 'MuiAccordion',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    return [
      { [`& .${accordionClasses.region}`]: styles.region },
      styles.root,
      styles.rounded,
      styles.gutters,
    ];
  },
})(
  memoTheme(({ theme }) => {
    const transition = {
      duration: theme.transitions.duration.shortest,
    };

    return {
      position: 'relative',
      transition: theme.transitions.create(['margin'], transition),
      overflowAnchor: 'none', // Keep the same scrolling position
      borderRadius: 0,
      '&:first-of-type': {
        borderTopLeftRadius: (theme.vars || theme).shape.borderRadius,
        borderTopRightRadius: (theme.vars || theme).shape.borderRadius,
        '&::before': {
          display: 'none',
        },
      },
      '&:last-of-type': {
        borderBottomLeftRadius: (theme.vars || theme).shape.borderRadius,
        borderBottomRightRadius: (theme.vars || theme).shape.borderRadius,
      },
      '&::before': {
        position: 'absolute',
        left: 0,
        top: -1,
        right: 0,
        height: 1,
        content: '""',
        opacity: 1,
        backgroundColor: (theme.vars || theme).palette.divider,
        transition: theme.transitions.create(['opacity', 'background-color'], transition),
      },
      [`&.${accordionClasses.expanded}`]: {
        margin: '16px 0',
        '&::before': {
          opacity: 0,
        },
        '&:first-of-type': {
          marginTop: 0,
        },
        '&:last-of-type': {
          marginBottom: 0,
        },
        '& + &': {
          '&::before': {
            display: 'none',
          },
        },
      },
      [`&.${accordionClasses.disabled}`]: {
        backgroundColor: (theme.vars || theme).palette.action.disabledBackground,
      },
    };
  }),
);

const AccordionHeading = styled('h3', {
  name: 'MuiAccordion',
  slot: 'Heading',
})({
  all: 'unset',
});

const AccordionRegion = styled('div', {
  name: 'MuiAccordion',
  slot: 'Region',
})({});

const Accordion = React.forwardRef(function Accordion(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiAccordion' });
  const {
    children: childrenProp,
    className,
    defaultExpanded = false,
    disabled = false,
    expanded: expandedProp,
    onChange,
    ...other
  } = props;

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
    () => ({ expanded, disabled, toggle: handleChange }),
    [expanded, disabled, handleChange],
  );

  const ownerState = {
    ...props,
    disabled,
    expanded,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <AccordionRoot
      ref={ref}
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      {...other}
    >
      <AccordionHeading className={classes.heading} ownerState={ownerState}>
        <AccordionContext.Provider value={contextValue}>{summary}</AccordionContext.Provider>
      </AccordionHeading>
      {expanded && (
        <AccordionRegion
          className={classes.region}
          ownerState={ownerState}
          aria-labelledby={summary.props.id}
          id={summary.props['aria-controls']}
          role="region"
        >
          {children}
        </AccordionRegion>
      )}
    </AccordionRoot>
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
   * If `true`, the component is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
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
