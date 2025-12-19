'use client';
import * as React from 'react';
import PropTypes from 'prop-types';

// Person 아이콘 (인라인 SVG)
const PersonIcon = (props) => (
  <svg style={{ width: '75%', height: '75%' }} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

function useLoaded({ src }) {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!src) {
      return undefined;
    }

    setLoaded(false);

    let active = true;
    const image = new Image();
    image.onload = () => {
      if (!active) {
        return;
      }
      setLoaded('loaded');
    };
    image.onerror = () => {
      if (!active) {
        return;
      }
      setLoaded('error');
    };
    image.src = src;

    return () => {
      active = false;
    };
  }, [src]);

  return loaded;
}

const Avatar = React.forwardRef(function Avatar(props, ref) {
  const {
    alt,
    children: childrenProp,
    className,
    src,
    style,
    ...other
  } = props;

  const loaded = useLoaded({ src });
  const hasImg = !!src;
  const hasImgNotFailing = hasImg && loaded !== 'error';

  // Fallback 우선순위 로직 (4가지)
  let children = null;
  if (hasImgNotFailing) {
    // 1. 이미지 로드 성공
    children = (
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          color: 'transparent',
          textIndent: 10000,
        }}
      />
    );
  } else if (!!childrenProp || childrenProp === 0) {
    // 2. children prop 있음
    children = childrenProp;
  } else if (hasImg && alt) {
    // 3. 이미지 실패 + alt → 이니셜 (alt[0])
    children = alt[0];
  } else {
    // 4. 빈 Avatar → Person 아이콘
    children = <PersonIcon />;
  }

  const rootStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 40,
    height: 40,
    fontSize: 20,
    lineHeight: 1,
    borderRadius: '50%',
    overflow: 'hidden',
    userSelect: 'none',
    backgroundColor: hasImgNotFailing ? 'transparent' : '#bdbdbd',
    color: '#fff',
    ...style,
  };

  return (
    <div ref={ref} className={className} style={rootStyle} {...other}>
      {children}
    </div>
  );
});

Avatar.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Used in combination with `src` or `srcSet` to
   * provide an alt attribute for the rendered `img` element.
   */
  alt: PropTypes.string,
  /**
   * Used to render icon or text elements inside the Avatar if `src` is not set.
   * This can be an element, or just a string.
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
   * The `src` attribute for the `img` element.
   */
  src: PropTypes.string,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default Avatar;
