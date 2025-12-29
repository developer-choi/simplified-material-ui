'use client';
import * as React from 'react';
import { duration } from '../styles/createTransitions';


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

export default Collapse;
