'use client';
import * as React from 'react';
import SwitchBase from '@mui/material/internal/SwitchBase';
import CheckBoxOutlineBlankIcon from '@mui/material/internal/svg-icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/material/internal/svg-icons/CheckBox';

const Checkbox = React.forwardRef(function Checkbox(props, ref) {
  const {
    className,
    ...other
  } = props;

  return (
    <SwitchBase
      ref={ref}
      className={className}
      type="checkbox"
      icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
      checkedIcon={<CheckBoxIcon fontSize="medium" />}
      {...other}
    />
  );
});

export default Checkbox;
