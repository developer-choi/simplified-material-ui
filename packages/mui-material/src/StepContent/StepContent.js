'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { useDefaultProps } from '../DefaultPropsProvider';
import StepContext from '../Step/StepContext';
import { getStepContentUtilityClass } from './stepContentClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, last } = ownerState;

  const slots = { root: ['root', last && 'last'] };

  return composeClasses(slots, getStepContentUtilityClass, classes);
};

const StepContent = React.forwardRef(function StepContent(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiStepContent' });
  const { children, className, style, ...other } = props;

  const { active, last } = React.useContext(StepContext);

  const ownerState = { ...props, last };
  const classes = useUtilityClasses(ownerState);

  return (
    <div
      className={clsx(classes.root, className)}
      ref={ref}
      style={{
        marginLeft: 12,
        paddingLeft: 20,
        paddingRight: 8,
        borderLeft: last ? 'none' : '1px solid #bdbdbd',
        ...style,
      }}
      {...other}
    >
      {active && children}
    </div>
  );
});

StepContent.propTypes /* remove-proptypes */ = {
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
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    transition: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    transition: PropTypes.elementType,
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The component used for the transition.
   * [Follow this guide](https://mui.com/material-ui/transitions/#transitioncomponent-prop) to learn more about the requirements for this component.
   * @default Collapse
   * @deprecated Use `slots.transition` instead. This prop will be removed in a future major release. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/).
   */
  TransitionComponent: PropTypes.elementType,
  /**
   * Adjust the duration of the content expand transition.
   * Passed as a prop to the transition component.
   *
   * Set to 'auto' to automatically calculate transition time based on height.
   * @default 'auto'
   */
  transitionDuration: PropTypes.oneOfType([
    PropTypes.oneOf(['auto']),
    PropTypes.number,
    PropTypes.shape({
      appear: PropTypes.number,
      enter: PropTypes.number,
      exit: PropTypes.number,
    }),
  ]),
  /**
   * Props applied to the transition element.
   * By default, the element is based on this [`Transition`](https://reactcommunity.org/react-transition-group/transition/) component.
   * @deprecated Use `slotProps.transition` instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  TransitionProps: PropTypes.object,
};

export default StepContent;
