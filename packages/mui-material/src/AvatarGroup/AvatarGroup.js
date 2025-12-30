'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import chainPropTypes from '@mui/utils/chainPropTypes';
import { styled } from '../zero-styled';
import Avatar, { avatarClasses } from '../../../data-display/Avatar';
import avatarGroupClasses from './avatarGroupClasses';

const SPACINGS = {
  small: -16,
  medium: -8,
};

const AvatarGroupRoot = styled('div', {
  name: 'MuiAvatarGroup',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    return [{ [`& .${avatarGroupClasses.avatar}`]: styles.avatar }, styles.root];
  },
})({
  display: 'flex',
  flexDirection: 'row-reverse',
  [`& .${avatarClasses.root}`]: {
    border: '2px solid #ffffff',
    boxSizing: 'content-box',
    marginLeft: 'var(--AvatarGroup-spacing, -8px)',
    '&:last-child': {
      marginLeft: 0,
    },
  },
});

const AvatarGroup = React.forwardRef(function AvatarGroup(props, ref) {
  const {
    children: childrenProp,
    className,
    max = 5,
    spacing = 'medium',
    total,
    variant = 'circular',
    ...other
  } = props;
  let clampedMax = max < 2 ? 2 : max;

  const ownerState = {
    ...props,
    max,
    spacing,
    variant,
  };

  const children = React.Children.toArray(childrenProp).filter((child) => {
    return React.isValidElement(child);
  });

  const totalAvatars = total || children.length;

  if (totalAvatars === clampedMax) {
    clampedMax += 1;
  }

  clampedMax = Math.min(totalAvatars + 1, clampedMax);

  const maxAvatars = Math.min(children.length, clampedMax - 1);
  const extraAvatars = Math.max(totalAvatars - clampedMax, totalAvatars - maxAvatars, 0);
  const extraAvatarsElement = `+${extraAvatars}`;

  let marginValue;

  if (ownerState.spacing && SPACINGS[ownerState.spacing] !== undefined) {
    marginValue = SPACINGS[ownerState.spacing];
  } else if (ownerState.spacing === 0) {
    marginValue = 0;
  } else {
    marginValue = -ownerState.spacing || SPACINGS.medium;
  }

  return (
    <AvatarGroupRoot
      ownerState={ownerState}
      className={className}
      ref={ref}
      {...other}
      style={{
        '--AvatarGroup-spacing': `${marginValue}px`, // marginValue is always defined
        ...other.style,
      }}
    >
      {extraAvatars ? <Avatar variant={variant}>{extraAvatarsElement}</Avatar> : null}
      {children
        .slice(0, maxAvatars)
        .reverse()
        .map((child) => {
          return React.cloneElement(child, {
            variant: child.props.variant || variant,
          });
        })}
    </AvatarGroupRoot>
  );
});

AvatarGroup.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The avatars to stack.
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
   * Max avatars to show before +x.
   * @default 5
   */
  max: chainPropTypes(PropTypes.number, (props) => {
    if (props.max < 2) {
      return new Error(
        [
          'MUI: The prop `max` should be equal to 2 or above.',
          'A value below is clamped to 2.',
        ].join('\n'),
      );
    }

    return null;
  }),
  /**
   * Spacing between avatars.
   * @default 'medium'
   */
  spacing: PropTypes.oneOfType([PropTypes.oneOf(['medium', 'small']), PropTypes.number]),
  /**
   * @ignore
   */
  style: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The total number of avatars. Used for calculating the number of extra avatars.
   * @default children.length
   */
  total: PropTypes.number,
  /**
   * The variant to use.
   * @default 'circular'
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['circular', 'rounded', 'square']),
    PropTypes.string,
  ]),
};

export default AvatarGroup;
