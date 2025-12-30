# Paper 컴포넌트

> Material-UI의 Paper 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Paper는 **Material Design의 표면(surface)을 나타내는 컨테이너** 컴포넌트입니다.

> **💡 작성 주의**: Paper 자체는 elevation(그림자)로 깊이감을 표현하는 역할만 합니다. 내부 콘텐츠 배치는 상위 컴포넌트의 책임입니다.

### 핵심 기능

1. **Elevation 시스템** - elevation (0-24) prop으로 그림자 깊이 조절
2. **Variant 변형** - elevation (그림자) vs outlined (테두리) 두 가지 스타일
3. **Dark mode overlay** - 어두운 배경에서 elevation에 따라 밝은 오버레이 추가
4. **Shape 조절** - square prop으로 모서리 둥글기 조절
5. **Component 다형성** - component prop으로 루트 엘리먼트 변경 (div 기본)

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Paper/Paper.js (202줄)
Paper (forwardRef)
  ├─ useDefaultProps (테마에서 기본 props 가져오기)
  ├─ useTheme (테마 객체 가져오기)
  ├─ ownerState 생성 (props 상태 객체)
  ├─ useUtilityClasses (CSS 클래스 이름 생성)
  │
  └─ PaperRoot (styled div)
       └─ children
```

### 2. Styled Components

**PaperRoot** (30-74줄)
- `styled('div')` 기반
- overridesResolver: 8줄 (테마 오버라이드 지원)
- memoTheme: 테마 값 메모이제이션
- variants 배열: 3개 블록 (square, outlined, elevation)

```javascript
const PaperRoot = styled('div', {
  name: 'MuiPaper',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.root,
      styles[ownerState.variant],
      !ownerState.square && styles.rounded,
      ownerState.variant === 'elevation' && styles[`elevation${ownerState.elevation}`],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    backgroundColor: (theme.vars || theme).palette.background.paper,
    color: (theme.vars || theme).palette.text.primary,
    transition: theme.transitions.create('box-shadow'),
    variants: [
      {
        props: ({ ownerState }) => !ownerState.square,
        style: { borderRadius: theme.shape.borderRadius },
      },
      {
        props: { variant: 'outlined' },
        style: {
          border: `1px solid ${(theme.vars || theme).palette.divider}`,
        },
      },
      {
        props: { variant: 'elevation' },
        style: {
          boxShadow: 'var(--Paper-shadow)',
          backgroundImage: 'var(--Paper-overlay)',
        },
      },
    ],
  })),
);
```

### 3. Elevation 시스템

**shadows 배열** (packages/mui-material/src/styles/shadows.js)
- 25개 shadow 정의 (elevation 0-24)
- Material Design spec 기반
- createShadow 함수로 생성

```javascript
// elevation 0: 'none'
// elevation 1: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
// elevation 2: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)'
// ...
// elevation 24: '...' (가장 큰 그림자)
```

**CSS 변수 방식** (117-132줄)
```javascript
style={{
  ...(variant === 'elevation' && {
    '--Paper-shadow': (theme.vars || theme).shadows[elevation],
    ...(theme.vars && {
      '--Paper-overlay': theme.vars.overlays?.[elevation],
    }),
    ...(!theme.vars &&
      theme.palette.mode === 'dark' && {
        '--Paper-overlay': `linear-gradient(${alpha(
          '#fff',
          getOverlayAlpha(elevation),
        )}, ${alpha('#fff', getOverlayAlpha(elevation))})`,
      }),
  }),
  ...other.style,
}}
```

### 4. Dark Mode Overlay

**getOverlayAlpha 함수** (packages/mui-material/src/styles/getOverlayAlpha.ts)
- elevation 값에 따라 오버레이 투명도 계산
- 수식: elevation < 1 ? `5.11916 * elevation²` : `4.5 * Math.log(elevation + 1) + 2`
- 결과: 0.000 ~ 0.016 범위의 alpha 값

**동작 방식**:
1. Dark mode에서 elevation > 0일 때
2. 흰색 gradient를 backgroundImage로 추가
3. elevation이 높을수록 더 밝아짐 (깊이감 표현)

### 5. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { square, elevation, variant, classes } = ownerState;

  const slots = {
    root: [
      'root',
      variant,
      !square && 'rounded',
      variant === 'elevation' && `elevation${elevation}`,
    ],
  };

  return composeClasses(slots, getPaperUtilityClass, classes);
};
```

**생성되는 클래스**:
- `MuiPaper-root` (항상)
- `MuiPaper-rounded` (square가 false일 때)
- `MuiPaper-elevation` 또는 `MuiPaper-outlined` (variant)
- `MuiPaper-elevation0` ~ `MuiPaper-elevation24` (elevation variant일 때)

### 6. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 내부 콘텐츠 |
| `className` | string | - | CSS 클래스 |
| `component` | elementType | 'div' | 루트 엘리먼트 타입 |
| `elevation` | number (0-24) | 1 | 그림자 깊이 |
| `square` | boolean | false | true면 모서리 사각형 |
| `variant` | 'elevation' \| 'outlined' | 'elevation' | 스타일 변형 |
| `classes` | object | - | 유틸리티 클래스 오버라이드 |
| `style` | object | - | 인라인 스타일 |
| `sx` | object | - | 시스템 스타일 prop |

### 7. Component Polymorphism

```javascript
<PaperRoot
  as={component}  // component prop으로 HTML 태그 변경
  ownerState={ownerState}
  className={clsx(classes.root, className)}
  ref={ref}
  {...other}
  style={{...}}
/>
```

**사용 예**:
```javascript
<Paper component="section">내용</Paper>  // <section> 태그로 렌더링
<Paper component={Link}>링크</Paper>    // Link 컴포넌트로 렌더링
```

---

## 설계 패턴

1. **Styled Components** (CSS-in-JS)
   - styled() API로 PaperRoot 정의
   - memoTheme으로 테마 값 메모이제이션
   - variants 배열로 조건부 스타일
   - overridesResolver로 테마 오버라이드 지원

2. **Theme 시스템**
   - useDefaultProps로 테마에서 기본 props 가져오기
   - useTheme으로 테마 객체 접근
   - useUtilityClasses로 CSS 클래스 이름 생성
   - theme.palette, theme.shadows, theme.transitions 활용

3. **CSS Variables** (CSS 커스텀 속성)
   - `--Paper-shadow`: elevation에 따른 box-shadow 값
   - `--Paper-overlay`: dark mode 오버레이 gradient
   - 런타임 동적 값 주입

4. **Component Polymorphism**
   - component prop으로 루트 요소 변경
   - TypeScript generic으로 타입 안전성 보장
   - `as` prop으로 styled component에 전달

---

## 복잡도의 이유

Paper는 **202줄**이며, 복잡한 이유는:

1. **Elevation 시스템** (30줄)
   - 25개 elevation 레벨 (0-24)
   - CSS 변수로 동적 shadow 주입
   - theme.shadows 의존

2. **Dark Mode Overlay** (20줄)
   - getOverlayAlpha 함수 호출 (복잡한 수식)
   - theme.palette.mode === 'dark' 체크
   - linear-gradient 생성 (alpha 계산)
   - theme.vars.overlays 처리

3. **Variant 시스템** (30줄)
   - elevation vs outlined 두 가지 스타일
   - useUtilityClasses에서 variant 처리
   - overridesResolver에서 variant 클래스
   - styled variants 배열

4. **Square/Rounded 처리** (15줄)
   - useUtilityClasses에서 조건부 'rounded' 클래스
   - overridesResolver에서 조건부 처리
   - variants에서 조건부 borderRadius

5. **Theme 통합** (40줄)
   - useDefaultProps (테마 기본 props)
   - useTheme (테마 객체)
   - useUtilityClasses (13줄 - CSS 클래스 생성)
   - memoTheme (테마 메모이제이션)
   - theme.palette, theme.shadows, theme.transitions, theme.shape 사용

6. **Styled Components** (45줄)
   - styled() API (30-74줄)
   - overridesResolver (8줄)
   - variants 배열 (3개 블록)
   - ownerState 생성 및 전달

7. **PropTypes** (62줄)
   - 런타임 타입 검증
   - chainPropTypes (elevation과 variant 검증)
   - integerPropType (elevation 0-24)
   - JSDoc 주석 포함

8. **Component Polymorphism** (10줄)
   - `as={component}` 처리
   - TypeScript 타입 복잡도
   - ownerState에 component 포함

9. **개발 모드 경고** (10줄)
   - theme.shadows[elevation] 존재 여부 체크
   - console.error로 유효하지 않은 elevation 경고

---

## 비교: Paper vs Card

Material-UI에서 Paper와 Card는 유사하지만 다른 용도를 가집니다.

| 기능 | Paper | Card |
|------|-------|------|
| **목적** | 일반적인 표면 | 카드형 콘텐츠 컨테이너 |
| **Elevation** | ✅ 0-24 | ✅ 기본값: 1 |
| **Variant** | ✅ elevation, outlined | ✅ elevation, outlined |
| **하위 컴포넌트** | ❌ 없음 | ✅ CardHeader, CardContent, CardActions |
| **Semantic HTML** | ✅ component prop | ✅ component prop |
| **복잡도** | 202줄 | ~150줄 |

**핵심 차이점**:
- Paper는 "빈 표면"으로 모든 콘텐츠에 사용
- Card는 Paper를 확장하여 카드 레이아웃 제공
- Card는 내부적으로 Paper 사용 (variant, elevation 상속)

---

## Material Design Elevation

Paper의 elevation 시스템은 Material Design의 핵심 개념입니다.

### Elevation 레벨 가이드

| Elevation | 용도 | 예시 컴포넌트 |
|-----------|------|--------------|
| 0 | 평면 | Disabled Button |
| 1 | 카드, 칩 | Card, Chip |
| 2 | 버튼 (resting) | Button |
| 3 | Refresh indicator | - |
| 4 | App bar | AppBar |
| 6 | FAB (resting) | Floating Action Button |
| 8 | Bottom navigation | BottomNavigation |
| 16 | Modal, Dialog | Modal, Dialog |
| 24 | 최상단 (드물게 사용) | - |

**실제 사용**:
- 0-8: 대부분의 UI 요소 (90% 이상)
- 9-15: 드물게 사용
- 16-24: 모달, 팝업 등 최상단 레이어

**시각적 효과**:
- elevation 증가 → shadow 크기와 blur 증가
- Dark mode에서는 추가로 밝은 overlay 적용
- 깊이감으로 UI 계층 구조 표현

