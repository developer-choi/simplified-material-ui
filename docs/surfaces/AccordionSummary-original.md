# AccordionSummary 컴포넌트

> Material-UI의 AccordionSummary 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

AccordionSummary는 **Accordion의 클릭 가능한 헤더 영역을 제공하며, 확장/축소를 제어**하는 컴포넌트입니다.

> **💡 작성 주의**: AccordionSummary는 클릭 가능한 버튼 역할을 하며, AccordionContext를 통해 Accordion과 통신합니다. 실제 내용은 AccordionDetails에 표시됩니다.

### 핵심 기능
1. **클릭 가능한 헤더** - ButtonBase 기반으로 클릭 이벤트 처리
2. **AccordionContext 통신** - Accordion에서 expanded, disabled, toggle 가져오기
3. **확장 아이콘 표시** - expandIcon prop으로 아이콘 표시 및 회전 애니메이션
4. **3개 영역 구조** - Root (버튼), Content (텍스트), ExpandIconWrapper (아이콘)

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/AccordionSummary/AccordionSummary.js (259줄)
AccordionSummary (forwardRef)
  └─> RootSlot (styled ButtonBase)
       ├─> ContentSlot (styled span)
       │    └─> children (사용자 제공 텍스트/내용)
       └─> ExpandIconWrapperSlot (styled span)
            └─> expandIcon (사용자 제공 아이콘)
```

### 2. 하위 컴포넌트가 담당하는 기능

- **AccordionSummaryRoot (ButtonBase)** - 클릭 가능한 버튼, focusRipple/disableRipple 지원
- **AccordionSummaryContent (span)** - 텍스트/내용 표시, flexGrow로 공간 차지
- **AccordionSummaryExpandIconWrapper (span)** - 아이콘 표시, 확장 시 180도 회전

### 3. 주요 Styled Components

**AccordionSummaryRoot** (라인 29-65)
- ButtonBase 기반 styled component
- memoTheme()로 테마 기반 스타일
- variants로 disableGutters 조건부 스타일
- focusVisible, disabled, hover 상태 스타일

```javascript
const AccordionSummaryRoot = styled(ButtonBase, {
  name: 'MuiAccordionSummary',
  slot: 'Root',
})(
  memoTheme(({ theme }) => {
    const transition = {
      duration: theme.transitions.duration.shortest,
    };

    return {
      display: 'flex',
      width: '100%',
      minHeight: 48,
      padding: theme.spacing(0, 2),
      transition: theme.transitions.create(['min-height', 'background-color'], transition),
      // focusVisible, disabled, hover 상태 스타일
      // variants로 disableGutters 조건부 스타일
    };
  }),
);
```

**AccordionSummaryContent** (라인 67-90)
- span 기반 styled component
- flexGrow: 1로 공간 차지
- variants로 disableGutters 조건부 마진

**AccordionSummaryExpandIconWrapper** (라인 92-107)
- span 기반 styled component
- transform: rotate로 아이콘 회전
- expanded 시 180도 회전 애니메이션

### 4. Slot 시스템

**useSlot** (라인 14, 146-184)
- root, content, expandIconWrapper 3개 슬롯
- slots/slotProps prop으로 커스터마이징 가능
- externalForwardedProps로 병합
- getSlotProps로 이벤트 핸들러 병합

```javascript
const externalForwardedProps = {
  slots,
  slotProps,
};

const [RootSlot, rootSlotProps] = useSlot('root', {
  ref,
  elementType: AccordionSummaryRoot,
  externalForwardedProps: { ...externalForwardedProps, ...other },
  ownerState,
  additionalProps: {
    focusRipple: false,
    disableRipple: true,
    disabled,
    'aria-expanded': expanded,
  },
  getSlotProps: (handlers) => ({
    ...handlers,
    onClick: (event) => {
      handlers.onClick?.(event);
      handleChange(event);
    },
  }),
});

const [ContentSlot, contentSlotProps] = useSlot('content', { ... });
const [ExpandIconWrapperSlot, expandIconWrapperSlotProps] = useSlot('expandIconWrapper', { ... });
```

### 5. AccordionContext

**AccordionContext** (라인 10, 122)
- Accordion에서 expanded, disabled, disableGutters, toggle 가져오기
- toggle 함수로 확장/축소 제어
- disabled로 비활성화 상태 반영

```javascript
const { disabled = false, disableGutters, expanded, toggle } = React.useContext(AccordionContext);
const handleChange = (event) => {
  if (toggle) {
    toggle(event);
  }
  if (onClick) {
    onClick(event);
  }
};
```

### 6. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 헤더 텍스트/내용 |
| `expandIcon` | ReactNode | - | 확장 아이콘 (선택) |
| `onClick` | func | - | 추가 클릭 핸들러 (선택) |
| `className` | string | - | CSS 클래스명 |
| `focusVisibleClassName` | string | - | 포커스 시 클래스명 |
| `classes` | object | - | 클래스명 오버라이드 (테마 커스터마이징용) |
| `slots` | object | - | 슬롯 커스터마이징 (root, content, expandIconWrapper) |
| `slotProps` | object | - | 슬롯 props |
| `sx` | object\|func\|array | - | sx prop (테마 기반 스타일) |

### 7. useUtilityClasses

**useUtilityClasses** (라인 16-27)
- 4개 slots의 클래스명 자동 생성 (root, focusVisible, content, expandIconWrapper)
- expanded, disabled, disableGutters 조건부 클래스

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, expanded, disabled, disableGutters } = ownerState;

  const slots = {
    root: ['root', expanded && 'expanded', disabled && 'disabled', !disableGutters && 'gutters'],
    focusVisible: ['focusVisible'],
    content: ['content', expanded && 'expanded', !disableGutters && 'contentGutters'],
    expandIconWrapper: ['expandIconWrapper', expanded && 'expanded'],
  };

  return composeClasses(slots, getAccordionSummaryUtilityClass, classes);
};
```

### 8. 렌더링 구조

**JSX 구조** (라인 186-193)

```javascript
<RootSlot {...rootSlotProps}>
  <ContentSlot {...contentSlotProps}>{children}</ContentSlot>
  {expandIcon && (
    <ExpandIconWrapperSlot {...expandIconWrapperSlotProps}>{expandIcon}</ExpandIconWrapperSlot>
  )}
</RootSlot>
```

---

## 설계 패턴

1. **Composition (조합)**
   - children으로 텍스트/내용, expandIcon으로 아이콘 조합
   - 3개 영역으로 구성 (Root, Content, ExpandIconWrapper)

2. **Slot System**
   - useSlot()으로 root, content, expandIconWrapper 3개 슬롯 커스터마이징
   - slots/slotProps prop으로 유연한 구조 변경 가능

3. **Context Pattern**
   - AccordionContext로 Accordion과 통신
   - expanded, disabled, disableGutters, toggle 가져오기

4. **Styled Component System**
   - styled() + memoTheme()로 테마 기반 스타일
   - ButtonBase 기반으로 클릭 가능한 버튼 구현
   - variants 배열로 조건부 스타일 정의

5. **Event Handler Composition**
   - getSlotProps로 이벤트 핸들러 병합
   - onClick과 toggle 함수 조합

6. **Utility Classes**
   - useUtilityClasses로 상태별 클래스명 생성
   - composeClasses로 클래스 병합

---

## 복잡도의 이유

AccordionSummary는 **259줄**이며, 복잡한 이유는:

1. **ButtonBase 기반**
   - ButtonBase import 및 사용 (라인 9, 29)
   - focusRipple, disableRipple props
   - focusVisibleClassName 처리
   - 클릭 가능한 버튼 기능

2. **Slot 시스템**
   - useSlot() 훅 3번 호출 (root, content, expandIconWrapper)
   - slots/slotProps props 관리
   - externalForwardedProps 병합 로직
   - getSlotProps로 이벤트 핸들러 병합

3. **테마 시스템 통합**
   - useDefaultProps로 테마 기본값 병합
   - memoTheme() 3번 사용 (Root, Content, ExpandIconWrapper)
   - theme.spacing(), theme.transitions, theme.palette 사용
   - variants 배열로 조건부 스타일 (disableGutters)

4. **Styled Component 시스템**
   - styled() 3번 사용 (Root, Content, ExpandIconWrapper)
   - ownerState로 props를 스타일에 전달
   - 복잡한 스타일 정의 (focusVisible, disabled, hover, expanded)

5. **Utility Classes**
   - useUtilityClasses 함수 (라인 16-27)
   - composeClasses로 클래스 병합
   - 4개 slots의 클래스명 생성 (root, focusVisible, content, expandIconWrapper)
   - 조건부 클래스 (expanded, disabled, disableGutters)

6. **AccordionContext**
   - AccordionContext 구독
   - expanded, disabled, disableGutters, toggle 가져오기
   - toggle 함수와 onClick 이벤트 조합

7. **PropTypes 검증**
   - PropTypes 60줄 (라인 196-256)
   - JSDoc 주석 포함
   - 실제 로직보다 메타데이터가 많음

8. **3개 영역 구조**
   - Root (버튼), Content (텍스트), ExpandIconWrapper (아이콘)
   - 각 영역마다 styled component
   - 각 영역마다 useSlot 호출
   - 복잡한 계층 구조

9. **애니메이션**
   - expandIcon 회전 애니메이션 (transform: rotate)
   - minHeight 전환 애니메이션
   - margin 전환 애니메이션
   - theme.transitions 사용

---

## 비교: AccordionSummary vs 일반 button

| 기능 | AccordionSummary | `<button>` |
|------|------------------|-----------------------|
| **클릭 이벤트** | ButtonBase로 자동 | onclick 직접 관리 |
| **접근성** | aria-expanded 자동 | 수동 설정 필요 |
| **테마 통합** | theme.spacing, transitions, palette | 수동 CSS 필요 |
| **아이콘 회전** | ExpandIconWrapper로 자동 | CSS transform 수동 |
| **Slot 커스터마이징** | useSlot으로 가능 | 불가능 |
| **Context 통신** | AccordionContext로 자동 | 수동 구현 필요 |
| **스타일 상태** | expanded, disabled, hover 자동 | CSS 직접 관리 |
| **코드 복잡도** | 259줄 (재사용 가능) | 간단하지만 반복 |
