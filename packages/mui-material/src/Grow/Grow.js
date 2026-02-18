'use client';
import * as React from 'react';
import { Transition } from 'react-transition-group';

function getScale(value) {
  return `scale(${value}, ${value ** 2})`;
}

const styles = {
  entering: {
    opacity: 1,
    transform: getScale(1),
  },
  entered: {
    opacity: 1,
    transform: 'none',
  },
};

function Grow(props) {
  const {
    children,
    in: inProp,
    ...other
  } = props;
  const timeout = 300;

  const nodeRef = React.useRef(null);

  const handleEnter = () => {
    const node = nodeRef.current;
    node.style.transition = 'opacity 300ms ease-in-out, transform 200ms ease-in-out';
  };

  const handleExit = () => {
    const node = nodeRef.current;
    node.style.transition = 'opacity 300ms ease-in-out, transform 200ms ease-in-out 100ms';

    node.style.opacity = 0;
    node.style.transform = getScale(0.75);
  };

  return (
    <Transition
      appear
      in={inProp}
      nodeRef={nodeRef}
      onEnter={handleEnter}
      onExit={handleExit}
      timeout={timeout}
      {...other}
    >
      {(state) => {
        return React.cloneElement(children, {
          style: {
            opacity: 0,
            transform: getScale(0.75),
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...styles[state],
            ...children.props.style,
          },
          ref: nodeRef,
        });
      }}
    </Transition>
  );
}

export default Grow;
