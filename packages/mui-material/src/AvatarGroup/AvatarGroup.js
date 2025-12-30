'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import chainPropTypes from '@mui/utils/chainPropTypes';
import Avatar from '../../../data-display/Avatar';

const SPACINGS = {
  small: -16,
  medium: -8,
};

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

  if (spacing && SPACINGS[spacing] !== undefined) {
    marginValue = SPACINGS[spacing];
  } else if (spacing === 0) {
    marginValue = 0;
  } else {
    marginValue = -spacing || SPACINGS.medium;
  }

  const rootStyle = {
    display: 'flex',
    flexDirection: 'row-reverse',
    ...other.style,
  };

  const avatarStyle = {
    border: '2px solid #ffffff',
    boxSizing: 'content-box',
    marginLeft: `${marginValue}px`,
  };

  return (
    <div ref={ref} className={className} style={rootStyle} {...other}>
      {extraAvatars ? (
        <Avatar variant={variant} style={avatarStyle}>
          {extraAvatarsElement}
        </Avatar>
      ) : null}
      {children
        .slice(0, maxAvatars)
        .reverse()
        .map((child, index) => {
          return React.cloneElement(child, {
            variant: child.props.variant || variant,
            style: {
              ...avatarStyle,
              ...(index === children.length - 1 ? { marginLeft: 0 } : {}),
              ...child.props.style,
            },
          });
        })}
    </div>
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
