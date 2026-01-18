import * as React from 'react';
import InputLabel from '../../../../form/InputLabel';

declare module '../../../../form/InputLabel' {
  interface InputLabelPropsSizeOverrides {
    customSize: true;
  }
}

<InputLabel size="customSize" />;

// @ts-expect-error unknown size
<InputLabel size="foo" />;
