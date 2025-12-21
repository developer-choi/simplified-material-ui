# Avatar 컴포넌트

> Avatar를 최소한의 기능만 남기고 단순화 - 인라인 스타일로 전환

---

## 무슨 기능을 하는가?

단순화된 Avatar는 **사용자 프로필 이미지나 아이콘을 원형으로 표시하는 단순한 컴포넌트**입니다.

### 핵심 기능 (남은 것)

1. **이미지 표시**
   - src로 이미지 URL 전달
   - useLoaded 훅으로 로딩 상태 관리

2. **Fallback 우선순위 시스템** (4단계) ✅
   - 이미지 로드 성공 → img 태그 표시
   - children prop 있음 → children 표시
   - 이미지 실패 + alt → alt[0] (이니셜) 표시
   - 빈 Avatar → Person 아이콘 (인라인 SVG)

3. **기본 스타일**
   - 40×40px 원형
   - 회색 배경 (#bdbdbd)
   - flexbox 중앙 정렬

4. **ref 전달**
   - React.forwardRef 지원

### 제거된 기능

1. ❌ Slot 시스템 (slots, slotProps)
2. ❌ variant prop (rounded, square) → circular 고정
3. ❌ 반응형 이미지 (srcSet, sizes)
4. ❌ CORS 설정 (crossOrigin, referrerPolicy)
5. ❌ component prop → div 고정
6. ❌ 테마 통합 (useDefaultProps, useUtilityClasses, memoTheme)
7. ❌ styled components → 인라인 스타일
8. ❌ PropTypes (82줄)
9. ❌ classes, sx props

---

## 내부 구조

### 1. 컴포넌트 구조

```
Avatar (112줄, 원본 319줄)
 ├─ PersonIcon (인라인 SVG, 5-9줄)
 ├─ useLoaded (이미지 로딩 상태, 11-43줄)
 └─ Avatar (메인 컴포넌트, 45-110줄)
     ├─ Fallback 우선순위 로직
     └─ div (인라인 스타일)
```

### 2. PersonIcon (5-9줄)

Person 아이콘을 인라인 SVG로 직접 구현:

```javascript
const PersonIcon = (props) => (
  <svg style={{ width: '75%', height: '75%' }} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
```

**변경 이유**:
- ❌ `import Person from '../internal/svg-icons/Person'` 제거
- ❌ `styled(Person)` 제거
- ✅ 직접 SVG로 구현하여 의존성 제거

### 3. useLoaded 훅 (11-43줄)

이미지 로딩 상태를 추적 (단순화됨):

```javascript
function useLoaded({ src }) {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!src) return undefined;

    setLoaded(false);

    let active = true;
    const image = new Image();
    image.onload = () => {
      if (!active) return;
      setLoaded('loaded');
    };
    image.onerror = () => {
      if (!active) return;
      setLoaded('error');
    };
    image.src = src;

    return () => {
      active = false;
    };
  }, [src]);

  return loaded;
}
```

**원본과의 차이**:
- ❌ crossOrigin, referrerPolicy 제거
- ❌ srcSet 지원 제거
- ✅ src만 지원 (단순화)

### 4. Avatar 메인 컴포넌트 (45-110줄)

```javascript
const Avatar = React.forwardRef(function Avatar(props, ref) {
  const { alt, children: childrenProp, className, src, style, ...other } = props;

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
```

**핵심 변경**:
- ✅ **인라인 스타일**: styled 대신 style 객체
- ✅ **Fallback 유지**: 4단계 우선순위 로직 그대로 유지
- ✅ **하드코딩된 값**: 테마 대신 고정 값 (40px, #bdbdbd 등)
- ✅ **일반 div**: AvatarRoot 대신 div

---

## 커밋 히스토리로 보는 단순화 과정

### Phase 1: Slot 시스템 제거

#### [1/14] `408313d5` Slot 시스템 삭제 (-39줄)

**삭제한 것**:
- `slots`, `slotProps` props
- `useSlot()` 훅 3회 호출 (root, img, fallback)
- `externalForwardedProps` 병합 로직

**왜 불필요한가**:
- Avatar는 단순한 UI로, 고정된 구조(div > img)로도 충분
- Slot 커스터마이징보다 핵심 동작(이미지 표시, fallback) 이해가 중요

**변경**:
```javascript
// 이전
const [RootSlot, rootSlotProps] = useSlot('root', { ... });
const [ImgSlot, imgSlotProps] = useSlot('img', { ... });
const [FallbackSlot, fallbackSlotProps] = useSlot('fallback', { ... });
return <RootSlot {...rootSlotProps}>{children}</RootSlot>;

// 이후
return <AvatarRoot {...props}>{children}</AvatarRoot>;
```

---

### Phase 2: Props 단순화

#### [2/14] `e33b6018` component prop 삭제 (div 고정) (-8줄)

**삭제한 것**:
- `component` prop
- AvatarRoot의 `as={component}`

**왜 불필요한가**:
- Avatar는 항상 div로 충분
- 다형성은 Button, Link 등에서만 유용

#### [3/14] `af16612d` variant prop 삭제 (circular 고정) (-23줄)

**삭제한 것**:
- `variant` prop (rounded, square 제거)
- variants 배열에서 rounded, square 스타일
- useUtilityClasses에서 variant 처리

**왜 불필요한가**:
- Avatar는 99% circular 사용 (Material Design 표준)
- rounded/square는 borderRadius만 다름
- 학습 목적: 원형 하나로도 Avatar 충분히 이해 가능

**변경**:
```javascript
// 이전
variants: [
  { props: { variant: 'rounded' }, style: { borderRadius: 4 } },
  { props: { variant: 'square' }, style: { borderRadius: 0 } },
]

// 이후
borderRadius: '50%',  // 고정
```

---

### Phase 3: Image Props 단순화

#### [4-6/14] `47348542` imgProps, sizes, srcSet props 삭제 (-24줄)

**삭제한 것**:
- `imgProps` prop (deprecated)
- `sizes` prop
- `srcSet` prop
- useLoaded에서 srcSet 처리

**왜 불필요한가**:
- imgProps: deprecated prop으로 하위 호환성용
- sizes/srcSet: 반응형 이미지는 고급 기능, src 하나로도 충분
- 학습 목적: 기본 이미지 표시(src + alt)만 이해하면 충분

**변경**:
```javascript
// 이전
const loaded = useLoaded({ ...imgProps, src, srcSet });
const hasImg = src || srcSet;
<AvatarImg src={src} srcSet={srcSet} sizes={sizes} />

// 이후
const loaded = useLoaded({ src });
const hasImg = !!src;
<img src={src} alt={alt} />
```

---

### Phase 4: CORS 지원 제거

#### [7/14] `6e113b50` crossOrigin, referrerPolicy 지원 제거 (-5줄)

**삭제한 것**:
- useLoaded에서 crossOrigin, referrerPolicy 파라미터
- Image 객체에 설정하는 코드

**왜 불필요한가**:
- CORS 설정은 특수 케이스
- 대부분의 경우 불필요

**변경**:
```javascript
// 이전
image.crossOrigin = crossOrigin;
image.referrerPolicy = referrerPolicy;

// 이후 (제거)
```

---

### Phase 5: 테마 시스템 제거

#### [8/14] `8eb574ff` useDefaultProps 삭제 (-2줄)

**삭제한 것**:
- `useDefaultProps` 호출
- `import { useDefaultProps } from '../DefaultPropsProvider'`

**왜 불필요한가**:
- 테마 기본값보다 함수 파라미터 기본값이 더 명확

**변경**:
```javascript
// 이전
const props = useDefaultProps({ props: inProps, name: 'MuiAvatar' });

// 이후
const Avatar = React.forwardRef(function Avatar(props, ref) {
```

#### [9/14] `ae765ebf` useUtilityClasses, composeClasses 삭제 (-28줄)

**삭제한 것**:
- `useUtilityClasses` 함수 (11줄)
- `composeClasses` import
- `getAvatarUtilityClass` import
- classes 사용 (className={classes.root} 등)

**왜 불필요한가**:
- CSS 클래스 이름 생성은 스타일 시스템용
- 인라인 스타일로는 불필요

**변경**:
```javascript
// 이전
const classes = useUtilityClasses(ownerState);
<AvatarRoot className={clsx(classes.root, className)} />
<AvatarImg className={classes.img} />
<AvatarFallback className={classes.fallback} />

// 이후
<div className={className} />
<img />
<PersonIcon />
```

#### [10/14] `58ef2081` memoTheme 삭제 (-10줄)

**삭제한 것**:
- `memoTheme` 래퍼
- 테마 의존성 (theme.typography, theme.palette 등)
- 하드코딩된 값으로 대체

**왜 불필요한가**:
- 테마 값 메모이제이션보다 하드코딩이 더 단순
- 학습 목적: 고정 값으로도 Avatar 이해 가능

**변경**:
```javascript
// 이전
memoTheme(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.pxToRem(20),
  backgroundColor: theme.palette.grey[400],
}))

// 이후
{
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: 20,
  backgroundColor: '#bdbdbd',
}
```

---

### Phase 6: Style 시스템 제거

#### [11-13/14] `df186610` styled 제거 및 Avatar 인라인 스타일 전환 (Fallback 유지) (-30줄)

**삭제한 것**:
- `styled()` 함수 (AvatarRoot, AvatarImg, AvatarFallback)
- `overridesResolver`
- `variants` 배열
- `ownerState`
- Person 아이콘 import → 인라인 SVG로 변경

**왜 불필요한가**:
- Avatar 구조 배우는 것이지 CSS-in-JS 배우는 게 아님
- 인라인 스타일로도 똑같이 동작
- PersonIcon을 직접 구현하여 의존성 제거

**변경**:
```javascript
// 이전
const AvatarRoot = styled('div', {
  name: 'MuiAvatar',
  slot: 'Root',
  overridesResolver: (props, styles) => [...],
})({ ... });

const AvatarImg = styled('img', { ... })({ ... });
const AvatarFallback = styled(Person, { ... })({ ... });

// 이후
const PersonIcon = (props) => (
  <svg style={{ width: '75%', height: '75%' }} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const rootStyle = {
  position: 'relative',
  display: 'flex',
  // ...
};

<div ref={ref} className={className} style={rootStyle} {...other}>
  {children}
</div>
```

**Fallback 우선순위 유지** ✅:
```javascript
// 4단계 fallback 로직 그대로 유지
if (hasImgNotFailing) {
  children = <img ... />;
} else if (!!childrenProp || childrenProp === 0) {
  children = childrenProp;
} else if (hasImg && alt) {
  children = alt[0];  // 이니셜
} else {
  children = <PersonIcon />;  // Person 아이콘
}
```

---

### Phase 7: 메타데이터 제거

#### [14/14] `fc6342f0` PropTypes 삭제 (-38줄)

**삭제한 것**:
- `PropTypes` import
- `Avatar.propTypes` 전체 (82줄 → 44줄 감소, JSDoc 포함)

**왜 불필요한가**:
- PropTypes는 런타임 타입 검증이지 컴포넌트 로직 아님
- TypeScript 사용 시 빌드 타임 검증이 더 강력
- 프로덕션 빌드 시 자동 제거됨

---

## 원본과의 차이점

| 항목 | 원본 | 단순화 후 |
|------|------|-----------|
| **코드 라인** | 319줄 | 112줄 (65% 감소) |
| **Import 개수** | 11개 | 1개 (React만) |
| **Props 개수** | 15개 | 5개 (alt, children, className, src, style) |
| **styled 사용** | ✅ (3개: Root, Img, Fallback) | ❌ |
| **테마 통합** | ✅ (useDefaultProps, useUtilityClasses, memoTheme) | ❌ |
| **Slot 시스템** | ✅ (root, img, fallback) | ❌ |
| **variant** | circular/rounded/square | ❌ (circular 고정) |
| **반응형 이미지** | ✅ (srcSet, sizes) | ❌ |
| **CORS** | ✅ (crossOrigin, referrerPolicy) | ❌ |
| **component prop** | ✅ | ❌ (div 고정) |
| **Person 아이콘** | ✅ (import from '../internal/svg-icons/Person') | ✅ (인라인 SVG) |
| **alt[0] fallback** | ✅ (이니셜) | ✅ (유지) |
| **Fallback 우선순위** | ✅ (4단계) | ✅ (4단계 유지) |
| **PropTypes** | ✅ (82줄) | ❌ |
| **useLoaded 훅** | ✅ (37줄, CORS 지원) | ✅ (33줄, 단순화) |
| **ownerState** | ✅ | ❌ |
| **classes prop** | ✅ | ❌ |
| **sx prop** | ✅ | ❌ |

---

## 스타일 비교

### 원본 (styled components)

```javascript
const AvatarRoot = styled('div', {
  name: 'MuiAvatar',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.root,
      styles[ownerState.variant],
      ownerState.colorDefault && styles.colorDefault,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 40,
    height: 40,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.pxToRem(20),
    lineHeight: 1,
    borderRadius: '50%',
    overflow: 'hidden',
    userSelect: 'none',
    variants: [
      {
        props: { variant: 'rounded' },
        style: {
          borderRadius: (theme.vars || theme).shape.borderRadius,
        },
      },
      {
        props: { variant: 'square' },
        style: {
          borderRadius: 0,
        },
      },
      {
        props: { colorDefault: true },
        style: {
          color: (theme.vars || theme).palette.background.default,
          backgroundColor: theme.palette.grey[400],
        },
      },
    ],
  })),
);
```

**복잡도**:
- styled() API
- memoTheme 래퍼
- overridesResolver (테마 오버라이드)
- variants 배열 (조건부 스타일)
- 테마 의존성 (theme.typography, theme.palette)

### 단순화 후 (인라인 스타일)

```javascript
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
```

**장점**:
- ✅ 간결함: 스타일이 바로 보임
- ✅ 하드코딩: 테마 의존성 없음
- ✅ 조건부: 삼항 연산자로 명확
- ✅ 병합: ...style로 사용자 스타일 추가

---

## 설계 철학의 변화

### 원본: 완전한 커스터마이징

```
복잡도 ↑, 유연성 ↑
- Slot 시스템으로 모든 부분 교체 가능
- 테마 통합으로 일관성 유지
- variant로 다양한 모양 지원
- styled로 고급 스타일링
```

### 단순화 후: 핵심 기능만

```
복잡도 ↓, 이해 ↑
- 고정된 구조로 예측 가능
- 하드코딩된 값으로 명확
- 인라인 스타일로 가독성 향상
- Fallback 로직에 집중
```

---

## 사용 예시

### 기본 사용

```javascript
// 이미지
<Avatar src="/user.jpg" alt="John Doe" />

// 텍스트 (이니셜)
<Avatar>JD</Avatar>

// 아이콘
<Avatar><PersonIcon /></Avatar>

// 빈 Avatar (Person 아이콘)
<Avatar />
```

### 이미지 실패 시 이니셜

```javascript
// 이미지 로드 실패 시 "J" 표시
<Avatar src="/broken.jpg" alt="John Doe" />
```

### 커스텀 스타일

```javascript
<Avatar
  src="/user.jpg"
  style={{
    width: 56,
    height: 56,
    fontSize: 24,
  }}
/>
```

### className과 함께 사용

```javascript
<Avatar
  src="/user.jpg"
  className="custom-avatar"
  style={{ border: '2px solid blue' }}
/>
```

---

## 제한 사항

단순화로 인해 다음 기능들을 사용할 수 없습니다:

1. ❌ **variant 변경 불가**: 항상 circular (borderRadius: 50%)
2. ❌ **크기 고정**: 40×40px (style prop으로 직접 변경 필요)
3. ❌ **반응형 이미지 미지원**: srcSet, sizes 불가
4. ❌ **Person 아이콘 커스터마이징 불가**: 고정된 SVG
5. ❌ **테마 커스터마이징 불가**: 색상, 크기 등 하드코딩
6. ❌ **CORS 설정 불가**: crossOrigin, referrerPolicy 미지원
7. ❌ **Slot 교체 불가**: root, img, fallback 고정

### 해결 방법

크기 변경이 필요한 경우:
```javascript
<Avatar
  src="/user.jpg"
  style={{
    width: 56,
    height: 56,
    fontSize: 24,
  }}
/>
```

사각형이 필요한 경우:
```javascript
<Avatar
  src="/user.jpg"
  style={{ borderRadius: 0 }}
/>
```

---

## 장단점

### 장점 ✅

1. **코드 간결**: 319줄 → 112줄 (65% 감소)
2. **가독성**: 인라인 스타일로 스타일이 바로 보임
3. **의존성 최소화**: React만 사용 (11개 → 1개)
4. **이해하기 쉬움**: 복잡한 추상화 없음
5. **Fallback 로직 유지**: 4단계 우선순위 그대로 (학습 가치 높음)
6. **예외 처리 학습**: alt[0] 이니셜, Person 아이콘 fallback 유지
7. **빠른 개발**: 테마 설정 없이 바로 사용 가능

### 단점 ❌

1. **커스터마이징 제한**: variant, Slot 시스템 없음
2. **테마 미지원**: 일관성 유지 어려움
3. **반응형 이미지 미지원**: 고해상도 디스플레이 최적화 불가
4. **고정된 크기**: style prop으로 직접 변경 필요
5. **CORS 미지원**: 외부 이미지 제한적
6. **프로덕션 미적합**: 실제 서비스보다는 학습용

---

## 핵심 학습 포인트

### 1. Fallback 우선순위 시스템

```javascript
if (hasImgNotFailing) {
  children = <img src={src} alt={alt} />;
} else if (!!childrenProp || childrenProp === 0) {
  children = childrenProp;
} else if (hasImg && alt) {
  children = alt[0];  // 이니셜
} else {
  children = <PersonIcon />;  // Person 아이콘
}
```

**학습 가치**:
- 예외 처리 로직
- 우선순위 결정
- 0 체크 (`childrenProp === 0`)
- 조건부 렌더링

### 2. 이미지 로딩 상태 관리

```javascript
const image = new Image();
image.onload = () => setLoaded('loaded');
image.onerror = () => setLoaded('error');
image.src = src;
```

**학습 가치**:
- Image 객체 사용 (SSR 지원)
- useEffect cleanup
- active 플래그 (메모리 누수 방지)

### 3. 인라인 스타일 병합

```javascript
const rootStyle = {
  width: 40,
  height: 40,
  // ...
  ...style,  // 사용자 스타일 병합
};
```

**학습 가치**:
- 객체 spread로 스타일 병합
- 사용자 커스터마이징 허용

---

## 결론

단순화된 Avatar는 **Fallback 예외 처리 로직을 완벽히 유지하면서도 65%의 코드를 제거**했습니다.

- ✅ **학습 목적 달성**: 예외 처리 4단계가 핵심
- ✅ **코드 명확성**: 인라인 스타일로 가독성 향상
- ✅ **의존성 최소화**: React만 사용
- ✅ **이해하기 쉬움**: 복잡한 추상화 제거

**권장 사용처**:
- Avatar 컴포넌트 학습
- Fallback 로직 이해
- React 기본 패턴 학습
- 프로토타입 개발

---

## 파일 정보

- **위치**: `packages/mui-material/src/Avatar/Avatar.js`
- **라인 수**: 112줄 (원본 319줄 대비 65% 감소)
- **의존성**: `react` (1개, 원본 11개)
- **컴포넌트**: PersonIcon, useLoaded, Avatar
- **커밋 개수**: 10개 (14단계)
