# ButtonGroup 컴포넌트

> ButtonGroup 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

ButtonGroup는 **여러 Button을 그룹으로 묶어서 일관된 스타일을 적용하고, Context로 props를 전달하는 컨테이너** 컴포넌트입니다.

### 핵심 기능
1. **버튼 그룹화** - 여러 버튼을 하나의 단위로 시각적으로 묶음
2. **Context 패턴** - ButtonGroupContext로 자식 Button들에게 공통 props 전달 (color, variant, size 등)
3. **위치 기반 스타일** - 첫 번째, 중간, 마지막 버튼에 다른 border-radius 적용
4. **다양한 조합** - variant (3) × orientation (2) × color (7) = 42가지 스타일 조합

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/ButtonGroup/ButtonGroup.js (445줄)

ButtonGroup (forwardRef)
  └─> ButtonGroupRoot (styled('div'))
       └─> ButtonGroupContext.Provider
            └─> ButtonGroupButtonContext.Provider (각 자식마다)
                 └─> Button (children)
```

**파일 구조**:
- `ButtonGroup.js` - 메인 컴포넌트
- `buttonGroupClasses.ts` - utility classes (147줄, 44개 클래스)
- `ButtonGroupContext.ts` - 자식 Button에게 props 전달
- `ButtonGroupButtonContext.ts` - 각 버튼의 위치 클래스 전달

### 2. ButtonGroupRoot styled 컴포넌트

```javascript
const ButtonGroupRoot = styled('div', {
  name: 'MuiButtonGroup',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    display: 'inline-flex',
    borderRadius: (theme.vars || theme).shape.borderRadius,
    variants: [
      // variant별 스타일 (contained, outlined, text)
      // orientation별 스타일 (horizontal, vertical)
      // color별 스타일 (7가지)
      // ... 총 20개 이상의 variants 배열
    ],
    // ...
  })),
);
```

**styled 시스템 복잡도**:
- 240줄의 스타일 정의
- variants 배열 20개 이상
- theme.palette 동적 순회 및 필터링
- overridesResolver: 8개 스타일 조합 병합

### 3. useUtilityClasses 훅

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, color, disabled, disableElevation, fullWidth, orientation, variant } =
    ownerState;

  const slots = {
    root: [
      'root',
      variant,
      orientation,
      fullWidth && 'fullWidth',
      disableElevation && 'disableElevation',
      `color${capitalize(color)}`,
    ],
    grouped: [
      'grouped',
      `grouped${capitalize(orientation)}`,
      `grouped${capitalize(variant)}`,
      `grouped${capitalize(variant)}${capitalize(orientation)}`,
      `grouped${capitalize(variant)}${capitalize(color)}`,
      disabled && 'disabled',
    ],
    firstButton: ['firstButton'],
    lastButton: ['lastButton'],
    middleButton: ['middleButton'],
  };

  return composeClasses(slots, getButtonGroupUtilityClass, classes);
};
```

**className 생성 로직**:
- ownerState 기반으로 조건부 클래스 생성
- `grouped` 슬롯: 최대 6개 클래스 조합
- capitalize로 클래스 이름 생성 (예: `groupedOutlinedHorizontal`)

### 4. ButtonGroupContext

```javascript
// ButtonGroup.js 내부
const context = React.useMemo(
  () => ({
    className: classes.grouped,
    color,
    disabled,
    disableElevation,
    disableFocusRipple,
    disableRipple,
    fullWidth,
    size,
    variant,
  }),
  [color, disabled, disableElevation, disableFocusRipple, disableRipple, fullWidth, size, variant, classes.grouped],
);

return (
  <ButtonGroupContext.Provider value={context}>
    {/* children */}
  </ButtonGroupContext.Provider>
);
```

**Context 역할**:
- 자식 Button들이 useContext로 이 값을 가져감
- 모든 Button에게 동일한 color, variant, size 적용
- className (classes.grouped)으로 그룹 내 버튼 스타일 적용

### 5. ButtonGroupButtonContext

```javascript
const getButtonPositionClassName = (index) => {
  const isFirstButton = index === 0;
  const isLastButton = index === childrenCount - 1;

  if (isFirstButton && isLastButton) {
    return '';  // 버튼이 하나뿐이면 클래스 없음
  }
  if (isFirstButton) {
    return classes.firstButton;
  }
  if (isLastButton) {
    return classes.lastButton;
  }
  return classes.middleButton;
};

validChildren.map((child, index) => (
  <ButtonGroupButtonContext.Provider
    key={index}
    value={getButtonPositionClassName(index)}
  >
    {child}
  </ButtonGroupButtonContext.Provider>
));
```

**위치 클래스 전달**:
- 각 버튼마다 별도의 Context Provider
- 첫 번째 버튼: `classes.firstButton`
- 중간 버튼: `classes.middleButton`
- 마지막 버튼: `classes.lastButton`
- Button 컴포넌트가 이 값을 사용하여 border-radius 조정

### 6. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | Button 컴포넌트들 |
| `variant` | 'contained' \| 'outlined' \| 'text' | 'outlined' | 버튼 스타일 |
| `orientation` | 'horizontal' \| 'vertical' | 'horizontal' | 배치 방향 |
| `color` | 'inherit' \| 'primary' \| 'secondary' \| ... | 'primary' | 색상 (7가지) |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | 크기 |
| `disabled` | boolean | false | 비활성화 |
| `disableElevation` | boolean | false | 그림자 제거 |
| `disableFocusRipple` | boolean | false | 포커스 ripple 제거 |
| `disableRipple` | boolean | false | ripple 제거 |
| `fullWidth` | boolean | false | 전체 너비 |
| `component` | elementType | 'div' | 루트 요소 |

### 7. variants 배열 예시

```javascript
variants: [
  // variant별
  {
    props: { variant: 'contained' },
    style: { boxShadow: theme.shadows[2] },
  },
  // orientation별
  {
    props: { orientation: 'vertical' },
    style: {
      flexDirection: 'column',
      // border-radius 조정
    },
  },
  // variant + orientation 조합
  {
    props: { variant: 'outlined', orientation: 'horizontal' },
    style: {
      // 중간 버튼의 왼쪽 margin -1px (border 겹치기)
    },
  },
  // variant + color 조합 (동적 생성)
  ...Object.entries(theme.palette)
    .filter(createSimplePaletteValueFilter())
    .flatMap(([color]) => [
      {
        props: { variant: 'text', color },
        style: {
          borderColor: theme.alpha(theme.palette[color].main, 0.5),
        },
      },
    ]),
]
```

**variants 복잡도**:
- 20개 이상의 variants 객체
- theme.palette 동적 순회로 색상별 variants 생성
- variant × orientation × color 조합

---

## 설계 패턴

1. **Context Pattern (Context 패턴)**
   - ButtonGroupContext로 자식 Button들에게 공통 props 전달
   - ButtonGroupButtonContext로 각 버튼의 위치 정보 전달
   - 중첩된 Context (2단계)

2. **Compound Component Pattern (복합 컴포넌트 패턴)**
   - ButtonGroup과 Button이 함께 작동
   - Button이 Context를 통해 부모의 설정을 자동으로 상속

3. **Position-based Styling (위치 기반 스타일링)**
   - 배열 인덱스로 첫 번째/마지막 판단
   - 각 위치마다 다른 border-radius 적용
   - CSS로 인접 선택자 사용하지 않고 JavaScript로 제어

4. **CSS-in-JS with styled-engine**
   - styled('div')로 ButtonGroupRoot 생성
   - memoTheme으로 theme 메모이제이션
   - variants 배열로 조건부 스타일

---

## 복잡도의 이유

ButtonGroup는 **445줄**이며, 복잡한 이유는:

1. **variants 배열 (240줄)**
   - variant (3) × orientation (2) × color (7) = 42가지 조합
   - theme.palette 동적 순회 및 필터링
   - 각 조합마다 다른 border, margin, border-radius

2. **useUtilityClasses 시스템 (76줄)**
   - 44개의 utility classes
   - ownerState 기반 조건부 클래스 생성
   - composeClasses로 클래스 병합

3. **overridesResolver (48줄)**
   - 8개 스타일 슬롯 병합
   - variant, orientation, color 조합별 스타일

4. **Context 이중 구조**
   - ButtonGroupContext: 공통 props 전달
   - ButtonGroupButtonContext: 위치별 className 전달
   - useMemo로 Context 최적화

5. **getValidReactChildren**
   - null, undefined, boolean 제거
   - React.isValidElement로 검증

6. **PropTypes (88줄)**
   - 11개 props × 각 prop별 상세 정의

7. **Theme 통합**
   - useDefaultProps로 theme defaults 병합
   - theme.shape.borderRadius
   - theme.palette 동적 접근
   - theme.shadows

---

## 비교: 일반 div vs ButtonGroup

| 기능 | `<div>{buttons}</div>` | `<ButtonGroup>{buttons}</ButtonGroup>` |
|------|----------------------|----------------------------------------|
| **기본 레이아웃** | 별도 CSS 필요 | ✅ inline-flex 자동 |
| **첫/마지막 border-radius** | CSS 선택자 필요 | ✅ Context로 자동 |
| **공통 props 전달** | 각 Button에 직접 전달 | ✅ Context로 자동 전달 |
| **border 겹치기** | margin 수동 조정 | ✅ 자동 처리 |
| **variant 일관성** | 각 Button마다 지정 | ✅ 그룹 단위 지정 |
| **번들 크기** | 0 KB | ~15 KB |

**ButtonGroup의 장점**:
- 코드 간결성 (각 Button에 props 반복 불필요)
- 자동 스타일링 (border-radius, margin)
- 일관성 보장 (모든 버튼이 같은 variant, color, size)

**ButtonGroup의 단점**:
- 학습 곡선 (Context 이해 필요)
- 번들 크기 증가
- 복잡한 내부 구조
