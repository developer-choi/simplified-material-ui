# Accordion 컴포넌트

> Material-UI의 Accordion 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Accordion은 **확장 가능한 패널을 제공하여 관련 콘텐츠를 그룹화하고 숨기거나 표시**하는 컴포넌트입니다.

> **💡 작성 주의**: Accordion 자체는 패널의 확장/축소 상태 관리와 컨테이너 역할만 담당합니다. AccordionSummary(클릭 가능한 헤더)와 AccordionDetails(내용)는 별도 컴포넌트입니다.

### 핵심 기능
1. **확장/축소 상태 관리** - expanded/defaultExpanded prop으로 제어/비제어 모드 지원
2. **Collapse 애니메이션** - 부드러운 확장/축소 전환 효과
3. **AccordionContext 제공** - 하위 컴포넌트(AccordionSummary)와 상태 공유

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Accordion/Accordion.js (358줄)
Accordion (forwardRef)
  └─> AccordionRoot (styled Paper)
       ├─> AccordionHeading (styled h3)
       │    └─> AccordionContext.Provider
       │         └─> summary (AccordionSummary - 사용자 제공)
       └─> TransitionSlot (Collapse)
            └─> AccordionRegionSlot (styled div, role="region")
                 └─> children (AccordionDetails 등 - 사용자 제공)
```

### 2. 하위 컴포넌트가 담당하는 기능

- **AccordionRoot (Paper)** - 패널 컨테이너, 테두리/그림자 제공
- **AccordionHeading (h3)** - 접근성을 위한 제목 요소
- **Collapse** - 확장/축소 애니메이션
- **AccordionRegion (div)** - ARIA role="region"으로 접근성 지원

### 3. 주요 Styled Components

**AccordionRoot** (라인 36-127)
- Paper 컴포넌트 기반 styled component
- memoTheme()로 테마 기반 스타일 적용
- variants 배열로 조건부 스타일 정의 (square, disableGutters)

```javascript
const AccordionRoot = styled(Paper, {
  name: 'MuiAccordion',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      { [`& .${accordionClasses.region}`]: styles.region },
      styles.root,
      !ownerState.square && styles.rounded,
      !ownerState.disableGutters && styles.gutters,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    position: 'relative',
    transition: theme.transitions.create(['margin'], { duration: theme.transitions.duration.shortest }),
    // divider 스타일 (::before)
    // expanded 상태 스타일
    // disabled 스타일
  })),
  memoTheme(({ theme }) => ({
    variants: [
      // square: false → borderRadius 적용
      // disableGutters: false → expanded 시 마진 적용
    ],
  })),
);
```

**AccordionHeading** (라인 129-134)
- 접근성을 위한 h3 요소 (all: unset으로 스타일 초기화)

**AccordionRegion** (라인 136-139)
- role="region"으로 접근성 지원
- aria-labelledby로 summary와 연결

### 4. Slot 시스템

**useSlot** (라인 201-239)
- root, heading, transition, region 4개 슬롯
- slots/slotProps (v5), TransitionComponent/TransitionProps (deprecated) 모두 지원
- externalForwardedProps로 병합

```javascript
const backwardCompatibleSlots = { transition: TransitionComponentProp, ...slots };
const backwardCompatibleSlotProps = { transition: TransitionPropsProp, ...slotProps };

const externalForwardedProps = {
  slots: backwardCompatibleSlots,
  slotProps: backwardCompatibleSlotProps,
};

// 4개 슬롯 설정
const [RootSlot, rootProps] = useSlot('root', { ... });
const [AccordionHeadingSlot, accordionProps] = useSlot('heading', { ... });
const [TransitionSlot, transitionProps] = useSlot('transition', { elementType: Collapse, ... });
const [AccordionRegionSlot, accordionRegionProps] = useSlot('region', { ... });
```

### 5. 상태 관리 (useControlled)

**useControlled** (라인 159-164)
- 제어/비제어 모드 지원
- controlled: expandedProp 제공 시 제어 모드
- default: defaultExpanded 기본값

```javascript
const [expanded, setExpandedState] = useControlled({
  controlled: expandedProp,
  default: defaultExpanded,
  name: 'Accordion',
  state: 'expanded',
});
```

**handleChange** (라인 166-175)
- 확장/축소 토글 처리
- onChange 이벤트 핸들러 호출

### 6. AccordionContext

**AccordionContext** (라인 178-181, 244)
- AccordionSummary와 상태 공유
- expanded, disabled, disableGutters, toggle 전달

```javascript
const contextValue = React.useMemo(
  () => ({ expanded, disabled, disableGutters, toggle: handleChange }),
  [expanded, disabled, disableGutters, handleChange],
);

// Provider로 summary 래핑
<AccordionContext.Provider value={contextValue}>{summary}</AccordionContext.Provider>
```

### 7. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | Accordion 내용 (AccordionSummary + AccordionDetails) |
| `defaultExpanded` | boolean | false | 초기 확장 상태 (비제어 모드) |
| `disabled` | boolean | false | 비활성화 여부 |
| `disableGutters` | boolean | false | 확장 시 마진 제거 |
| `expanded` | boolean | - | 확장 상태 (제어 모드) |
| `onChange` | func | - | 확장/축소 이벤트 핸들러 |
| `square` | boolean | false | 모서리를 각지게 (true) / 둥글게 (false) |
| `slots` | object | - | 슬롯 커스터마이징 (root, heading, transition, region) |
| `slotProps` | object | - | 슬롯 props |
| `TransitionComponent` | elementType | - | 트랜지션 컴포넌트 (deprecated) |
| `TransitionProps` | object | - | 트랜지션 props (deprecated) |

### 8. children 검증 로직

**children PropTypes** (라인 261-275)
- 첫 번째 자식은 반드시 AccordionSummary (valid element)
- Fragment 불가
- chainPropTypes로 커스텀 검증

```javascript
children: chainPropTypes(PropTypes.node.isRequired, (props) => {
  const summary = React.Children.toArray(props.children)[0];
  if (isFragment(summary)) {
    return new Error("MUI: The Accordion doesn't accept a Fragment as a child.");
  }
  if (!React.isValidElement(summary)) {
    return new Error('MUI: Expected the first child of Accordion to be a valid element.');
  }
  return null;
});
```

### 9. 렌더링 구조

**JSX 구조** (라인 241-250)

```javascript
<RootSlot {...rootProps}>
  <AccordionHeadingSlot {...accordionProps}>
    <AccordionContext.Provider value={contextValue}>{summary}</AccordionContext.Provider>
  </AccordionHeadingSlot>
  <TransitionSlot in={expanded} timeout="auto" {...transitionProps}>
    <AccordionRegionSlot {...accordionRegionProps}>{children}</AccordionRegionSlot>
  </TransitionSlot>
</RootSlot>
```

---

## 설계 패턴

1. **Composition (조합)**
   - children으로 AccordionSummary + AccordionDetails 조합
   - React.Children.toArray로 첫 번째 자식(summary)과 나머지(children) 분리

2. **Slot System**
   - useSlot()으로 root, heading, transition, region 4개 슬롯 커스터마이징
   - slots/slotProps (v5), TransitionComponent/TransitionProps (deprecated) 병행 지원

3. **Context Pattern**
   - AccordionContext로 하위 컴포넌트(AccordionSummary)와 상태 공유
   - expanded, disabled, disableGutters, toggle 전달

4. **Styled Component System**
   - styled() + memoTheme()로 테마 기반 스타일
   - ownerState로 props를 스타일에 전달
   - variants 배열로 조건부 스타일 정의

5. **Controlled/Uncontrolled Component**
   - useControlled 훅으로 제어/비제어 모드 지원
   - expanded prop 제공 시 제어 모드, defaultExpanded로 비제어 모드

6. **Utility Classes**
   - useUtilityClasses로 상태별 클래스명 생성
   - composeClasses로 클래스 병합

---

## 복잡도의 이유

Accordion은 **358줄**이며, 복잡한 이유는:

1. **테마 시스템 통합**
   - useDefaultProps로 테마 기본값 병합
   - useUtilityClasses로 클래스명 자동 생성
   - memoTheme()로 테마 기반 스타일 메모이제이션

2. **Styled Component 시스템**
   - styled() API로 3개 컴포넌트 생성 (Root, Heading, Region)
   - overridesResolver로 테마 오버라이드 지원
   - variants 배열로 조건부 스타일 정의 (square, disableGutters)

3. **Slot 시스템**
   - useSlot() 훅 4번 호출 (root, heading, transition, region)
   - slots/slotProps와 TransitionComponent/TransitionProps 병행 지원
   - externalForwardedProps 병합 로직

4. **다양한 Props 지원**
   - 10개 이상의 props (square, disableGutters, disabled, expanded, defaultExpanded, onChange 등)
   - PropTypes 100줄 이상 (라인 253-356)
   - children 검증 로직 (Fragment, valid element 체크)

5. **Context 시스템**
   - AccordionContext 생성 및 Provider 설정
   - AccordionSummary와 상태 공유 (expanded, disabled, disableGutters, toggle)
   - useMemo로 contextValue 메모이제이션

6. **Transition/Animation**
   - Collapse 컴포넌트 사용
   - timeout="auto"로 자동 애니메이션 시간
   - TransitionComponent prop으로 커스터마이징 가능

7. **상태 관리**
   - useControlled 훅으로 제어/비제어 모드
   - handleChange 콜백으로 확장/축소 처리
   - useMemo, useCallback으로 최적화

8. **접근성 (ARIA)**
   - AccordionHeading (h3)로 제목 구조
   - AccordionRegion (role="region")
   - aria-labelledby, aria-controls 연결

9. **복잡한 스타일**
   - ::before 가상 요소로 divider 구현
   - :first-of-type, :last-of-type 선택자로 borderRadius
   - Edge 브라우저 특수 처리 (@supports -ms-ime-align)

---

## 비교: Accordion vs `<details>` HTML 요소

| 기능 | Accordion | `<details>` |
|------|----------|-------------|
| **테마 통합** | 자동 (palette, transitions, spacing) | 수동 CSS 필요 |
| **애니메이션** | Collapse로 부드러운 전환 | 브라우저 기본 (즉시 토글) |
| **스타일 변형** | square, disableGutters 등 prop으로 쉽게 | CSS 직접 관리 |
| **Context 공유** | AccordionContext로 자동 | 수동 구현 필요 |
| **제어/비제어** | expanded/defaultExpanded로 양쪽 지원 | open 속성만 (비제어 위주) |
| **접근성** | ARIA 속성 자동 (role, aria-labelledby) | 브라우저 기본 지원 |
| **커스터마이징** | slots, sx, styled 등 다양 | CSS만 가능 |
| **코드 복잡도** | 358줄 (재사용 가능) | 간단하지만 기능 제한적 |
