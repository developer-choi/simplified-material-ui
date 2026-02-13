# CardMedia 컴포넌트

> Material-UI의 CardMedia 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

CardMedia는 **카드에 이미지, 비디오, 오디오 등의 미디어 콘텐츠를 표시**하는 컴포넌트입니다.

### 핵심 기능

1. **Component 다형성** - component prop으로 HTML 요소 타입 지정 (div, img, video 등)
2. **이미지 표시 방식 선택** - background-image (div) 또는 img 요소
3. **미디어 타입별 스타일** - MEDIA_COMPONENTS, IMAGE_COMPONENTS로 구분
4. **image/src prop 처리** - 타입에 따라 backgroundImage 또는 src attribute로 변환

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/CardMedia/CardMedia.js (143줄)

CardMedia
  ├─ useDefaultProps (테마에서 기본 props 가져오기)
  ├─ useUtilityClasses (CSS 클래스 이름 생성)
  │
  └─ CardMediaRoot (styled 'div')
       ├─ as={component} (다형성)
       ├─ style (조건부 스타일)
       ├─ role="img" (접근성)
       └─ src attribute (media 컴포넌트일 때)
```

### 2. Styled Component (1개)

#### CardMediaRoot (21-49줄)

```javascript
const CardMediaRoot = styled('div', {
  name: 'MuiCardMedia',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    const { isMediaComponent, isImageComponent } = ownerState;

    return [styles.root, isMediaComponent && styles.media, isImageComponent && styles.img];
  },
})({
  display: 'block',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  variants: [
    {
      props: { isMediaComponent: true },
      style: {
        width: '100%',
      },
    },
    {
      props: { isImageComponent: true },
      style: {
        objectFit: 'cover',
      },
    },
  ],
});
```

**특징**:
- `display: block` - 블록 레벨 요소
- **기본 스타일** (background-image 방식):
  - `backgroundSize: cover` - 이미지가 컨테이너를 꽉 채움
  - `backgroundRepeat: no-repeat` - 반복 없음
  - `backgroundPosition: center` - 중앙 정렬
- **variants로 조건부 스타일**:
  - `isMediaComponent: true` → `width: 100%` (video, audio 등)
  - `isImageComponent: true` → `objectFit: cover` (img, picture)

### 3. 미디어 타입 상수

```javascript
const MEDIA_COMPONENTS = ['video', 'audio', 'picture', 'iframe', 'img'];
const IMAGE_COMPONENTS = ['picture', 'img'];
```

- **MEDIA_COMPONENTS**: src attribute를 사용하는 HTML 요소들
- **IMAGE_COMPONENTS**: objectFit 스타일이 적용되는 이미지 요소들

### 4. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `component` | elementType | `'div'` | 루트 엘리먼트 타입 |
| `image` | string | - | 배경 이미지 URL (background-image) |
| `src` | string | - | 미디어 소스 URL (src attribute) |
| `children` | node | - | 자식 요소 (오버레이 등) |
| `className` | string | - | 추가 CSS 클래스 |
| `style` | object | - | 인라인 스타일 |
| `classes` | object | - | CSS 클래스 오버라이드 |

**Props 사용 규칙**:
- `children`, `image`, `src`, `component` 중 하나 이상 필수
- `image` - div 등 비미디어 요소에서 배경 이미지로 사용
- `src` - img, video 등 미디어 요소에서 소스로 사용

### 5. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, isMediaComponent, isImageComponent } = ownerState;

  const slots = {
    root: ['root', isMediaComponent && 'media', isImageComponent && 'img'],
  };

  return composeClasses(slots, getCardMediaUtilityClass, classes);
};
```

- root 슬롯에 조건부로 'media', 'img' 클래스 추가
- 타입별로 다른 CSS 클래스 적용 가능

---

## 렌더링 로직

```javascript
const CardMedia = React.forwardRef(function CardMedia(inProps, ref) {
  // 1. 테마 기본 props
  const props = useDefaultProps({ props: inProps, name: 'MuiCardMedia' });

  // 2. props 구조 분해
  const { children, className, component = 'div', image, src, style, ...other } = props;

  // 3. 미디어 타입 판별
  const isMediaComponent = MEDIA_COMPONENTS.includes(component);

  // 4. 스타일 병합 (image → backgroundImage 변환)
  const composedStyle =
    !isMediaComponent && image ? { backgroundImage: `url("${image}")`, ...style } : style;

  // 5. ownerState
  const ownerState = {
    ...props,
    component,
    isMediaComponent,
    isImageComponent: IMAGE_COMPONENTS.includes(component),
  };

  // 6. CSS 클래스 생성
  const classes = useUtilityClasses(ownerState);

  // 7. 렌더링
  return (
    <CardMediaRoot
      className={clsx(classes.root, className)}
      as={component}  // 다형성
      role={!isMediaComponent && image ? 'img' : undefined}  // 접근성
      ref={ref}
      style={composedStyle}
      ownerState={ownerState}
      src={isMediaComponent ? image || src : undefined}  // src attribute
      {...other}
    >
      {children}
    </CardMediaRoot>
  );
});
```

---

## 설계 패턴

### 1. Component Polymorphism Pattern

```javascript
<CardMediaRoot as={component} ... />
```

- `as` prop으로 렌더링될 HTML 요소 타입 변경
- div, img, video, audio, picture, iframe 등 자유롭게 선택

### 2. Conditional Prop Mapping Pattern

```javascript
// image prop 처리
const composedStyle =
  !isMediaComponent && image ? { backgroundImage: `url("${image}")`, ...style } : style;

// src prop 처리
src={isMediaComponent ? image || src : undefined}
```

- **비미디어 컴포넌트 (div 등)**: image → backgroundImage 스타일
- **미디어 컴포넌트 (img, video 등)**: image 또는 src → src attribute

### 3. Type-based Styling Pattern

```javascript
const MEDIA_COMPONENTS = ['video', 'audio', 'picture', 'iframe', 'img'];
const IMAGE_COMPONENTS = ['picture', 'img'];

const isMediaComponent = MEDIA_COMPONENTS.includes(component);
const isImageComponent = IMAGE_COMPONENTS.includes(component);

// styled variants
variants: [
  { props: { isMediaComponent: true }, style: { width: '100%' } },
  { props: { isImageComponent: true }, style: { objectFit: 'cover' } },
]
```

- 타입에 따라 다른 스타일 적용
- video/audio → width: 100%
- img/picture → objectFit: cover

### 4. Accessibility Pattern

```javascript
role={!isMediaComponent && image ? 'img' : undefined}
```

- 배경 이미지로 표시되는 경우 role="img" 추가
- 스크린 리더가 이미지로 인식하도록 함

---

## 복잡도의 이유

CardMedia는 **143줄**이며, 복잡한 이유는:

1. **styled 컴포넌트** (약 29줄)
   - CardMediaRoot
   - overridesResolver로 조건부 스타일 병합
   - variants로 타입별 스타일

2. **조건부 로직** (약 10줄)
   - isMediaComponent, isImageComponent 판별
   - image → backgroundImage 변환
   - src prop 조건부 전달

3. **useUtilityClasses + composeClasses** (약 8줄)
   - 조건부 CSS 클래스 생성

4. **PropTypes** (약 54줄, 87-140)
   - 런타임 타입 검증
   - chainPropTypes로 복잡한 validation

실제 핵심 로직은 **40줄 미만**입니다.

---

## 사용 예시

### 기본 사용 (배경 이미지)

```javascript
<Card>
  <CardMedia
    image="/image.jpg"
    style={{ height: 140 }}
  />
  <CardContent>
    <Typography>카드 내용</Typography>
  </CardContent>
</Card>
```

### img 요소 사용

```javascript
<Card>
  <CardMedia
    component="img"
    height="140"
    image="/image.jpg"
    alt="설명"
  />
  <CardContent>
    <Typography>카드 내용</Typography>
  </CardContent>
</Card>
```

### video 요소 사용

```javascript
<Card>
  <CardMedia
    component="video"
    src="/video.mp4"
    controls
    style={{ height: 300 }}
  />
</Card>
```

### iframe (YouTube 임베드)

```javascript
<Card>
  <CardMedia
    component="iframe"
    src="https://www.youtube.com/embed/..."
    style={{ height: 315 }}
  />
</Card>
```

### 오버레이 추가

```javascript
<Card>
  <CardMedia
    image="/image.jpg"
    style={{ height: 200, position: 'relative' }}
  >
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        bgcolor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '10px',
      }}
    >
      <Typography>오버레이 텍스트</Typography>
    </Box>
  </CardMedia>
</Card>
```

---

## 핵심 동작 원리

### image vs src prop 처리

1. **component가 MEDIA_COMPONENTS가 아닐 때 (div 등)**:
   ```javascript
   // image prop → backgroundImage 스타일
   style={{ backgroundImage: `url("${image}")` }}
   // src prop 무시
   ```

2. **component가 MEDIA_COMPONENTS일 때 (img, video 등)**:
   ```javascript
   // image 또는 src → src attribute
   <img src={image || src} />
   // backgroundImage 적용 안 됨
   ```

### 타입별 스타일 적용

1. **일반 div (기본)**:
   - `display: block`
   - `backgroundSize: cover`
   - `backgroundRepeat: no-repeat`
   - `backgroundPosition: center`

2. **video, audio (isMediaComponent)**:
   - 위 스타일 + `width: 100%`

3. **img, picture (isImageComponent)**:
   - 위 스타일 + `objectFit: cover`

### 접근성 처리

- div + image → `role="img"` 추가
- 배경 이미지를 의미있는 이미지로 마킹
- 스크린 리더가 인식 가능
