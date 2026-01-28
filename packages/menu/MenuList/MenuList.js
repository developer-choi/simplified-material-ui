'use client';
import * as React from 'react';

function nextItem(list, item) {
  if (list === item) {
    return list.firstChild;
  }
  if (item && item.nextElementSibling) {
    return item.nextElementSibling;
  }
  return list.firstChild;
}

function previousItem(list, item) {
  if (list === item) {
    return list.lastChild;
  }
  if (item && item.previousElementSibling) {
    return item.previousElementSibling;
  }
  return list.lastChild;
}

function moveFocus(list, currentFocus, traversalFunction) {
  let wrappedOnce = false;
  let nextFocus = traversalFunction(list, currentFocus);

  while (nextFocus) {
    // Prevent infinite loop.
    if (nextFocus === list.firstChild) {
      if (wrappedOnce) {
        return false;
      }
      wrappedOnce = true;
    }

    // Skip disabled items
    const nextFocusDisabled =
      nextFocus.disabled || nextFocus.getAttribute('aria-disabled') === 'true';

    if (!nextFocus.hasAttribute('tabindex') || nextFocusDisabled) {
      // Move to the next element.
      nextFocus = traversalFunction(list, nextFocus);
    } else {
      nextFocus.focus();
      return true;
    }
  }
  return false;
}

/**
 * A permanently displayed menu following https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/.
 * It's exposed to help customization of the [`Menu`](/material-ui/api/menu/) component if you
 * use it separately you need to move focus into the component manually. Once
 * the focus is placed inside the component it is fully keyboard accessible.
 */
const MenuList = React.forwardRef(function MenuList(props, ref) {
  const {
    children,
    className,
    onKeyDown,
    ...other
  } = props;

  const handleKeyDown = (event) => {
    const list = event.currentTarget;
    const key = event.key;
    const isModifierKeyPressed = event.ctrlKey || event.metaKey || event.altKey;

    if (isModifierKeyPressed) {
      if (onKeyDown) {
        onKeyDown(event);
      }

      return;
    }

    /**
     * @type {Element} - will always be defined since we are in a keydown handler
     * attached to an element. A keydown event is either dispatched to the activeElement
     * or document.body or document.documentElement. Only the first case will
     * trigger this specific handler.
     */
    const currentFocus = document.activeElement;

    if (key === 'ArrowDown') {
      // Prevent scroll of the page
      event.preventDefault();
      moveFocus(list, currentFocus, nextItem);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(list, currentFocus, previousItem);
    } else if (key === 'Home') {
      event.preventDefault();
      moveFocus(list, null, nextItem);
    } else if (key === 'End') {
      event.preventDefault();
      moveFocus(list, null, previousItem);
    }

    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  return (
    <ul
      role="menu"
      ref={ref}
      className={className}
      onKeyDown={handleKeyDown}
      style={{
        listStyle: 'none',
        margin: 0,
        padding: '8px 0',
        outline: 0,
      }}
      {...other}
    >
      {children}
    </ul>
  );
});

export default MenuList;
