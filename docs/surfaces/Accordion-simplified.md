# Accordion 컴포넌트

> 358줄에서 77줄로 단순화된 확장/축소 패널 컴포넌트

---

## 무슨 기능을 하는가?

수정된 Accordion은 **확장 가능한 패널을 제공하여 관련 콘텐츠를 그룹화하고 즉시 숨기거나 표시**하는 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **확장/축소 상태 관리** - expanded/defaultExpanded prop으로 제어/비제어 모드 지원
2. **AccordionContext로 하위 컴포넌트와 통신** - expanded, toggle 함수 전달
3. **조건부 렌더링** - expanded 상태에 따라 즉시 표시/숨김 (애니메이션 없음)

> **💡 작성 주의**: Accordion 자체는 패널의 확장/축소 상태 관리와 컨테이너 역할만 담당합니다. AccordionSummary(클릭 가능한 헤더)와 AccordionDetails(내용)는 별도 컴포넌트입니다.

---

## 핵심 학습 포인트

### 1. useControlled로 제어/비제어 모드 지원

```javascript
const [expanded, setExpandedState] = useControlled({
  controlled: expandedProp,
  default: defaultExpanded,
  name: 'Accordion',
  state: 'expanded',
});

const handleChange = React.useCallback(
  (event) => {
    setExpandedState(!expanded);
    if (onChange) {
      onChange(event, !expanded);
    }
  },
  [expanded, onChange, setExpandedState],
);
```

**학습 가치**:
- useControlled 훅으로 제어/비제어 컴포넌트 패턴 구현
- expanded prop 제공 시 제어 모드, defaultExpanded만 제공 시 비제어 모드
- React의 표준 패턴 학습 (input의 value/defaultValue와 유사)

### 2. AccordionContext로 하위 컴포넌트와 통신

```javascript
const [summary, ...children] = React.Children.toArray(childrenProp);

const contextValue = React.useMemo(
  () => ({ expanded, toggle: handleChange }),
  [expanded, handleChange],
);

<h3 style={{ all: 'unset' }}>
  <AccordionContext.Provider value={contextValue}>
    {summary}
  </AccordionContext.Provider>
</h3>
```

**학습 가치**:
- React.Children.toArray로 children 분리 (summary와 나머지)
- Context API로 상태와 함수를 하위 컴포넌트(AccordionSummary)에 전달
- useMemo로 contextValue 메모이제이션 (불필요한 리렌더링 방지)
- AccordionSummary가 useContext(AccordionContext)로 expanded, toggle 받음

### 3. 조건부 렌더링 (애니메이션 없음)

```javascript
{expanded && (
  <div
    aria-labelledby={summary.props.id}
    id={summary.props['aria-controls']}
    role="region"
  >
    {children}
  </div>
)}
```

**학습 가치**:
- 즉시 표시/숨김 (Collapse 애니메이션 제거)
- ARIA 속성으로 접근성 유지 (role="region", aria-labelledby)
- 단순한 조건부 렌더링으로 충분

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/surfaces/Accordion/Accordion.js (77줄, 원본 358줄)
Accordion (forwardRef)
  └─> Paper
       ├─> h3 (style={{ all: 'unset' }})
       │    └─> AccordionContext.Provider (value={{ expanded, toggle }})
       │         └─> summary (AccordionSummary가 Context에서 값 받음)
       └─> div (role="region", expanded일 때만 렌더링)
            └─> children
```

### 2. Slot 시스템 제거

> **💡 원본과의 차이**:
> - ❌ `slots` prop 제거 → 고정된 Paper, h3, div 사용
> - ❌ `slotProps` prop 제거
> - ❌ `useSlot()` 훅 제거
> - ❌ `externalForwardedProps` 객체 제거

### 3. Transition/Animation 제거

> **💡 원본과의 차이**:
> - ❌ `TransitionComponent` prop 제거
> - ❌ `Collapse` import 제거
> - ✅ 조건부 렌더링으로 즉시 표시/숨김

```javascript
// 원본: Collapse 애니메이션
<TransitionSlot in={expanded} timeout="auto" {...transitionProps}>
  <AccordionRegionSlot {...accordionRegionProps}>{children}</AccordionRegionSlot>
</TransitionSlot>

// 수정본: 즉시 표시/숨김
{expanded && (
  <div role="region">{children}</div>
)}
```

### 4. Styled Component 시스템 제거

> **💡 원본과의 차이**:
> - ❌ `styled()` API 제거
> - ❌ `memoTheme()` 제거
> - ❌ `ownerState` 제거
> - ✅ Paper + 인라인 style로 대체

```javascript
// 원본: styled component (100줄)
const AccordionRoot = styled(Paper, { ... })(memoTheme(({ theme }) => ({ ... })));

// 수정본: Paper + 인라인 style
<Paper
  style={{
    position: 'relative',
    overflowAnchor: 'none',
    margin: expanded ? '16px 0' : '0',
  }}
>
```

### 5. Props (4개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | Accordion 내용 (AccordionSummary + AccordionDetails) |
| `className` | string | - | CSS 클래스명 |
| `defaultExpanded` | boolean | false | 초기 확장 상태 (비제어 모드) |
| `expanded` | boolean | - | 확장 상태 (제어 모드) |
| `onChange` | func | - | 확장/축소 이벤트 핸들러 (event, expanded) => void |

---

## 커밋 히스토리로 보는 단순화 과정

Accordion은 **11개의 커밋**을 통해 단순화되었습니다 (AccordionContext 복원 포함).

### 1단계: Slot 시스템 제거
- `cac29d23` - [Accordion 단순화 1/10] Slot 시스템 제거

**왜 불필요한가**:
- **학습 목적**: 커스터마이징 배우는 게 아니라 Accordion의 핵심 개념(확장/축소 패널)을 배우는 것
- **복잡도**: useSlot() 훅 4번 호출, props 병합 로직 복잡
- **일관성**: Badge, Dialog, Modal 등 모든 단순화된 컴포넌트에서 제거

### 2단계: Transition/Animation 제거
- `7b3def2c` - [Accordion 단순화 2/10] Transition/Animation 제거

**왜 불필요한가**:
- **학습 목적**: Accordion의 핵심은 "확장/축소 패널"이지 "애니메이션"이 아님
- **복잡도**: Collapse 컴포넌트, TransitionComponent, TransitionProps
- **대안**: 즉시 표시/숨김으로도 충분히 동작

### 3단계: square prop 제거
- `6e17ca6a` - [Accordion 단순화 3/10] square prop 제거

**왜 불필요한가**:
- **학습 목적**: 하나의 스타일만 있어도 개념 이해 충분
- **복잡도**: variants 배열, first-of-type/last-of-type 선택자, Edge 브라우저 특수 처리
- **현실**: 대부분 기본값(둥근 모서리) 사용

### 4단계: disableGutters prop 제거
- `36f676ff` - [Accordion 단순화 4/10] disableGutters prop 제거

**왜 불필요한가**:
- **학습 목적**: Accordion의 핵심은 "확장/축소"이지 "마진 조정"이 아님
- **복잡도**: variants 배열로 조건부 마진
- **현실**: 기본 마진으로 충분

### 5단계: disabled prop 제거
- `6f1edff2` - [Accordion 단순화 5/10] disabled prop 제거

**왜 불필요한가**:
- **학습 목적**: Accordion의 핵심 동작(확장/축소) 이해에 불필요
- **복잡도**: disabled 스타일, AccordionContext로 하위 컴포넌트에 전달
- **현실**: 대부분 활성 상태 사용

### 6단계: useDefaultProps 제거
- `de3465fe` - [Accordion 단순화 6/10] useDefaultProps 제거

**왜 불필요한가**:
- **학습 목적**: 테마 시스템은 Material-UI 전체의 주제로, Accordion 학습에는 과함
- **복잡도**: 테마 Context 구독, props 병합 로직
- **대안**: 함수 파라미터 기본값으로 충분

### 7단계: useUtilityClasses, composeClasses 제거
- `4e689395` - [Accordion 단순화 7/10] useUtilityClasses, composeClasses 제거

**왜 불필요한가**:
- **학습 목적**: 클래스명 생성 시스템은 테마 오버라이드용
- **복잡도**: useUtilityClasses 함수, composeClasses 호출, slots 객체
- **대안**: className prop만으로 충분

### 8단계: Styled component 시스템 제거
- `3a44d879` - [Accordion 단순화 8/10] Styled component 시스템 제거

**왜 불필요한가**:
- **학습 목적**: Accordion 구조 배우는 것이지 CSS-in-JS 배우는 게 아님
- **복잡도**: styled() API, memoTheme(), overridesResolver, variants, ownerState
- **대안**: Paper + 인라인 style로 충분

### 9단계: AccordionContext 간소화
- `a8cca3c5` - [Accordion 단순화 9/10] AccordionContext 제거 (일시적)
- `59940396` - Revert "[Accordion 단순화 9/10] AccordionContext 제거" (복원)

**결과**: AccordionContext는 **유지**
- **이유**: AccordionSummary, AccordionDetails 등 하위 컴포넌트와 통신 필요
- **간소화**: disabled, disableGutters 제거하여 Context 전달 값 최소화 (expanded, toggle만 전달)
- **학습 가치**: Context API를 통한 컴포넌트 간 통신 패턴 학습

### 10단계: PropTypes 제거
- `388caf22` - [Accordion 단순화 10/10] PropTypes 제거

**왜 불필요한가**:
- **학습 목적**: PropTypes는 타입 검증 도구이지 Accordion 로직이 아님
- **복잡도**: PropTypes 100줄 이상, JSDoc 주석 수십 줄
- **대안**: TypeScript를 사용하면 빌드 타임에 검증 (더 강력)

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 358줄 | 77줄 (78% 감소) |
| **Props 개수** | 10개 | 4개 |
| **Slot 시스템** | ✅ | ❌ |
| **Transition** | ✅ Collapse | ❌ 즉시 표시/숨김 |
| **Styled components** | ✅ | ❌ Paper + 인라인 style |
| **Context** | ✅ 4개 값 전달 | ✅ 2개 값 전달 (간소화) |
| **PropTypes** | ✅ 100줄+ | ❌ |
| **테마 시스템** | ✅ | ❌ |

---

## 학습 후 다음 단계

Accordion을 이해했다면:

1. **AccordionSummary** - Accordion의 클릭 가능한 헤더 컴포넌트
2. **AccordionDetails** - Accordion의 내용 컴포넌트
3. **useControlled 훅** - 제어/비제어 컴포넌트 패턴 구현
4. **실전 응용** - FAQ, 설정 패널, 탐색 메뉴

**예시: 기본 사용**
```javascript
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function FAQ() {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        질문 1
      </AccordionSummary>
      <AccordionDetails>
        답변 1
      </AccordionDetails>
    </Accordion>
  );
}
```

**예시: 제어 모드**
```javascript
function ControlledAccordion() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Accordion
      expanded={expanded}
      onChange={(event, isExpanded) => setExpanded(isExpanded)}
    >
      <AccordionSummary>질문</AccordionSummary>
      <AccordionDetails>답변</AccordionDetails>
    </Accordion>
  );
}
```

---

## 코드 비교: 원본 vs 수정본

### 전체 구조 비교

**원본 (358줄)**:
```javascript
// 복잡한 import들
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import composeClasses from '@mui/utils/composeClasses';
import accordionClasses, { getAccordionUtilityClass } from './accordionClasses';
import AccordionContext from './AccordionContext';
import Collapse from '../Collapse';
import useSlot from '../utils/useSlot';

// 100줄+ styled components 정의
const AccordionRoot = styled(Paper, { ... })(memoTheme(...));
const AccordionHeading = styled('h3', { ... })({ ... });
const AccordionRegion = styled('div', { ... })({ ... });

// 컴포넌트 본문 (70줄)
const Accordion = React.forwardRef(function Accordion(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiAccordion' });
  const { slots, slotProps, TransitionComponent, ... } = props;

  const ownerState = { ...props, square, disabled, disableGutters, expanded };
  const classes = useUtilityClasses(ownerState);

  const [RootSlot, rootProps] = useSlot('root', { ... });
  const [TransitionSlot, transitionProps] = useSlot('transition', { ... });

  return (
    <RootSlot {...rootProps}>
      <AccordionHeadingSlot {...accordionProps}>
        <AccordionContext.Provider value={contextValue}>
          {summary}
        </AccordionContext.Provider>
      </AccordionHeadingSlot>
      <TransitionSlot in={expanded} timeout="auto" {...transitionProps}>
        <AccordionRegionSlot {...accordionRegionProps}>
          {children}
        </AccordionRegionSlot>
      </TransitionSlot>
    </RootSlot>
  );
});

// 100줄+ PropTypes
Accordion.propTypes = { ... };
```

**수정본 (77줄)**:
```javascript
// 최소한의 import
import * as React from 'react';
import Paper from '../Paper';
import useControlled from '../utils/useControlled';
import AccordionContext from './AccordionContext';

// 컴포넌트 본문만 (73줄)
const Accordion = React.forwardRef(function Accordion(
  { children: childrenProp, className, defaultExpanded = false,
    expanded: expandedProp, onChange, ...other },
  ref,
) {
  const [expanded, setExpandedState] = useControlled({
    controlled: expandedProp,
    default: defaultExpanded,
    name: 'Accordion',
    state: 'expanded',
  });

  const handleChange = React.useCallback(
    (event) => {
      setExpandedState(!expanded);
      if (onChange) {
        onChange(event, !expanded);
      }
    },
    [expanded, onChange, setExpandedState],
  );

  const [summary, ...children] = React.Children.toArray(childrenProp);
  const contextValue = React.useMemo(
    () => ({ expanded, toggle: handleChange }),
    [expanded, handleChange],
  );

  return (
    <Paper
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        overflowAnchor: 'none',
        margin: expanded ? '16px 0' : '0',
      }}
      {...other}
    >
      <h3 style={{ all: 'unset' }}>
        <AccordionContext.Provider value={contextValue}>
          {summary}
        </AccordionContext.Provider>
      </h3>
      {expanded && (
        <div
          aria-labelledby={summary.props.id}
          id={summary.props['aria-controls']}
          role="region"
        >
          {children}
        </div>
      )}
    </Paper>
  );
});
```

### 핵심 차이점

| 측면 | 원본 | 수정본 |
|------|------|--------|
| **구조** | styled components로 계층화 | Paper + 인라인 style |
| **통신** | AccordionContext (4개 값) | AccordionContext (2개 값) |
| **애니메이션** | Collapse 컴포넌트 | 조건부 렌더링 |
| **커스터마이징** | slots, slotProps | 없음 |
| **스타일** | memoTheme, ownerState | 인라인 style |

---

## 제거된 기능의 대안

필요시 제거된 기능을 직접 구현하는 방법입니다.

### 1. Collapse 애니메이션 복원

```javascript
import Collapse from '@mui/material/Collapse';

const Accordion = React.forwardRef(function Accordion(props, ref) {
  // ... 기존 로직 ...

  return (
    <Paper ref={ref} style={{ ... }}>
      <h3 style={{ all: 'unset' }}>{/* summary */}</h3>

      {/* 조건부 렌더링 대신 Collapse 사용 */}
      <Collapse in={expanded} timeout="auto">
        <div role="region">
          {children}
        </div>
      </Collapse>
    </Paper>
  );
});
```

### 2. disabled 기능 복원

```javascript
const Accordion = React.forwardRef(function Accordion(
  { disabled = false, ...props },
  ref,
) {
  const handleChange = React.useCallback(
    (event) => {
      if (disabled) return; // disabled면 아무 동작 안 함

      setExpandedState(!expanded);
      if (onChange) {
        onChange(event, !expanded);
      }
    },
    [disabled, expanded, onChange, setExpandedState],
  );

  return (
    <Paper
      style={{
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        backgroundColor: disabled ? '#f5f5f5' : 'transparent',
      }}
    >
      {/* ... */}
    </Paper>
  );
});
```

### 3. square prop 복원

```javascript
const Accordion = React.forwardRef(function Accordion(
  { square = false, ...props },
  ref,
) {
  return (
    <Paper
      style={{
        borderRadius: square ? 0 : undefined, // Paper 기본 borderRadius 사용
      }}
    >
      {/* ... */}
    </Paper>
  );
});
```

### 4. 커스텀 TransitionComponent

```javascript
import Slide from '@mui/material/Slide';

const Accordion = React.forwardRef(function Accordion(
  { TransitionComponent = Collapse, ...props },
  ref,
) {
  return (
    <Paper>
      <h3>{/* summary */}</h3>

      <TransitionComponent in={expanded} timeout="auto">
        <div role="region">{children}</div>
      </TransitionComponent>
    </Paper>
  );
});

// 사용
<Accordion TransitionComponent={Slide}>
  {/* ... */}
</Accordion>
```

---

## TypeScript 타입 정의

단순화된 Accordion의 TypeScript 타입 정의입니다.

```typescript
import * as React from 'react';
import { PaperProps } from '../Paper';

export interface AccordionProps extends Omit<PaperProps, 'onChange'> {
  /**
   * Accordion 내용 (AccordionSummary + AccordionDetails)
   */
  children: React.ReactNode;

  /**
   * CSS 클래스명
   */
  className?: string;

  /**
   * 초기 확장 상태 (비제어 모드)
   * @default false
   */
  defaultExpanded?: boolean;

  /**
   * 확장 상태 (제어 모드)
   */
  expanded?: boolean;

  /**
   * 확장/축소 이벤트 핸들러
   */
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
}

declare const Accordion: React.ForwardRefExoticComponent<
  AccordionProps & React.RefAttributes<HTMLDivElement>
>;

export default Accordion;
```

### 사용 예시 (TypeScript)

```typescript
import React, { useState } from 'react';
import Accordion, { AccordionProps } from '@mui/material/Accordion';

// 1. 비제어 모드
const UncontrolledExample: React.FC = () => {
  return (
    <Accordion defaultExpanded>
      {/* ... */}
    </Accordion>
  );
};

// 2. 제어 모드
const ControlledExample: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleChange: AccordionProps['onChange'] = (event, isExpanded) => {
    console.log('Accordion expanded:', isExpanded);
    setExpanded(isExpanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange}>
      {/* ... */}
    </Accordion>
  );
};

// 3. ref 사용
const RefExample: React.FC = () => {
  const accordionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (accordionRef.current) {
      console.log('Accordion element:', accordionRef.current);
    }
  }, []);

  return (
    <Accordion ref={accordionRef}>
      {/* ... */}
    </Accordion>
  );
};
```

---

## 디버깅 팁

### 흔한 실수와 해결 방법

#### 1. "children[0] is not a valid React element"

**문제**:
```javascript
<Accordion>
  {/* Fragment나 null을 첫 번째 자식으로 전달 */}
  <>Summary</>
  <div>Details</div>
</Accordion>
```

**원인**: 첫 번째 자식(summary)이 유효한 React 요소가 아님

**해결**:
```javascript
<Accordion>
  <AccordionSummary>Summary</AccordionSummary>
  <AccordionDetails>Details</AccordionDetails>
</Accordion>
```

#### 2. onClick과 onChange가 모두 호출됨

**문제**:
```javascript
<Accordion onChange={(e, expanded) => console.log('changed')}>
  <AccordionSummary onClick={() => console.log('clicked')}>
    Summary
  </AccordionSummary>
  <AccordionDetails>Details</AccordionDetails>
</Accordion>

// 클릭 시: "clicked", "changed" 둘 다 출력
```

**원인**: AccordionSummary 내부에서 onClick과 toggle 함수를 모두 호출

**해결**: 정상 동작입니다. onClick과 onChange는 다른 용도입니다.
- `onClick`: AccordionSummary의 클릭 이벤트 (커스텀 동작)
- `onChange`: Accordion의 확장/축소 상태 변경 (Context의 toggle 호출)

AccordionSummary 내부 동작:
```javascript
const { toggle } = React.useContext(AccordionContext);
const handleChange = (event) => {
  if (toggle) toggle(event);    // Accordion onChange 호출
  if (onClick) onClick(event);  // 커스텀 onClick 호출
};
```

#### 3. expanded가 변경되지 않음 (제어 모드)

**문제**:
```javascript
const [expanded, setExpanded] = useState(false);

<Accordion expanded={expanded}>
  {/* onChange 없음 */}
</Accordion>
```

**원인**: 제어 모드(`expanded` prop 제공)인데 `onChange`가 없어서 상태 업데이트 안 됨

**해결**:
```javascript
<Accordion
  expanded={expanded}
  onChange={(e, isExpanded) => setExpanded(isExpanded)}
>
```

#### 4. style이 적용되지 않음

**문제**:
```javascript
<Accordion style={{ backgroundColor: 'red' }}>
  {/* 배경색이 적용되지 않음 */}
</Accordion>
```

**원인**: Accordion 내부에서 `style` prop을 덮어씀

**해결**: className이나 sx prop 사용
```javascript
<Accordion className="my-accordion">
  {/* CSS: .my-accordion { background-color: red; } */}
</Accordion>
```

#### 5. ARIA 경고 (aria-labelledby, aria-controls)

**문제**:
```javascript
// Console: Warning: The region does not have aria-labelledby
<Accordion>
  <AccordionSummary>Summary</AccordionSummary>
  <AccordionDetails>Details</AccordionDetails>
</Accordion>
```

**원인**: AccordionSummary에 `id` prop이 없거나, `aria-controls` prop이 없음

**해결**:
```javascript
<Accordion>
  <AccordionSummary
    id="accordion-summary"
    aria-controls="accordion-content"
  >
    Summary
  </AccordionSummary>
  <AccordionDetails>Details</AccordionDetails>
</Accordion>
```

#### 6. margin이 예상과 다름

**문제**: expanded일 때 margin이 적용되지 않거나 이상함

**원인**: CSS의 margin collapse 또는 부모 컨테이너의 스타일

**해결**:
```javascript
// 부모 컨테이너에 padding 추가
<div style={{ padding: '1px' }}>
  <Accordion>{/* ... */}</Accordion>
  <Accordion>{/* ... */}</Accordion>
</div>

// 또는 Accordion에 직접 스타일 덮어쓰기
<Accordion style={{ margin: '20px 0' }}>
```

### 디버깅 도구

#### 1. expanded 상태 확인

```javascript
const Accordion = React.forwardRef(function Accordion(props, ref) {
  const [expanded, setExpandedState] = useControlled({ ... });

  // 디버깅 로그
  React.useEffect(() => {
    console.log('Accordion expanded:', expanded);
  }, [expanded]);

  // ...
});
```

#### 2. React DevTools로 props 확인

Chrome DevTools → React → Accordion 선택 → Props 탭에서 확인
- `expanded`: 현재 확장 상태
- `onChange`: 이벤트 핸들러가 제대로 전달되었는지
- `children`: summary와 children이 올바르게 분리되었는지

#### 3. handleChange 호출 추적

```javascript
const handleChange = React.useCallback(
  (event) => {
    console.log('handleChange called', {
      currentExpanded: expanded,
      nextExpanded: !expanded,
      event: event.type,
    });

    setExpandedState(!expanded);
    if (onChange) {
      onChange(event, !expanded);
    }
  },
  [expanded, onChange, setExpandedState],
);
```
