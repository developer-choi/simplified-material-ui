'use client';
import * as React from 'react';
import NativeSelectInput from './NativeSelectInput';

/**
 * An alternative to `<Select native />` with a much smaller bundle size footprint.
 */
function NativeSelect({ children, ...props }) {
  return (
    <NativeSelectInput {...props}>
      {children}
    </NativeSelectInput>
  );
}

export default NativeSelect;
