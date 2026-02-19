'use client';
import * as React from 'react';

function SnackbarContent({ action, message, role = 'alert', ...other }) {
  return (
    <div
      role={role}
      style={{
        backgroundColor: '#323232',
        color: '#fff',
        fontSize: '0.875rem',
        lineHeight: 1.43,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: '6px 16px',
        flexGrow: 1,
        minWidth: 288,
        borderRadius: 4,
        boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
      }}
      {...other}
    >
      <div style={{ padding: '8px 0' }}>
        {message}
      </div>
      {action ? (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', paddingLeft: 16, marginRight: -8 }}>
          {action}
        </div>
      ) : null}
    </div>
  );
}

export default SnackbarContent;
