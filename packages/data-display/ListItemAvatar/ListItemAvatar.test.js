import { createRenderer } from '@mui/internal-test-utils';
import ListItemAvatar, { listItemAvatarClasses as classes } from './index';
import describeConformance from '../../mui-material/test/describeConformance';

describe('<ListItemAvatar />', () => {
  const { render } = createRenderer();

  describeConformance(
    <ListItemAvatar>
      <div />
    </ListItemAvatar>,
    () => ({
      classes,
      inheritComponent: 'div',
      render,
      muiName: 'MuiListItemAvatar',
      refInstanceof: window.HTMLDivElement,
      skip: ['componentProp', 'componentsProp', 'themeVariants'],
    }),
  );
});
