'use client';
import * as React from 'react';
import ListContext from '../../../data-display/List/ListContext';

/**
 * Must be used as the last child of ListItem to function properly.
 *
 * @deprecated Use the `secondaryAction` prop in the `ListItem` component instead. This component will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
 */
const ListItemSecondaryAction = React.forwardRef(function ListItemSecondaryAction(props, ref) {
  const { className, ...other } = props;
  const context = React.useContext(ListContext);
  const { disableGutters } = context;

  const style = {
    position: 'absolute',
    right: disableGutters ? 0 : 16,
    top: '50%',
    transform: 'translateY(-50%)',
  };

  return (
    <div
      ref={ref}
      style={style}
      className={className}
      {...other}
    />
  );
});

ListItemSecondaryAction.muiName = 'ListItemSecondaryAction';

export default ListItemSecondaryAction;
