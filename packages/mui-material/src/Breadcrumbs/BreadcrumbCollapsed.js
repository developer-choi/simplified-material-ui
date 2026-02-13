'use client';
import { styled } from '../zero-styled';
import MoreHorizIcon from '../internal/svg-icons/MoreHoriz';
import ButtonBase from '../../../form/ButtonBase';

const BreadcrumbCollapsedButton = styled(ButtonBase, {
  name: 'MuiBreadcrumbCollapsed',
})({
  display: 'flex',
  marginLeft: '4px',
  marginRight: '4px',
  backgroundColor: '#f5f5f5',
  color: '#616161',
  borderRadius: 2,
  '&:hover, &:focus': {
    backgroundColor: '#eeeeee',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: '#e0e0e0',
  },
});

const BreadcrumbCollapsedIcon = styled(MoreHorizIcon)({
  width: 24,
  height: 16,
});

/**
 * @ignore - internal component.
 */
function BreadcrumbCollapsed(props) {
  const ownerState = props;

  return (
    <li>
      <BreadcrumbCollapsedButton focusRipple {...props} ownerState={ownerState}>
        <BreadcrumbCollapsedIcon ownerState={ownerState} />
      </BreadcrumbCollapsedButton>
    </li>
  );
}

export default BreadcrumbCollapsed;
