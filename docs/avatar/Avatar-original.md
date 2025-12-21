# Avatar 컴포넌트 (원본)

> Material-UI v5의 Avatar 컴포넌트 분석

---

## 무슨 기능을 하는가?

Avatar는 **사용자 프로필 이미지나 아이콘을 원형(또는 다른 모양)으로 표시하는 컴포넌트**입니다.

### 주요 기능

1. **이미지 표시**
   - src로 이미지 URL 전달
   - srcSet으로 반응형 이미지 지원
   - sizes로 이미지 크기 제어

2. **이미지 로딩 상태 관리**
   - useLoaded 훅으로 이미지 로드 성공/실패 추적
   - 서버 사이드 렌더링 지원

3. **Fallback 우선순위 시스템** (4단계)
   - 이미지 로드 성공 → img 태그 표시
   - children prop 있음 → children 표시
   - 이미지 실패 + alt → alt[0] (이니셜) 표시
   - 빈 Avatar → Person 아이콘 표시

4. **3가지 variant 지원**
   - circular (원형, 기본값)
   - rounded (둥근 사각형)
   - square (사각형)

5. **Slot 시스템**
   - root, img, fallback 각각 커스터마이징 가능
   - slots, slotProps로 세밀한 제어

6. **테마 통합**
   - useDefaultProps로 테마 기본값 적용
   - useUtilityClasses로 CSS 클래스 이름 생성
   - memoTheme으로 테마 기반 스타일 최적화

---

## 내부 구조

### 1. 컴포넌트 구조

```
Avatar (319줄)
 ├─ useDefaultProps (테마 기본값)
 ├─ useUtilityClasses (CSS 클래스 생성)
 ├─ useSlot (3회 호출)
 │   ├─ root → AvatarRoot (styled div)
 │   ├─ img → AvatarImg (styled img)
 │   └─ fallback → AvatarFallback (styled Person)
 └─ useLoaded (이미지 로딩 상태)
```

### 2. Styled Components (3개)

#### AvatarRoot (25-81줄)
```javascript
const AvatarRoot = styled('div', {
  name: 'MuiAvatar',
  slot: 'Root',
  overridesResolver: (props, styles) => [...],
})(
  memoTheme(({ theme }) => ({
    width: 40,
    height: 40,
    borderRadius: '50%',  // circular 기본값
    variants: [
      { props: { variant: 'rounded' }, style: { borderRadius: theme.shape.borderRadius } },
      { props: { variant: 'square' }, style: { borderRadius: 0 } },
      { props: { colorDefault: true }, style: { backgroundColor: theme.palette.grey[400] } },
    ],
  })),
);
```

#### AvatarImg (83-96줄)
```javascript
const AvatarImg = styled('img', {
  name: 'MuiAvatar',
  slot: 'Img',
})({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  textIndent: 10000,  // 깨진 이미지 아이콘 숨김 (Chrome)
});
```

#### AvatarFallback (98-104줄)
```javascript
const AvatarFallback = styled(Person, {
  name: 'MuiAvatar',
  slot: 'Fallback',
})({
  width: '75%',
  height: '75%',
});
```

### 3. useLoaded 훅 (106-143줄)

이미지 로딩 상태를 추적하는 커스텀 훅:

```javascript
function useLoaded({ crossOrigin, referrerPolicy, src, srcSet }) {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!src && !srcSet) return undefined;

    const image = new Image();
    image.onload = () => setLoaded('loaded');
    image.onerror = () => setLoaded('error');
    image.crossOrigin = crossOrigin;
    image.referrerPolicy = referrerPolicy;
    image.src = src;
    if (srcSet) image.srcset = srcSet;

    // cleanup
  }, [crossOrigin, referrerPolicy, src, srcSet]);

  return loaded;
}
```

**특징**:
- 서버 사이드 렌더링 지원 (img.onError 대신 Image 객체 사용)
- CORS 설정 (crossOrigin, referrerPolicy)
- 반응형 이미지 (srcSet)
- cleanup으로 메모리 누수 방지

### 4. Fallback 우선순위 로직 (221-231줄)

```javascript
if (hasImgNotFailing) {
  children = <ImgSlot {...imgSlotProps} />;
} else if (!!childrenProp || childrenProp === 0) {
  children = childrenProp;
} else if (hasImg && alt) {
  children = alt[0];  // 이니셜 표시
} else {
  children = <FallbackSlot {...fallbackSlotProps} />;  // Person 아이콘
}
```

---

## 주요 Props

### 이미지 관련 (5개)
- `src` (string): 이미지 URL
- `srcSet` (string): 반응형 이미지
- `sizes` (string): 이미지 크기
- `alt` (string): alt 텍스트 (이미지 실패 시 이니셜로도 사용)
- `imgProps` (object): img 태그에 전달할 추가 props (deprecated)

### 외형 관련 (1개)
- `variant` ('circular' | 'rounded' | 'square'): 모양 (기본: 'circular')

### 내용 관련 (1개)
- `children` (node): 이미지 없을 때 표시할 내용

### 커스터마이징 (6개)
- `component` (elementType): 루트 요소 타입 (기본: 'div')
- `slots` (object): { root?, img?, fallback? }
- `slotProps` (object): 각 슬롯의 props
- `classes` (object): CSS 클래스 오버라이드
- `className` (string): 추가 클래스
- `sx` (object): MUI의 sx prop

---

## 설계 패턴

### 1. Slot 시스템 (Material-UI v5)

Avatar는 3개의 슬롯으로 구성:
- **root**: 외부 컨테이너
- **img**: 이미지 요소
- **fallback**: Person 아이콘

각 슬롯을 커스터마이징 가능:
```javascript
<Avatar
  slots={{
    img: CustomImg,
    fallback: CustomIcon,
  }}
  slotProps={{
    img: { loading: 'lazy' },
  }}
/>
```

### 2. Styled Components + Variants

```javascript
const AvatarRoot = styled('div')(
  memoTheme(({ theme }) => ({
    // 기본 스타일
    variants: [
      { props: { variant: 'rounded' }, style: { ... } },
      { props: { variant: 'square' }, style: { ... } },
      { props: { colorDefault: true }, style: { ... } },
    ],
  }))
);
```

- **variants 배열**: props에 따라 조건부 스타일 적용
- **memoTheme**: 테마 기반 스타일 메모이제이션
- **overridesResolver**: 테마에서 스타일 오버라이드 지원

### 3. Theme Integration

```javascript
const props = useDefaultProps({ props: inProps, name: 'MuiAvatar' });
const classes = useUtilityClasses(ownerState);
```

- **useDefaultProps**: 테마에서 기본 props 가져오기
- **useUtilityClasses**: CSS 클래스 이름 생성 ('MuiAvatar-root', 'MuiAvatar-circular' 등)
- **ownerState**: 컴포넌트 상태를 styled에 전달

### 4. Image Loading Hook

서버 사이드 렌더링을 지원하기 위해 `<img onError>`가 아닌 `Image` 객체 사용:

```javascript
const image = new Image();
image.onload = () => setLoaded('loaded');
image.onerror = () => setLoaded('error');
```

---

## 복잡도의 이유

### 1. Slot 시스템 (40줄)

3개의 useSlot 호출 + props 병합:
```javascript
const [RootSlot, rootSlotProps] = useSlot('root', {
  ref,
  className: clsx(classes.root, className),
  elementType: AvatarRoot,
  externalForwardedProps: { slots, slotProps, component, ...other },
  ownerState,
});
```

**복잡도**:
- 각 슬롯마다 useSlot 호출
- externalForwardedProps 병합
- ownerState 전달
- ref 포워딩

### 2. Styled Components (60줄)

3개의 styled 컴포넌트 정의:
- name, slot, overridesResolver 설정
- memoTheme으로 테마 값 계산
- variants 배열로 조건부 스타일

### 3. 테마 통합 (20줄)

- useDefaultProps (1줄)
- useUtilityClasses 함수 정의 (11줄)
- composeClasses 호출
- getAvatarUtilityClass import

### 4. PropTypes (82줄)

15개 props의 타입 검증 + JSDoc 주석

### 5. 반응형 이미지 (10줄)

- srcSet, sizes props
- useLoaded에서 image.srcset 설정
- imgProps 병합 로직

### 6. Variant 처리 (25줄)

3가지 variant에 대한 스타일:
- circular: borderRadius 50%
- rounded: theme.shape.borderRadius
- square: borderRadius 0

### 7. CORS 지원 (5줄)

- crossOrigin, referrerPolicy props
- Image 객체에 설정

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

### Variant

```javascript
<Avatar variant="circular" src="/user.jpg" />  // 원형 (기본)
<Avatar variant="rounded" src="/user.jpg" />  // 둥근 사각형
<Avatar variant="square" src="/user.jpg" />   // 사각형
```

### 반응형 이미지

```javascript
<Avatar
  src="/user-small.jpg"
  srcSet="/user-small.jpg 1x, /user-large.jpg 2x"
  sizes="40px"
  alt="John Doe"
/>
```

### Slot 커스터마이징

```javascript
<Avatar
  src="/user.jpg"
  slots={{
    img: CustomImage,
    fallback: CustomIcon,
  }}
  slotProps={{
    img: { loading: 'lazy' },
    fallback: { color: 'primary' },
  }}
/>
```

### 테마 커스터마이징

```javascript
// theme.js
components: {
  MuiAvatar: {
    defaultProps: {
      variant: 'rounded',
    },
    styleOverrides: {
      root: {
        width: 56,
        height: 56,
      },
    },
  },
}
```

---

## 핵심 특징 요약

### 강점
1. ✅ **완전한 커스터마이징**: Slot 시스템으로 모든 부분 교체 가능
2. ✅ **테마 통합**: Material-UI 테마 시스템 완벽 지원
3. ✅ **반응형 이미지**: srcSet, sizes 지원
4. ✅ **CORS 지원**: crossOrigin, referrerPolicy
5. ✅ **SSR 지원**: Image 객체로 로딩 상태 관리
6. ✅ **3가지 variant**: circular, rounded, square
7. ✅ **4단계 fallback**: 이미지 → children → 이니셜 → Person 아이콘

### 복잡도
- **총 코드**: 319줄
- **Styled Components**: 3개 (60줄)
- **Hooks**: useDefaultProps, useUtilityClasses, useSlot (3회), useLoaded
- **PropTypes**: 82줄
- **Import**: 11개

---

## 파일 정보

- **위치**: `packages/mui-material/src/Avatar/Avatar.js`
- **라인 수**: 319줄
- **의존성**:
  - `@mui/utils/composeClasses`
  - `../zero-styled` (styled)
  - `../utils/memoTheme`
  - `../DefaultPropsProvider`
  - `../internal/svg-icons/Person`
  - `./avatarClasses`
  - `../utils/useSlot`
