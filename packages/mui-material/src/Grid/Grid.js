'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import generateUtilityClass from '@mui/utils/generateUtilityClass';
import composeClasses from '@mui/utils/composeClasses';
import requirePropFactory from '../utils/requirePropFactory';
import { styled } from '../styles';
import { useDefaultProps } from '../DefaultPropsProvider';
import useTheme from '../styles/useTheme';

const useUtilityClasses = (ownerState) => {
  const { container, direction, spacing, wrap, size } = ownerState;
  const slots = {
    root: [
      'root',
      container && 'container',
      wrap !== 'wrap' && `wrap-xs-${String(wrap)}`,
      `direction-xs-${direction}`,
      size !== undefined && size !== false && `grid-xs-${size}`,
      container && spacing && `spacing-xs-${spacing}`,
    ].filter(Boolean),
  };
  return composeClasses(slots, (slot) => generateUtilityClass('MuiGrid', slot), {});
};

const GridRoot = styled('div', {
  name: 'MuiGrid',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [styles.root, ownerState.container && styles.container];
  },
})(({ theme, ownerState }) => {
  const gap = typeof ownerState.spacing === 'string'
    ? ownerState.spacing
    : theme.spacing(ownerState.spacing);

  return {
    minWidth: 0,
    boxSizing: 'border-box',
    ...(ownerState.container && {
      display: 'flex',
      flexWrap: ownerState.wrap,
      flexDirection: ownerState.direction,
      '--Grid-columns': ownerState.columns,
      '--Grid-gap': gap,
      gap: `var(--Grid-gap)`,
    }),
    ...(ownerState.size === 'grow' && {
      flexBasis: 0,
      flexGrow: 1,
      maxWidth: '100%',
    }),
    ...(ownerState.size === 'auto' && {
      flexBasis: 'auto',
      flexGrow: 0,
      flexShrink: 0,
      maxWidth: 'none',
      width: 'auto',
    }),
    ...(typeof ownerState.size === 'number' && {
      flexGrow: 0,
      flexBasis: 'auto',
      width: `calc(100% * ${ownerState.size} / var(--Grid-columns) - (var(--Grid-columns) - ${ownerState.size}) * var(--Grid-gap) / var(--Grid-columns))`,
    }),
    ...(ownerState.offset === 'auto' && { marginLeft: 'auto' }),
    ...(typeof ownerState.offset === 'number' && ownerState.offset === 0 && {
      marginLeft: '0px',
    }),
    ...(typeof ownerState.offset === 'number' && ownerState.offset > 0 && {
      marginLeft: `calc(100% * ${ownerState.offset} / var(--Grid-columns) + var(--Grid-gap) * ${ownerState.offset} / var(--Grid-columns))`,
    }),
  };
});

const Grid = React.forwardRef(function Grid(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiGrid' });
  const theme = useTheme();

  const {
    className,
    children,
    columns = 12,
    container = false,
    direction = 'row',
    wrap = 'wrap',
    size,
    offset,
    spacing = 0,
    ...other
  } = props;

  const ownerState = {
    columns,
    container,
    direction,
    wrap,
    spacing,
    size,
    offset,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <GridRoot
      ref={ref}
      ownerState={ownerState}
      className={clsx(classes.root, className)}
      {...other}
    >
      {children}
    </GridRoot>
  );
});

Grid.propTypes /* remove-proptypes */ = {
  children: PropTypes.node,
  columns: PropTypes.number,
  container: PropTypes.bool,
  direction: PropTypes.oneOf(['column-reverse', 'column', 'row-reverse', 'row']),
  offset: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
  spacing: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  wrap: PropTypes.oneOf(['nowrap', 'wrap-reverse', 'wrap']),
};

if (process.env.NODE_ENV !== 'production') {
  const requireProp = requirePropFactory('Grid', Grid);
  Grid['propTypes' + ''] = {
    ...Grid.propTypes,
    direction: requireProp('container'),
    spacing: requireProp('container'),
    wrap: requireProp('container'),
  };
}

export default Grid;
