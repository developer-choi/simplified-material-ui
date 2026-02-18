'use client';
import * as React from 'react';
import isFocusVisible from '@mui/utils/isFocusVisible';

const linkStyles = `.MuiLink-hover:hover { text-decoration: underline; }`;

function Link(props) {
  const {
    children,
    underline = 'always',
    ...other
  } = props;

  const [focusVisible, setFocusVisible] = React.useState(false);
  const handleBlur = (event) => {
    if (!isFocusVisible(event.target)) {
      setFocusVisible(false);
    }
  };
  const handleFocus = (event) => {
    if (isFocusVisible(event.target)) {
      setFocusVisible(true);
    }
  };

  return (
    <>
      <style>{linkStyles}</style>
      <a
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={underline === 'hover' ? 'MuiLink-hover' : undefined}
        style={{
          color: '#1976d2',
          textDecoration: underline === 'always' ? 'underline' : 'none',
          outline: focusVisible ? 'auto' : 0,
        }}
        {...other}
      >
        {children}
      </a>
    </>
  );
}

export default Link;
