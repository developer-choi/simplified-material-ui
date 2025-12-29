'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { duration } from '../styles/createTransitions';


/**
 * The Collapse transition is used by the
 * [Vertical Stepper](/material-ui/react-stepper/#vertical-stepper) StepContent component.
 * It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
const Collapse = React.forwardRef(function Collapse(inProps, ref) {
  const {
    children,
    className,
    in: inProp,
    style,
    timeout = duration.standard,
    ...other
  } = inProps;

  const wrapperRef = React.useRef(null);
  const [wrapperHeight, setWrapperHeight] = React.useState(0);
  const [isEntered, setIsEntered] = React.useState(inProp);

  React.useEffect(() => {
    if (wrapperRef.current) {
      setWrapperHeight(wrapperRef.current.clientHeight);
    }
  }, [children]);

  React.useEffect(() => {
    if (inProp) {
      setIsEntered(true);
    } else {
      const timer = setTimeout(() => setIsEntered(false), timeout);
      return () => clearTimeout(timer);
    }
  }, [inProp, timeout]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: '0px',
        height: inProp ? wrapperHeight : 0,
        transition: `height ${timeout}ms ease-in-out`,
        overflow: isEntered ? 'visible' : 'hidden',
        visibility: !isEntered && !inProp ? 'hidden' : 'visible',
        ...style,
      }}
      {...other}
    >
      <div
        ref={wrapperRef}
        style={{
          display: 'flex',
          width: '100%',
        }}
      >
        <div
          style={{
            width: '100%',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
});

Collapse.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content node to be collapsed.
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * If `true`, the component will transition in.
   */
  in: PropTypes.bool,
  /**
   * @ignore
   */
  style: PropTypes.object,
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   * @default duration.standard
   */
  timeout: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      appear: PropTypes.number,
      enter: PropTypes.number,
      exit: PropTypes.number,
    }),
  ]),
};

export default Collapse;
