'use client';
import * as React from 'react';

// 기본 배경색 (light mode 기준, text.primary의 11% 투명도)
const defaultBgColor = 'rgba(0, 0, 0, 0.11)';

// variant별 borderRadius
const variantStyles = {
  text: {
    height: 'auto',
    transformOrigin: '0 55%',
    transform: 'scale(1, 0.60)',
    borderRadius: '4px/7px', // 기본 borderRadius 4px 기준
  },
  circular: {
    borderRadius: '50%',
  },
  rounded: {
    borderRadius: '4px',
  },
  rectangular: {
    borderRadius: 0,
  },
};

// 기본 스타일
const baseStyle = {
  display: 'block',
  backgroundColor: defaultBgColor,
  height: '1.2em',
};

/**
 * Skeleton 컴포넌트
 * 콘텐츠가 로딩되는 동안 플레이스홀더를 표시합니다.
 *
 * 참고: 인라인 스타일 단순화로 인해 애니메이션(pulse, wave)은
 * 정적 스타일로 대체되었습니다. 애니메이션이 필요하면 CSS를 직접 추가하세요.
 */
const Skeleton = React.forwardRef(function Skeleton(props, ref) {
  const {
    animation = 'pulse', // prop은 유지하되 실제 애니메이션은 미적용
    className,
    component: Component = 'span',
    height,
    style,
    variant = 'text',
    width,
    children,
    ...other
  } = props;

  const hasChildren = Boolean(children);

  // variant 스타일 가져오기
  const variantStyle = variantStyles[variant] || {};

  // 스타일 계산
  const computedStyle = {
    ...baseStyle,
    ...variantStyle,
    // hasChildren인 경우 스타일 조정
    ...(hasChildren && {
      // 자식을 숨기고 크기만 유지하려면 visibility: hidden이 자식에게 적용되어야 함
      // 인라인 스타일로는 자식 선택자 불가능, 대신 overflow: hidden 사용
    }),
    ...(hasChildren && !width && {
      maxWidth: 'fit-content',
    }),
    ...(hasChildren && !height && {
      height: 'auto',
    }),
    // width, height props
    width,
    height,
    // 사용자 style 오버라이드
    ...style,
  };

  return (
    <Component
      ref={ref}
      className={className}
      style={computedStyle}
      {...other}
    >
      {hasChildren && (
        <span style={{ visibility: 'hidden' }}>
          {children}
        </span>
      )}
    </Component>
  );
});

export default Skeleton;
