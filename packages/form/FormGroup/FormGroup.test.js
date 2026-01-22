import { expect } from 'chai';
import { createRenderer, screen } from '@mui/internal-test-utils';
import FormGroup, { formGroupClasses as classes } from './index';
import FormControl from '../FormControl';
import describeConformance from '../../mui-material/test/describeConformance';

describe('<FormGroup />', () => {
  const { render } = createRenderer();

  describeConformance(<FormGroup />, () => ({
    classes,
    inheritComponent: 'div',
    render,
    muiName: 'MuiFormGroup',
    refInstanceof: window.HTMLDivElement,
    testVariantProps: { row: true },
    skip: ['componentProp', 'componentsProp'],
  }));

  it('should render a div with a div child', () => {
    render(
      <FormGroup>
        <div data-testid="test-children" />
      </FormGroup>,
    );

    expect(screen.queryByTestId('test-children')).not.to.equal(null);
  });

  describe('with FormControl', () => {
    describe('error', () => {
      it(`should have the error class`, () => {
        render(
          <FormControl error>
            <FormGroup data-testid="FormGroup">
              <div />
            </FormGroup>
          </FormControl>,
        );

        expect(screen.getByTestId('FormGroup')).to.have.class(classes.error);
      });
    });
  });
});
