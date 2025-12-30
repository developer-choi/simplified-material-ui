'use client';
import * as React from 'react';
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

export default AvatarGroup;
