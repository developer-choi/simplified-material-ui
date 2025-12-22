'use client';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import clsx from 'clsx';
import useTimeout, { Timeout } from '@mui/utils/useTimeout';
import isFocusVisible from '@mui/utils/isFocusVisible';
import useEventCallback from '../utils/useEventCallback';
import useId from '../utils/useId';
import useControlled from '../utils/useControlled';

// TODO v6: Remove PopperComponent, PopperProps, TransitionComponent and TransitionProps.
const Tooltip = React.forwardRef(function Tooltip(inProps, ref) {
  const {
    children: childrenProp,
    disableFocusListener = false,
    disableTouchListener = false,
    enterDelay = 100,
    enterTouchDelay = 700,
    id: idProp,
    leaveTouchDelay = 1500,
    onClose,
    onOpen,
    open: openProp,
    title,
    ...other
  } = inProps;

  const placement = 'bottom'; // Fixed placement

  // to prevent runtime errors, developers will need to provide a child as a React element anyway.
  const children = React.isValidElement(childrenProp) ? childrenProp : <span>{childrenProp}</span>;

  const [childNode, setChildNode] = React.useState();
  const ignoreNonTouchEvents = React.useRef(false);

  const enterTimer = useTimeout();
  const touchTimer = useTimeout();

  const [openState, setOpenState] = useControlled({
    controlled: openProp,
    default: false,
    name: 'Tooltip',
    state: 'open',
  });

  let open = openState;

  if (process.env.NODE_ENV !== 'production') {
    // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/rules-of-hooks -- process.env never changes
    const { current: isControlled } = React.useRef(openProp !== undefined);

    // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/rules-of-hooks -- process.env never changes
    React.useEffect(() => {
      if (
        childNode &&
        childNode.disabled &&
        !isControlled &&
        title !== '' &&
        childNode.tagName.toLowerCase() === 'button'
      ) {
        console.warn(
          [
            'MUI: You are providing a disabled `button` child to the Tooltip component.',
            'A disabled element does not fire events.',
            "Tooltip needs to listen to the child element's events to display the title.",
            '',
            'Add a simple wrapper element, such as a `span`.',
          ].join('\n'),
        );
      }
    }, [title, childNode, isControlled]);
  }

  const id = useId(idProp);

  const prevUserSelect = React.useRef();
  const stopTouchInteraction = useEventCallback(() => {
    if (prevUserSelect.current !== undefined) {
      document.body.style.WebkitUserSelect = prevUserSelect.current;
      prevUserSelect.current = undefined;
    }
    touchTimer.clear();
  });

  React.useEffect(() => stopTouchInteraction, [stopTouchInteraction]);

  const handleOpen = (event) => {
    // The mouseover event will trigger for every nested element in the tooltip.
    // We can skip rerendering when the tooltip is already open.
    // We are using the mouseover event instead of the mouseenter event to fix a hide/show issue.
    setOpenState(true);

    if (onOpen && !open) {
      onOpen(event);
    }
  };

  const handleClose = useEventCallback(
    /**
     * @param {React.SyntheticEvent | Event} event
     */
    (event) => {
      setOpenState(false);

      if (onClose && open) {
        onClose(event);
      }

      ignoreNonTouchEvents.current = false;
    },
  );

  const handleMouseOver = (event) => {
    if (ignoreNonTouchEvents.current && event.type !== 'touchstart') {
      return;
    }

    // Remove the title ahead of time.
    // We don't want to wait for the next render commit.
    // We would risk displaying two tooltips at the same time (native + this one).
    if (childNode) {
      childNode.removeAttribute('title');
    }

    enterTimer.clear();
    if (enterDelay) {
      enterTimer.start(enterDelay, () => {
        handleOpen(event);
      });
    } else {
      handleOpen(event);
    }
  };

  const handleMouseLeave = (event) => {
    enterTimer.clear();
    handleClose(event);
  };

  const [, setChildIsFocusVisible] = React.useState(false);
  const handleBlur = (event) => {
    if (!isFocusVisible(event.target)) {
      setChildIsFocusVisible(false);
      handleMouseLeave(event);
    }
  };

  const handleFocus = (event) => {
    // Workaround for https://github.com/facebook/react/issues/7769
    // The autoFocus of React might trigger the event before the componentDidMount.
    // We need to account for this eventuality.
    if (!childNode) {
      setChildNode(event.currentTarget);
    }

    if (isFocusVisible(event.target)) {
      setChildIsFocusVisible(true);
      handleMouseOver(event);
    }
  };

  const detectTouchStart = (event) => {
    ignoreNonTouchEvents.current = true;

    const childrenProps = children.props;
    if (childrenProps.onTouchStart) {
      childrenProps.onTouchStart(event);
    }
  };

  const handleTouchStart = (event) => {
    detectTouchStart(event);
    leaveTimer.clear();
    closeTimer.clear();
    stopTouchInteraction();

    prevUserSelect.current = document.body.style.WebkitUserSelect;
    // Prevent iOS text selection on long-tap.
    document.body.style.WebkitUserSelect = 'none';

    touchTimer.start(enterTouchDelay, () => {
      document.body.style.WebkitUserSelect = prevUserSelect.current;
      handleMouseOver(event);
    });
  };

  const handleTouchEnd = (event) => {
    if (children.props.onTouchEnd) {
      children.props.onTouchEnd(event);
    }

    stopTouchInteraction();
    leaveTimer.start(leaveTouchDelay, () => {
      handleClose(event);
    });
  };

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    /**
     * @param {KeyboardEvent} nativeEvent
     */
    function handleKeyDown(nativeEvent) {
      if (nativeEvent.key === 'Escape') {
        handleClose(nativeEvent);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose, open]);

  // There is no point in displaying an empty tooltip.
  // So we exclude all falsy values, except 0, which is valid.
  if (!title && title !== 0) {
    open = false;
  }

  const childrenProps = {
    ...other,
    ...children.props,
    className: clsx(other.className, children.props.className),
    onTouchStart: detectTouchStart,
    ref: setChildNode,
  };

  if (process.env.NODE_ENV !== 'production') {
    childrenProps['data-mui-internal-clone-element'] = true;

    // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/rules-of-hooks -- process.env never changes
    React.useEffect(() => {
      if (childNode && !childNode.getAttribute('data-mui-internal-clone-element')) {
        console.error(
          [
            'MUI: The `children` component of the Tooltip is not forwarding its props correctly.',
            'Please make sure that props are spread on the same element that the ref is applied to.',
          ].join('\n'),
        );
      }
    }, [childNode]);
  }

  if (!disableTouchListener) {
    childrenProps.onTouchStart = handleTouchStart;
    childrenProps.onTouchEnd = handleTouchEnd;
  }

  // Hover handlers are always active
  childrenProps.onMouseOver = handleMouseOver;
  childrenProps.onMouseLeave = handleMouseLeave;

  if (!disableFocusListener) {
    childrenProps.onFocus = handleFocus;
    childrenProps.onBlur = handleBlur;
  }

  if (process.env.NODE_ENV !== 'production') {
    if (children.props.title) {
      console.error(
        [
          'MUI: You have provided a `title` prop to the child of <Tooltip />.',
          `Remove this title prop \`${children.props.title}\` or the Tooltip component.`,
        ].join('\n'),
      );
    }
  }

  // Calculate tooltip position based on childNode
  const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });

  React.useLayoutEffect(() => {
    if (open && childNode) {
      const rect = childNode.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

      setTooltipPosition({
        top: rect.top + scrollY,
        left: rect.left + scrollX + rect.width / 2,
      });
    }
  }, [open, childNode]);

  return (
    <React.Fragment>
      {React.cloneElement(children, childrenProps)}
      {open && childNode && ReactDOM.createPortal(
        <div
          id={id}
          style={{
            position: 'absolute',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'translate(-50%, -100%)',
            marginBottom: '8px',
            zIndex: 1500,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(97, 97, 97, 0.92)',
              borderRadius: '4px',
              color: '#fff',
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              padding: ignoreNonTouchEvents.current ? '8px 16px' : '4px 8px',
              fontSize: ignoreNonTouchEvents.current ? '0.875rem' : '0.6875rem',
              maxWidth: 300,
              margin: 2,
              wordWrap: 'break-word',
              fontWeight: ignoreNonTouchEvents.current ? 400 : 500,
              transformOrigin: 'center top',
              marginTop: ignoreNonTouchEvents.current ? '24px' : '14px',
            }}
          >
            {title}
          </div>
        </div>,
        document.body
      )}
    </React.Fragment>
  );
});


export default Tooltip;
