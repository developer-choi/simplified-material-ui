import { createRenderer } from '@mui/internal-test-utils';
import CardContent, { cardContentClasses as classes } from './index';
import describeConformance from '../../mui-material/test/describeConformance';

describe('<CardContent />', () => {
  const { render } = createRenderer();

  describeConformance(<CardContent />, () => ({
    classes,
    inheritComponent: 'div',
    render,
    muiName: 'MuiCardContent',
    refInstanceof: window.HTMLDivElement,
    skip: ['componentsProp', 'themeVariants'],
    testComponentPropWith: 'span',
  }));
});
