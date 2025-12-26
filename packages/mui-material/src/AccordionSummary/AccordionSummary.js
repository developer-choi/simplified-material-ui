'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '../zero-styled';
import AccordionContext from '../../../surfaces/Accordion/AccordionContext';
import accordionSummaryClasses, {
  getAccordionSummaryUtilityClass,
} from './accordionSummaryClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, expanded, disabled } = ownerState;

  const slots = {
    root: ['root', expanded && 'expanded', disabled && 'disabled', 'gutters'],
    focusVisible: ['focusVisible'],
    content: ['content', expanded && 'expanded', 'contentGutters'],
    expandIconWrapper: ['expandIconWrapper', expanded && 'expanded'],
  };

  return composeClasses(slots, getAccordionSummaryUtilityClass, classes);
};

const AccordionSummaryRoot = styled('button', {
  name: 'MuiAccordionSummary',
  slot: 'Root',
})({
  display: 'flex',
  width: '100%',
  minHeight: 48,
  padding: '0 16px',
  transition: 'min-height 150ms, background-color 150ms',
  [`&.${accordionSummaryClasses.focusVisible}`]: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  [`&.${accordionSummaryClasses.disabled}`]: {
    opacity: 0.38,
  },
  [`&:hover:not(.${accordionSummaryClasses.disabled})`]: {
    cursor: 'pointer',
  },
  [`&.${accordionSummaryClasses.expanded}`]: {
    minHeight: 64,
  },
});

const AccordionSummaryContent = styled('span', {
  name: 'MuiAccordionSummary',
  slot: 'Content',
})({
  display: 'flex',
  textAlign: 'start',
  flexGrow: 1,
  margin: '12px 0',
  transition: 'margin 150ms',
  [`&.${accordionSummaryClasses.expanded}`]: {
    margin: '20px 0',
  },
});

const AccordionSummaryExpandIconWrapper = styled('span', {
  name: 'MuiAccordionSummary',
  slot: 'ExpandIconWrapper',
})({
  display: 'flex',
  color: 'rgba(0, 0, 0, 0.54)',
  transform: 'rotate(0deg)',
  transition: 'transform 150ms',
  [`&.${accordionSummaryClasses.expanded}`]: {
    transform: 'rotate(180deg)',
  },
});

const AccordionSummary = React.forwardRef(function AccordionSummary(props, ref) {
  const {
    children,
    className,
    expandIcon,
    onClick,
    ...other
  } = props;

  const { disabled = false, expanded, toggle } = React.useContext(AccordionContext);
  const handleChange = (event) => {
    if (toggle) {
      toggle(event);
    }
    if (onClick) {
      onClick(event);
    }
  };

  const ownerState = {
    ...props,
    expanded,
    disabled,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <AccordionSummaryRoot
      ref={ref}
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      disabled={disabled}
      aria-expanded={expanded}
      onClick={handleChange}
      {...other}
    >
      <AccordionSummaryContent className={classes.content} ownerState={ownerState}>
        {children}
      </AccordionSummaryContent>
      {expandIcon && (
        <AccordionSummaryExpandIconWrapper className={classes.expandIconWrapper} ownerState={ownerState}>
          {expandIcon}
        </AccordionSummaryExpandIconWrapper>
      )}
    </AccordionSummaryRoot>
  );
});

AccordionSummary.propTypes /* remove-proptypes */ = {
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
   * The icon to display as the expand indicator.
   */
  expandIcon: PropTypes.node,
  /**
   * @ignore
   */
  onClick: PropTypes.func,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default AccordionSummary;
