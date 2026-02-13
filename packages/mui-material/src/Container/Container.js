'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import capitalize from '../utils/capitalize';
import styled from '../styles/styled';
import { useDefaultProps } from '../DefaultPropsProvider';
import composeClasses from '@mui/utils/composeClasses';
import generateUtilityClass from '@mui/utils/generateUtilityClass';

const useUtilityClasses = (ownerState) => {
  const getContainerUtilityClass = (slot) => {
    return generateUtilityClass('MuiContainer', slot);
  };
  const { classes, fixed, disableGutters, maxWidth } = ownerState;

  const slots = {
    root: [
      'root',
      maxWidth && `maxWidth${capitalize(String(maxWidth))}`,
      fixed && 'fixed',
      disableGutters && 'disableGutters',
    ],
  };

  return composeClasses(slots, getContainerUtilityClass, classes);
};

const ContainerRoot = styled('div', {
  name: 'MuiContainer',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[`maxWidth${capitalize(String(ownerState.maxWidth))}`],
      ownerState.fixed && styles.fixed,
      ownerState.disableGutters && styles.disableGutters,
    ];
  },
})(({ theme, ownerState }) => ({
  width: '100%',
  marginLeft: 'auto',
  boxSizing: 'border-box',
  marginRight: 'auto',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}), ({ theme, ownerState }) => ({
  [theme.breakpoints.up('lg')]: {
    maxWidth: `${theme.breakpoints.values.lg}${theme.breakpoints.unit}`,
  },
}));

const Container = React.forwardRef(function Container(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiContainer' });
  const {
    className,
    classes: classesProp,
    ...other
  } = props;

  const component = 'div';
  const maxWidth = 'lg';
  const fixed = false;
  const disableGutters = false;

  const ownerState = {
    ...props,
    component,
    disableGutters,
    fixed,
    maxWidth,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <ContainerRoot
      as={component}
      ownerState={ownerState}
      className={clsx(classes.root, className)}
      ref={ref}
      {...other}
    />
  );
});

Container.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default Container;
