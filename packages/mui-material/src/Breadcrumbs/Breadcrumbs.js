'use client';
import * as React from 'react';
import { isFragment } from 'react-is';
import { styled } from '../zero-styled';
import Typography from '../Typography';
import BreadcrumbCollapsed from './BreadcrumbCollapsed';

const BreadcrumbsRoot = styled(Typography, {
  name: 'MuiBreadcrumbs',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    return [{ [`& .${breadcrumbsClasses.li}`]: styles.li }, styles.root];
  },
})({});

const BreadcrumbsOl = styled('ol', {
  name: 'MuiBreadcrumbs',
  slot: 'Ol',
})({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  padding: 0,
  margin: 0,
  listStyle: 'none',
});

const BreadcrumbsSeparator = styled('li', {
  name: 'MuiBreadcrumbs',
  slot: 'Separator',
})({
  display: 'flex',
  userSelect: 'none',
  marginLeft: 8,
  marginRight: 8,
});

function insertSeparators(items, separator, ownerState) {
  return items.reduce((acc, current, index) => {
    if (index < items.length - 1) {
      acc = acc.concat(
        current,
        <BreadcrumbsSeparator
          aria-hidden
          key={`separator-${index}`}
          ownerState={ownerState}
        >
          {separator}
        </BreadcrumbsSeparator>,
      );
    } else {
      acc.push(current);
    }

    return acc;
  }, []);
}

const Breadcrumbs = React.forwardRef(function Breadcrumbs(props, ref) {
  const {
    children,
    className,
    component = 'nav',
    expandText = 'Show path',
    itemsAfterCollapse = 1,
    itemsBeforeCollapse = 1,
    maxItems = 8,
    separator = '/',
    ...other
  } = props;

  const [expanded, setExpanded] = React.useState(false);

  const ownerState = {
    ...props,
    component,
    expanded,
    expandText,
    itemsAfterCollapse,
    itemsBeforeCollapse,
    maxItems,
    separator,
  };

  const listRef = React.useRef(null);
  const renderItemsBeforeAndAfter = (allItems) => {
    const handleClickExpand = () => {
      setExpanded(true);

      // The clicked element received the focus but gets removed from the DOM.
      // Let's keep the focus in the component after expanding.
      // Moving it to the <ol> or <nav> does not cause any announcement in NVDA.
      // By moving it to some link/button at least we have some announcement.
      const focusable = listRef.current.querySelector('a[href],button,[tabindex]');
      if (focusable) {
        focusable.focus();
      }
    };

    // This defends against someone passing weird input, to ensure that if all
    // items would be shown anyway, we just show all items without the EllipsisItem
    if (itemsBeforeCollapse + itemsAfterCollapse >= allItems.length) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          [
            'MUI: You have provided an invalid combination of props to the Breadcrumbs.',
            `itemsAfterCollapse={${itemsAfterCollapse}} + itemsBeforeCollapse={${itemsBeforeCollapse}} >= maxItems={${maxItems}}`,
          ].join('\n'),
        );
      }
      return allItems;
    }

    return [
      ...allItems.slice(0, itemsBeforeCollapse),
      <BreadcrumbCollapsed
        aria-label={expandText}
        key="ellipsis"
        onClick={handleClickExpand}
      />,
      ...allItems.slice(allItems.length - itemsAfterCollapse, allItems.length),
    ];
  };

  const allItems = React.Children.toArray(children)
    .filter((child) => {
      if (process.env.NODE_ENV !== 'production') {
        if (isFragment(child)) {
          console.error(
            [
              "MUI: The Breadcrumbs component doesn't accept a Fragment as a child.",
              'Consider providing an array instead.',
            ].join('\n'),
          );
        }
      }

      return React.isValidElement(child);
    })
    .map((child, index) => (
      <li key={`child-${index}`}>
        {child}
      </li>
    ));

  return (
    <BreadcrumbsRoot
      ref={ref}
      component={component}
      color="textSecondary"
      className={className}
      ownerState={ownerState}
      {...other}
    >
      <BreadcrumbsOl ref={listRef} ownerState={ownerState}>
        {insertSeparators(
          expanded || (maxItems && allItems.length <= maxItems)
            ? allItems
            : renderItemsBeforeAndAfter(allItems),
          separator,
          ownerState,
        )}
      </BreadcrumbsOl>
    </BreadcrumbsRoot>
  );
});

export default Breadcrumbs;
