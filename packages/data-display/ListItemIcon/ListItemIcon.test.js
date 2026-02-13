import { createRenderer } from '@mui/internal-test-utils';
import ListItemIcon, { listItemIconClasses as classes } from './index';
import describeConformance from '../../mui-material/test/describeConformance';

describe('<ListItemIcon />', () => {
  const { render } = createRenderer();

  describeConformance(
    <ListItemIcon>
      <div />
    </ListItemIcon>,
    () => ({
      classes,
      inheritComponent: 'div',
      render,
      muiName: 'MuiListItemIcon',
      refInstanceof: window.HTMLDivElement,
      skip: ['componentProp', 'componentsProp', 'themeVariants'],
    }),
  );
});
