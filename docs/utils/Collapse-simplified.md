# Collapse 컴포넌트

> 콘텐츠를 접거나 펼치는 단순화된 애니메이션 컴포넌트

---

## 무슨 기능을 하는가?

수정된 Collapse는 **콘텐츠의 높이를 0px와 실제 크기 사이에서 부드럽게 전환하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **높이 측정** - useEffect로 자식 콘텐츠의 실제 높이 자동 측정
2. **CSS Transition** - `height` 속성에 transition 적용하여 애니메이션 구현
3. **상태 관리** - `in` prop에 따라 열림/닫힘 상태 전환
4. **Overflow 제어** - 애니메이션 중 `hidden`, 완료 후 `visible`로 전환

---

## 핵심 학습 포인트

### 1. useEffect를 활용한 동적 높이 측정

```javascript
const wrapperRef = React.useRef(null);
const [wrapperHeight, setWrapperHeight] = React.useState(0);

React.useEffect(() => {
  if (wrapperRef.current) {
    setWrapperHeight(wrapperRef.current.clientHeight);
  }
}, [children]);
```

**학습 가치**:
- **Ref를 통한 DOM 측정**: clientHeight로 실제 렌더링된 콘텐츠 크기 읽기
- **의존성 배열 활용**: children이 변경될 때마다 높이 재측정
- **Why not height: auto?**: CSS에서 `height: 0` → `height: auto`는 애니메이션 불가
- **해결책**: 실제 px 값 측정 후 `height: 0px` → `height: 245px` 전환

### 2. 상태 기반 스타일 계산

```javascript
style={{
  height: inProp ? wrapperHeight : 0,
  transition: `height ${timeout}ms ease-in-out`,
  overflow: isEntered ? 'visible' : 'hidden',
  visibility: !isEntered && !inProp ? 'hidden' : 'visible',
}}
```

**학습 가치**:
- **조건부 스타일**: JavaScript 표현식으로 동적 스타일 생성
- **Overflow 타이밍**: 애니메이션 중 hidden, 완료 후 visible (자식 요소 클리핑 방지)
- **Visibility 최적화**: 완전히 접힌 후 visibility: hidden으로 숨김
- **Transition 제어**: timeout prop으로 애니메이션 속도 조절

### 3. setTimeout을 이용한 상태 지연 업데이트

```javascript
const [isEntered, setIsEntered] = React.useState(inProp);

React.useEffect(() => {
  if (inProp) {
    setIsEntered(true);  // 즉시 진입 상태로
  } else {
    const timer = setTimeout(() => setIsEntered(false), timeout);  // 지연 후 종료 상태로
    return () => clearTimeout(timer);  // 클린업
  }
}, [inProp, timeout]);
```

**학습 가치**:
- **애니메이션 완료 대기**: overflow와 visibility 변경을 애니메이션 종료 후에 실행
- **클린업 함수**: 컴포넌트 unmount 또는 effect 재실행 시 타이머 정리
- **Why 지연?**: 애니메이션이 진행 중일 때는 overflow: visible이면 안 됨 (깜빡임 방지)

### 4. Wrapper 패턴 (3중 div 구조)

```javascript
<div style={{ height, overflow, visibility }}>  {/* Root: 애니메이션 주체 */}
  <div ref={wrapperRef} style={{ display: 'flex', width: '100%' }}>  {/* Wrapper: 높이 측정 */}
    <div style={{ width: '100%' }}>  {/* WrapperInner: 실제 콘텐츠 */}
      {children}
    </div>
  </div>
</div>
```

**학습 가치**:
- **Root**: height transition과 overflow 제어 담당
- **Wrapper**: `display: flex` - negative margin을 가진 자식의 높이를 정확히 측정하기 위한 hack
- **WrapperInner**: 실제 children을 감싸는 최종 컨테이너
- **Why 3개?**: 각각 다른 책임을 가진 계층 분리 (애니메이션 / 측정 / 콘텐츠)

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Collapse/Collapse.js (68줄, 원본 502줄)
Collapse (div - Root)
  └─> Wrapper (div)
       └─> WrapperInner (div)
            └─> {children}
```

### 2. 최종 구현 (68줄)

```javascript
const Collapse = React.forwardRef(function Collapse(inProps, ref) {
  const {
    children,
    className,
    in: inProp,
    style,
    timeout = duration.standard,  // 기본값 300ms
    ...other
  } = inProps;

  const wrapperRef = React.useRef(null);
  const [wrapperHeight, setWrapperHeight] = React.useState(0);
  const [isEntered, setIsEntered] = React.useState(inProp);

  // Effect 1: children 변경 시 높이 재측정
  React.useEffect(() => {
    if (wrapperRef.current) {
      setWrapperHeight(wrapperRef.current.clientHeight);
    }
  }, [children]);

  // Effect 2: in prop 변경 시 상태 업데이트 (지연 적용)
  React.useEffect(() => {
    if (inProp) {
      setIsEntered(true);
    } else {
      const timer = setTimeout(() => setIsEntered(false), timeout);
      return () => clearTimeout(timer);
    }
  }, [inProp, timeout]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: '0px',
        height: inProp ? wrapperHeight : 0,  // 동적 높이
        transition: `height ${timeout}ms ease-in-out`,  // 고정 easing
        overflow: isEntered ? 'visible' : 'hidden',  // 상태 기반
        visibility: !isEntered && !inProp ? 'hidden' : 'visible',  // 완전히 숨김
        ...style,
      }}
      {...other}
    >
      <div
        ref={wrapperRef}
        style={{
          display: 'flex',  // negative margin hack
          width: '100%',
        }}
      >
        <div style={{ width: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
});
```

**원본과의 차이**:
- ❌ react-transition-group 제거 → 직접 CSS transition 구현
- ❌ 6개 lifecycle 콜백 제거 → 2개 useEffect로 단순화
- ❌ Styled components 제거 → 인라인 스타일
- ❌ Theme 통합 제거 → 하드코딩된 값
- ❌ Slot 시스템 제거 → 고정된 3개 div 구조
- ❌ horizontal orientation 제거 → vertical만 지원
- ❌ collapsedSize prop 제거 → 항상 0px
- ❌ 'auto' timeout 제거 → 고정 duration
- ❌ easing prop 제거 → 고정 'ease-in-out'

### 3. Props (5개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `in` | boolean | - | true일 때 펼쳐짐, false일 때 접힘 |
| `children` | node | - | 접거나 펼칠 콘텐츠 |
| `timeout` | number \| object | 300 | 애니메이션 지속 시간 (ms) |
| `className` | string | - | 루트 요소의 className |
| `style` | object | - | 인라인 스타일 (height, overflow 등은 내부적으로 제어됨) |

---

## 커밋 히스토리로 보는 단순화 과정

Collapse는 **12단계**를 통해 단순화되었습니다 (실제 11개 커밋 - 1/12와 2/12 통합).

### 1단계: Slot 시스템 제거
- `7d58f3cd` - [Collapse 단순화 1/12] Slot 시스템 제거

**무엇을**: 3개의 슬롯(root, wrapper, wrapperInner)을 커스텀 컴포넌트로 교체할 수 있는 시스템

**왜 불필요한가**:
- **학습 목적**: Collapse의 핵심은 "애니메이션"이지 "컴포넌트 교체"가 아님
- **복잡도**: useSlot() 훅 3번, slotProps 병합, externalForwardedProps 객체 생성
- **현실**: 고정된 3개 div 구조로 충분

### 2단계: component prop 제거
- **1단계에 포함됨** (component prop은 slot 시스템과 함께 제거)

**무엇을**: 루트 엘리먼트를 변경할 수 있는 prop

**왜 불필요한가**:
- **학습 목적**: Collapse는 항상 div면 충분
- **복잡도**: externalForwardedProps에 포함되어 slot과 밀접히 연관
- **현실**: 대부분 기본값(div) 사용

### 3단계: Lifecycle 콜백 제거
- `65daaa8c` - [Collapse 단순화 3/12] Lifecycle 콜백 제거

**무엇을**: onEnter, onEntering, onEntered, onExit, onExiting, onExited, addEndListener 7개 콜백

**왜 불필요한가**:
- **학습 목적**: Collapse의 핵심은 "접기/펼치기"이지 "세밀한 애니메이션 제어"가 아님
- **복잡도**: normalizedTransitionCallback() 함수, 각 페이즈마다 콜백 호출 로직
- **현실**: 99% 사용하지 않음, `in` prop만으로 충분

### 4단계: 'auto' timeout 제거
- `3abde8d1` - [Collapse 단순화 4/12] 'auto' timeout 제거

**무엇을**: 콘텐츠 높이에 따라 최적 duration을 자동으로 계산하는 기능

```javascript
// 공식: Math.min(Math.round((4 + 15 * constant^0.25 + constant / 5) * 10), 3000)
// constant = height / 36
```

**왜 불필요한가**:
- **학습 목적**: Collapse의 핵심은 "애니메이션 발생"이지 "최적 duration 계산"이 아님
- **복잡도**: useTimeout() 훅, getAutoHeightDuration() 호출, auto 체크 조건문
- **대안**: 고정 300ms로도 부드러운 애니메이션 가능

### 5단계: easing prop 제거
- `5150ed29` - [Collapse 단순화 5/12] easing prop 제거

**무엇을**: CSS easing 함수 커스터마이징 (enter/exit 별도 지정 가능)

**왜 불필요한가**:
- **학습 목적**: Collapse의 핵심은 "접기/펼치기"이지 "easing 함수 선택"이 아님
- **복잡도**: string | object 타입 정규화, getTransitionProps() 호출
- **대안**: 고정 'ease-in-out'으로 충분히 부드러움

### 6단계: horizontal orientation 제거
- `00b4f61a` - [Collapse 단순화 6/12] horizontal orientation 제거

**무엇을**: 가로 방향 collapse 지원 (width 기반 애니메이션)

**왜 불필요한가**:
- **학습 목적**: 세로 방향만으로 개념 이해 충분 (가로는 height ↔ width만 다름)
- **복잡도**: orientation에 따른 property 분기, position: absolute hack
- **현실**: 99% vertical 사용, MUI 자체도 거의 vertical만 사용

### 7단계: collapsedSize prop 제거
- `bbf8986e` - [Collapse 단순화 7/12] collapsedSize prop 제거

**무엇을**: 완전히 접힌 상태의 크기 지정 (기본값: '0px', 예: '40px'로 부분 접기)

**왜 불필요한가**:
- **학습 목적**: Collapse의 핵심은 "0px ↔ auto" 전환
- **복잡도**: number | string 정규화, hidden 클래스 조건 복잡화
- **현실**: 99% '0px' 사용, 부분 접기는 고급 사용 케이스

### 8단계: react-transition-group 제거
- `9f8830c3` - [Collapse 단순화 8/12] react-transition-group 제거

**무엇을**: Transition 컴포넌트를 래핑하여 6단계 상태 머신 사용

**왜 불필요한가**:
- **학습 목적**: 외부 라이브러리 이해 불필요, 직접 CSS transition 구현으로 개념 학습 가능
- **복잡도**: Transition 래핑, nodeRef 관리, appear/enter/exit 페이즈 처리
- **대안**: React.useState + useEffect + CSS transition으로 충분

**핵심 변경**:
```javascript
// 전: react-transition-group
<Transition in={inProp} timeout={timeout}>
  {(state) => <div>...</div>}
</Transition>

// 후: 직접 구현
const [isEntered, setIsEntered] = React.useState(inProp);
React.useEffect(() => {
  if (inProp) setIsEntered(true);
  else setTimeout(() => setIsEntered(false), timeout);
}, [inProp]);
```

### 9단계: Theme 시스템 제거
- `b750a66c` - [Collapse 단순화 9/12] Theme 시스템 제거

**무엇을**: useDefaultProps, useTheme, theme.transitions 등 테마 통합

**왜 불필요한가**:
- **학습 목적**: 테마 시스템은 Material-UI 전체의 주제, 하드코딩으로도 이해 충분
- **복잡도**: DefaultPropsProvider Context 구독, theme.transitions.create() 호출
- **결과**: `theme.transitions.create('height')` → `height 300ms ease-in-out`

### 10단계: Styled Components 제거
- `7e5e888d` - [Collapse 단순화 10/12] Styled Components 제거

**무엇을**: styled() API로 생성한 3개 컴포넌트 (CollapseRoot, CollapseWrapper, CollapseWrapperInner)

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS는 별도 학습 주제, 인라인 스타일로 더 직관적
- **복잡도**: memoTheme(), variants 배열, overridesResolver
- **가독성**: 스타일이 JSX 옆에 바로 보여 이해하기 쉬움

**핵심 변경**:
```javascript
// 전: Styled Component
const CollapseRoot = styled('div')(memoTheme(({ theme }) => ({
  height: 0,
  overflow: 'hidden',
  transition: theme.transitions.create('height'),
  variants: [...]
})));

// 후: 인라인 스타일
<div
  style={{
    height: inProp ? wrapperHeight : 0,
    overflow: isEntered ? 'visible' : 'hidden',
    transition: `height ${timeout}ms ease-in-out`,
  }}
>
```

### 11단계: classes, sx, className 시스템 제거
- `e44a3526` - [Collapse 단순화 11/12] classes, sx, className 제거

**무엇을**: 동적 클래스 생성 및 스타일 오버라이드 시스템

**왜 불필요한가**:
- **학습 목적**: 고정된 스타일로도 개념 이해 충분, 스타일 커스터마이징은 고급 주제
- **복잡도**: useUtilityClasses() 훅, composeClasses(), clsx() 병합, 7개 슬롯
- **단순화**: className prop은 남기되, 복잡한 클래스 생성 로직 제거

### 12단계: PropTypes 및 메타데이터 제거
- `fb5cd29c` - [Collapse 단순화 12/12] PropTypes 및 메타데이터 제거

**무엇을**: 런타임 타입 검증, JSDoc 주석, 메타데이터

**왜 불필요한가**:
- **학습 목적**: PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님
- **복잡도**: PropTypes 정의 100줄+, JSDoc 주석
- **대안**: TypeScript가 빌드 타임에 검증

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 502줄 | 68줄 (86% 감소) |
| **Props 개수** | 17개 | 5개 |
| **외부 라이브러리** | ✅ (react-transition-group) | ❌ |
| **Lifecycle 콜백** | ✅ (7개) | ❌ |
| **Orientation** | ✅ (vertical, horizontal) | ❌ (vertical만) |
| **collapsedSize** | ✅ (커스텀 가능) | ❌ (0px 고정) |
| **'auto' timeout** | ✅ | ❌ (고정값) |
| **easing 커스터마이징** | ✅ | ❌ (ease-in-out 고정) |
| **Slot 시스템** | ✅ | ❌ |
| **Styled Components** | ✅ | ❌ (인라인 스타일) |
| **Theme 통합** | ✅ | ❌ (하드코딩) |
| **classes/sx/className** | ✅ | ❌ (className만 기본 지원) |
| **PropTypes** | ✅ | ❌ |

---

## 학습 후 다음 단계

Collapse를 이해했다면:

1. **Accordion** - 여러 Collapse를 조합하여 아코디언 UI 구현
2. **Fade, Grow, Slide** - 다른 유형의 transition 컴포넌트 학습
3. **실전 응용** - FAQ 섹션, 상세 정보 토글, 메뉴 확장/축소

**예시: 기본 사용**
```javascript
import React, { useState } from 'react';
import Collapse from '@mui/material/Collapse';

function BasicCollapse() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(!open)}>
        Toggle
      </button>
      <Collapse in={open}>
        <div style={{ padding: 20, backgroundColor: '#f0f0f0' }}>
          <h3>Collapsed Content</h3>
          <p>This content can be toggled!</p>
        </div>
      </Collapse>
    </div>
  );
}
```

**예시: 커스텀 timeout**
```javascript
<Collapse in={open} timeout={500}>
  <div>Slower animation (500ms)</div>
</Collapse>

<Collapse in={open} timeout={{ enter: 300, exit: 500 }}>
  <div>Different durations for enter/exit</div>
</Collapse>
```

**예시: FAQ 리스트**
```javascript
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid #ddd' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '15px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {question} {open ? '−' : '+'}
      </button>
      <Collapse in={open}>
        <div style={{ padding: '0 15px 15px' }}>
          {answer}
        </div>
      </Collapse>
    </div>
  );
}

function FAQ() {
  return (
    <div>
      <FAQItem
        question="What is React?"
        answer="React is a JavaScript library for building user interfaces."
      />
      <FAQItem
        question="What is Material-UI?"
        answer="Material-UI is a React component library implementing Google's Material Design."
      />
    </div>
  );
}
```

**핵심 포인트 요약**:
- Collapse는 **높이 측정 + CSS transition**으로 구현된 단순한 애니메이션 컴포넌트
- **height: auto 문제**를 ref와 clientHeight로 해결
- **2개의 useEffect**로 높이 측정과 상태 관리 분리
- **3중 div 구조**로 측정과 애니메이션 책임 분리
- 원본 502줄 → 68줄 (86% 감소)로 핵심 개념 학습에 최적화
