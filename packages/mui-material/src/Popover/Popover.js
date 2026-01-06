'use client';
import * as React from 'react';
import debounce from '../utils/debounce';
import ownerDocument from '../utils/ownerDocument';
import ownerWindow from '../utils/ownerWindow';
import Modal from '../../../modal/Modal';
import PaperBase from '../../../surfaces/Paper';

export function getOffsetTop(rect, vertical) {
  if (vertical === 'bottom') {
    return rect.height;
  }
  // 'top' or default: 0
  return 0;
}

export function getOffsetLeft(rect, horizontal) {
  if (horizontal === 'right') {
    return rect.width;
  }
  // 'left' or default: 0
  return 0;
}

function getTransformOriginValue(transformOrigin) {
  return `${transformOrigin.horizontal} ${transformOrigin.vertical}`;
}

function resolveAnchorEl(anchorEl) {
  return typeof anchorEl === 'function' ? anchorEl() : anchorEl;
}

const Popover = React.forwardRef(function Popover(props, ref) {
  const {
    anchorEl,
    anchorOrigin = {
      vertical: 'top',
      horizontal: 'left',
    },
    children,
    className,
    marginThreshold = 16,
    onClose,
    open,
    PaperProps: PaperPropsProp = {}, // TODO: remove in v7
    transformOrigin = {
      vertical: 'top',
      horizontal: 'left',
    },
    ...other
  } = props;

  const paperRef = React.useRef();

  // Returns the top/left offset of the position
  // to attach to on the anchor element (or body if none is provided)
  const getAnchorOffset = React.useCallback(() => {
    const resolvedAnchorEl = resolveAnchorEl(anchorEl);

    // If an anchor element wasn't provided, just use the parent body element of this Popover
    const anchorElement =
      resolvedAnchorEl && resolvedAnchorEl.nodeType === 1
        ? resolvedAnchorEl
        : ownerDocument(paperRef.current).body;
    const anchorRect = anchorElement.getBoundingClientRect();

    if (process.env.NODE_ENV !== 'production') {
      const box = anchorElement.getBoundingClientRect();

      if (
        process.env.NODE_ENV !== 'test' &&
        box.top === 0 &&
        box.left === 0 &&
        box.right === 0 &&
        box.bottom === 0
      ) {
        console.warn(
          [
            'MUI: The `anchorEl` prop provided to the component is invalid.',
            'The anchor element should be part of the document layout.',
            "Make sure the element is present in the document or that it's not display none.",
          ].join('\n'),
        );
      }
    }

    return {
      top: anchorRect.top + getOffsetTop(anchorRect, anchorOrigin.vertical),
      left: anchorRect.left + getOffsetLeft(anchorRect, anchorOrigin.horizontal),
    };
  }, [anchorEl, anchorOrigin.horizontal, anchorOrigin.vertical]);

  // Returns the base transform origin using the element
  const getTransformOrigin = React.useCallback(
    (elemRect) => {
      return {
        vertical: getOffsetTop(elemRect, transformOrigin.vertical),
        horizontal: getOffsetLeft(elemRect, transformOrigin.horizontal),
      };
    },
    [transformOrigin.horizontal, transformOrigin.vertical],
  );

  const getPositioningStyle = React.useCallback(
    (element) => {
      const elemRect = {
        width: element.offsetWidth,
        height: element.offsetHeight,
      };

      // Get the transform origin point on the element itself
      const elemTransformOrigin = getTransformOrigin(elemRect);

      // Get the offset of the anchoring element
      const anchorOffset = getAnchorOffset();

      // Calculate element positioning
      let top = anchorOffset.top - elemTransformOrigin.vertical;
      let left = anchorOffset.left - elemTransformOrigin.horizontal;
      const bottom = top + elemRect.height;
      const right = left + elemRect.width;

      // Use the parent window of the anchorEl if provided
      const containerWindow = ownerWindow(resolveAnchorEl(anchorEl));

      // Window thresholds taking required margin into account
      const heightThreshold = containerWindow.innerHeight - marginThreshold;
      const widthThreshold = containerWindow.innerWidth - marginThreshold;

      // Check if the vertical axis needs shifting
      if (marginThreshold !== null && top < marginThreshold) {
        const diff = top - marginThreshold;

        top -= diff;

        elemTransformOrigin.vertical += diff;
      } else if (marginThreshold !== null && bottom > heightThreshold) {
        const diff = bottom - heightThreshold;

        top -= diff;

        elemTransformOrigin.vertical += diff;
      }

      if (process.env.NODE_ENV !== 'production') {
        if (elemRect.height > heightThreshold && elemRect.height && heightThreshold) {
          console.error(
            [
              'MUI: The popover component is too tall.',
              `Some part of it can not be seen on the screen (${
                elemRect.height - heightThreshold
              }px).`,
              'Please consider adding a `max-height` to improve the user-experience.',
            ].join('\n'),
          );
        }
      }

      // Check if the horizontal axis needs shifting
      if (marginThreshold !== null && left < marginThreshold) {
        const diff = left - marginThreshold;
        left -= diff;
        elemTransformOrigin.horizontal += diff;
      } else if (right > widthThreshold) {
        const diff = right - widthThreshold;
        left -= diff;
        elemTransformOrigin.horizontal += diff;
      }

      return {
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
        transformOrigin: getTransformOriginValue(elemTransformOrigin),
      };
    },
    [anchorEl, getAnchorOffset, getTransformOrigin, marginThreshold],
  );

  const setPositioningStyles = React.useCallback(() => {
    const element = paperRef.current;

    if (!element) {
      return;
    }

    const positioning = getPositioningStyle(element);

    if (positioning.top !== null) {
      element.style.setProperty('top', positioning.top);
    }
    if (positioning.left !== null) {
      element.style.left = positioning.left;
    }
    element.style.transformOrigin = positioning.transformOrigin;
  }, [getPositioningStyle]);

  React.useEffect(() => {
    if (open) {
      setPositioningStyles();
    }
  });

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleResize = debounce(() => {
      setPositioningStyles();
    });

    const containerWindow = ownerWindow(resolveAnchorEl(anchorEl));
    containerWindow.addEventListener('resize', handleResize);
    return () => {
      handleResize.clear();
      containerWindow.removeEventListener('resize', handleResize);
    };
  }, [anchorEl, open, setPositioningStyles]);

  const container = anchorEl ? ownerDocument(resolveAnchorEl(anchorEl)).body : undefined;

  return (
    <Modal
      ref={ref}
      container={container}
      open={open}
      onClose={onClose}
      className={className}
      hideBackdrop={true}
      {...other}
    >
      <PaperBase
        ref={paperRef}
        elevation={8}
        style={{
          position: 'absolute',
          overflowY: 'auto',
          overflowX: 'hidden',
          minWidth: 16,
          minHeight: 16,
          maxWidth: 'calc(100% - 32px)',
          maxHeight: 'calc(100% - 32px)',
          outline: 0,
        }}
      >
        {children}
      </PaperBase>
    </Modal>
  );
});

export default Popover;
