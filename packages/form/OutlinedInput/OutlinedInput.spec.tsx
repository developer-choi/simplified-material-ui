import OutlinedInput from './index';

function NoNotched() {
  return null;
}

<OutlinedInput
  slots={{
    notchedOutline: NoNotched,
  }}
/>;
<OutlinedInput
  slotProps={{
    notchedOutline: {
      className: 'hidden',
    },
  }}
/>;
