'use client';
import PropTypes from 'prop-types';
import rootShouldForwardProp from '../styles/rootShouldForwardProp';
import { styled } from '../zero-styled';

const NotchedOutlineRoot = styled('fieldset', {
  name: 'MuiNotchedOutlined',
  shouldForwardProp: rootShouldForwardProp,
})({
  textAlign: 'left',
  position: 'absolute',
  bottom: 0,
  right: 0,
  top: -5,
  left: 0,
  margin: 0,
  padding: '0 8px',
  pointerEvents: 'none',
  borderRadius: 'inherit',
  borderStyle: 'solid',
  borderWidth: 1,
  overflow: 'hidden',
  minWidth: '0%',
});

const NotchedOutlineLegend = styled('legend', {
  name: 'MuiNotchedOutlined',
  shouldForwardProp: rootShouldForwardProp,
})({
  float: 'unset',
  width: 'auto',
  overflow: 'hidden',
  variants: [
    {
      props: ({ ownerState }) => !ownerState.withLabel,
      style: {
        padding: 0,
        lineHeight: '11px',
        transition: 'width 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    {
      props: ({ ownerState }) => ownerState.withLabel,
      style: {
        display: 'block',
        padding: 0,
        height: 11,
        fontSize: '0.75em',
        visibility: 'hidden',
        maxWidth: 0.01,
        transition: 'max-width 50ms cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: 'nowrap',
        '& > span': {
          paddingLeft: 5,
          paddingRight: 5,
          display: 'inline-block',
          opacity: 0,
          visibility: 'visible',
        },
      },
    },
    {
      props: ({ ownerState }) => ownerState.withLabel && ownerState.notched,
      style: {
        maxWidth: '100%',
        transition: 'max-width 100ms cubic-bezier(0.4, 0, 0.2, 1) 50ms',
      },
    },
  ],
});

/**
 * @ignore - internal component.
 */
export default function NotchedOutline(props) {
  const { children, classes, className, label, notched, ...other } = props;
  const withLabel = label != null && label !== '';
  const ownerState = {
    ...props,
    notched,
    withLabel,
  };
  return (
    <NotchedOutlineRoot aria-hidden className={className} ownerState={ownerState} {...other}>
      <NotchedOutlineLegend ownerState={ownerState}>
        {/* Use the nominal use case of the legend, avoid rendering artefacts. */}
        {withLabel ? (
          <span>{label}</span>
        ) : (
          // notranslate needed while Google Translate will not fix zero-width space issue
          <span className="notranslate" aria-hidden>
            &#8203;
          </span>
        )}
      </NotchedOutlineLegend>
    </NotchedOutlineRoot>
  );
}

NotchedOutline.propTypes /* remove-proptypes */ = {
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The label.
   */
  label: PropTypes.node,
  /**
   * If `true`, the outline is notched to accommodate the label.
   */
  notched: PropTypes.bool.isRequired,
  /**
   * @ignore
   */
  style: PropTypes.object,
};
