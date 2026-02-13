'use client';
import * as React from 'react';
import Typography from '@mui/material/Typography';

const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    display: 'flex',
    flex: '0 0 auto',
    marginRight: 16,
  },
  action: {
    flex: '0 0 auto',
    alignSelf: 'flex-start',
    marginTop: -4,
    marginRight: -8,
    marginBottom: -4,
  },
  content: {
    flex: '1 1 auto',
  },
};

const CardHeader = React.forwardRef(function CardHeader(props, ref) {
  const {
    action,
    avatar,
    component = 'div',
    disableTypography = false,
    subheader: subheaderProp,
    title: titleProp,
    ...other
  } = props;

  let title = titleProp;
  if (title != null && title.type !== Typography && !disableTypography) {
    title = (
      <Typography
        variant={avatar ? 'body2' : 'h5'}
        component="span"
      >
        {title}
      </Typography>
    );
  }

  let subheader = subheaderProp;
  if (subheader != null && subheader.type !== Typography && !disableTypography) {
    subheader = (
      <Typography
        variant={avatar ? 'body2' : 'body1'}
        color="textSecondary"
        component="span"
      >
        {subheader}
      </Typography>
    );
  }

  const Component = component;

  return (
    <Component ref={ref} style={styles.root} {...other}>
      {avatar && <div style={styles.avatar}>{avatar}</div>}
      <div style={styles.content}>
        {title}
        {subheader}
      </div>
      {action && <div style={styles.action}>{action}</div>}
    </Component>
  );
});

export default CardHeader;
