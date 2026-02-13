'use client';
import * as React from 'react';
import Typography from '../Typography';
import ListContext from '../../../data-display/List/ListContext';

const ListItemText = React.forwardRef(function ListItemText(props, ref) {
  const {
    children,
    className,
    disableTypography = false,
    inset = false,
    primary: primaryProp,
    secondary: secondaryProp,
    ...other
  } = props;
  const { dense } = React.useContext(ListContext);

  let primary = primaryProp != null ? primaryProp : children;
  let secondary = secondaryProp;

  const hasSecondary = !!secondary;
  const marginValue = primary && hasSecondary ? 6 : 4;

  const rootStyle = {
    flex: '1 1 auto',
    minWidth: 0,
    marginTop: marginValue,
    marginBottom: marginValue,
    ...(inset && { paddingLeft: 56 }),
  };

  if (primary != null && primary.type !== Typography && !disableTypography) {
    primary = (
      <Typography
        variant={dense ? 'body2' : 'body1'}
        component="span"
        style={{ display: 'block' }}
      >
        {primary}
      </Typography>
    );
  }

  if (secondary != null && secondary.type !== Typography && !disableTypography) {
    secondary = (
      <Typography
        variant="body2"
        color="textSecondary"
        style={{ display: 'block' }}
      >
        {secondary}
      </Typography>
    );
  }

  return (
    <div
      ref={ref}
      style={rootStyle}
      className={className}
      {...other}
    >
      {primary}
      {secondary}
    </div>
  );
});

export default ListItemText;
