'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import styled from '@mui/styled-engine';
import styleFunctionSx, { extendSxProp } from '@mui/system/styleFunctionSx';
import useTheme from '@mui/system/useTheme';
import clsx from 'clsx';
import { unstable_ClassNameGenerator as ClassNameGenerator } from '../className';
import { createTheme } from '../styles';
import boxClasses from './boxClasses';

const defaultTheme = createTheme();

const BoxRoot = styled('div', {
  shouldForwardProp: (prop) => prop !== 'theme' && prop !== 'sx' && prop !== 'as',
})(styleFunctionSx);

const Box = React.forwardRef(function Box(inProps, ref) {
  const theme = useTheme(defaultTheme);
  const { className, component = 'div', ...other } = extendSxProp(inProps);

  return (
    <BoxRoot
      as={component}
      ref={ref}
      className={clsx(
        className,
        ClassNameGenerator.generate ? ClassNameGenerator.generate(boxClasses.root) : boxClasses.root,
      )}
      theme={theme}
      {...other}
    />
  );
});

Box.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: PropTypes.node,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default Box;
