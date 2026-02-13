import * as React from 'react';
import { createRenderer } from '@mui/internal-test-utils';
import CardActionArea, { cardActionAreaClasses as classes } from './index';
import ButtonBase from '../../form/ButtonBase';
import describeConformance from '../../mui-material/test/describeConformance';

const CustomButtonBase = React.forwardRef(({ focusVisibleClassName, ...props }, ref) => {
  return <ButtonBase {...props} ref={ref} />;
});

describe('<CardActionArea />', () => {
  const { render } = createRenderer();

  describeConformance(<CardActionArea />, () => ({
    classes,
    inheritComponent: ButtonBase,
    render,
    muiName: 'MuiCardActionArea',
    testDeepOverrides: { slotName: 'focusHighlight', slotClassName: classes.focusHighlight },
    testVariantProps: { variant: 'foo' },
    refInstanceof: window.HTMLButtonElement,
    skip: ['componentProp', 'componentsProp'],
    slots: {
      root: {
        expectedClassName: classes.root,
        testWithElement: CustomButtonBase,
      },
      focusHighlight: {
        expectedClassName: classes.focusHighlight,
      },
    },
  }));
});
