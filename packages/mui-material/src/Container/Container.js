'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import capitalize from '../utils/capitalize';
import styled from '../styles/styled';

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
  paddingLeft: '16px',
  paddingRight: '16px',
  '@media (min-width:600px)': {
    paddingLeft: '24px',
    paddingRight: '24px',
  },
}), ({ theme, ownerState }) => ({
  '@media (min-width:1200px)': {
    maxWidth: '1200px',
  },
}));

const Container = React.forwardRef(function Container(props, ref) {
  const {
    className,
    ...other
  } = props;

  const component = 'div';
  const maxWidth = 'lg';
  const fixed = false;
  const disableGutters = false;

  const ownerState = {
    component,
    disableGutters,
    fixed,
    maxWidth,
  };

  return (
    <ContainerRoot
      as={component}
      ownerState={ownerState}
      className={clsx('MuiContainer-root', 'MuiContainer-maxWidthLg', className)}
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
};

export default Container;
