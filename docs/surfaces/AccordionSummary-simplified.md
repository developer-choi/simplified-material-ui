# AccordionSummary 컴포넌트

> 단순화된 Accordion 헤더 영역 - 259줄에서 73줄로 (72% 감소)

---

## 무슨 기능을 하는가?

수정된 AccordionSummary는 **Accordion의 클릭 가능한 헤더 영역을 제공하며, 확장/축소를 제어**하는 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **클릭 가능한 헤더** - button 요소로 클릭 이벤트 처리
2. **AccordionContext 통신** - Accordion에서 expanded, disabled, toggle 가져오기
3. **확장 아이콘 표시** - expandIcon prop으로 아이콘 표시 및 회전 애니메이션
4. **3개 영역 구조** - button (Root) + span (Content) + span (ExpandIconWrapper)
5. **접근성** - aria-expanded 속성 자동 설정
6. **스타일 커스터마이징** - style prop으로 인라인 스타일 오버라이드 가능

---

## 핵심 학습 포인트

### 1. AccordionContext를 통한 부모-자식 통신

```javascript
const { disabled = false, expanded, toggle } = React.useContext(AccordionContext);
const handleChange = (event) => {
  if (toggle) {
    toggle(event);
  }
  if (onClick) {
    onClick(event);
  }
};
```

**학습 가치**:
- **Context API**: React의 Context를 통해 부모(Accordion)와 자식(AccordionSummary) 간 상태 공유
- **Props drilling 회피**: 중간 컴포넌트 없이 직접 Accordion의 상태 접근
- **이벤트 조합**: 내부 toggle 함수와 사용자 onClick 핸들러 조합

### 2. 조건부 인라인 스타일

```javascript
<button
  style={{
    minHeight: expanded ? 64 : 48,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.38 : 1,
  }}
>
```

**학습 가치**:
- **동적 스타일**: 상태(expanded, disabled)에 따라 스타일 변경
- **삼항 연산자**: 조건에 따른 값 선택
- **접근성**: disabled 상태에서 cursor와 opacity로 시각적 피드백

### 3. 아이콘 회전 애니메이션

```javascript
{expandIcon && (
  <span
    style={{
      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 150ms',
    }}
  >
    {expandIcon}
  </span>
)}
```

**학습 가치**:
- **CSS Transform**: rotate()로 아이콘 회전
- **부드러운 전환**: transition으로 애니메이션 효과
- **조건부 렌더링**: expandIcon이 있을 때만 렌더링

### 4. 접근성 (Accessibility)

```javascript
<button
  disabled={disabled}
  aria-expanded={expanded}
  onClick={handleChange}
>
```

**학습 가치**:
- **ARIA 속성**: aria-expanded로 스크린 리더에 확장 상태 전달
- **시맨틱 HTML**: button 요소로 키보드 접근성 자동 제공
- **disabled 속성**: 비활성화 상태 처리

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/AccordionSummary/AccordionSummary.js (73줄, 원본 259줄)
AccordionSummary (forwardRef)
  └─> button (인라인 스타일)
       ├─> span (Content - 텍스트/내용)
       │    └─> children
       └─> span (ExpandIconWrapper - 아이콘)
            └─> expandIcon (조건부 렌더링)
```

### 2. 단순한 렌더링 로직

**원본과의 차이**:
- ❌ `AccordionSummaryRoot` styled component 제거 → button + 인라인 스타일
- ❌ `AccordionSummaryContent` styled component 제거 → span + 인라인 스타일
- ❌ `AccordionSummaryExpandIconWrapper` styled component 제거 → span + 인라인 스타일
- ❌ `ButtonBase` 컴포넌트 제거 → 일반 button 사용
- ❌ `memoTheme()` 제거 → 고정 스타일 값 사용
- ❌ `useSlot()` 제거 → 직접 JSX로 3개 영역 정의
- ❌ `useUtilityClasses` 제거 → 클래스명 자동 생성 시스템 불필요
- ❌ `useDefaultProps` 제거 → 테마 통합 제거
- ❌ `disableGutters` prop 제거 → 기본 동작으로 고정
- ✅ AccordionContext 유지 → Accordion과 통신 필수
- ✅ expandIcon 회전 애니메이션 유지 → 핵심 기능

### 3. Props (6개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 헤더 텍스트/내용 |
| `className` | string | - | CSS 클래스명 |
| `expandIcon` | ReactNode | - | 확장 아이콘 (선택) |
| `onClick` | func | - | 추가 클릭 핸들러 (선택) |
| `style` | CSSProperties | - | 인라인 스타일 (기본 스타일 오버라이드 가능) |
| `...other` | any | - | 기타 HTML button 속성 (id, data-* 등) |

**제거된 Props**:
- ❌ `classes`: 테마 오버라이드용 클래스 객체
- ❌ `sx`: Material-UI sx prop
- ❌ `slots`: 슬롯 커스터마이징 객체
- ❌ `slotProps`: 슬롯 props 객체
- ❌ `focusVisibleClassName`: 포커스 시 클래스명
- ❌ `disableGutters`: 간격 제거 옵션

---

## 커밋 히스토리로 보는 단순화 과정

AccordionSummary는 **7개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 제거
- `db3a0c45` - [AccordionSummary 단순화 1/7] Slot 시스템 제거
  - `useSlot` 훅 3번 호출 제거 (root, content, expandIconWrapper)
  - `slots`, `slotProps` props 제거
  - `externalForwardedProps` 병합 로직 제거
  - 직접 styled components 사용 (AccordionSummaryRoot, AccordionSummaryContent, AccordionSummaryExpandIconWrapper)

**이 기능이 불필요한 이유**:
- **학습 목적**: AccordionSummary의 핵심은 "클릭 가능한 헤더"이지 "슬롯 커스터마이징"이 아님
- **복잡도**: useSlot 훅 이해, slots/slotProps 관리, 이벤트 핸들러 병합 로직
- **일관성**: Accordion, AccordionDetails 등 단순화된 컴포넌트에서 제거

### 2단계: disableGutters prop 제거
- `51fa3fcf` - [AccordionSummary 단순화 2/7] disableGutters prop 제거
  - `disableGutters` prop 사용 제거
  - disableGutters 관련 variants 제거 (Root, Content)
  - useUtilityClasses에서 조건부 클래스 제거
  - 기본 동작으로 고정 (확장 시 높이/마진 변화)

**이 기능이 불필요한 이유**:
- **학습 목적**: 세밀한 간격 조정은 고급 기능이며 핵심 학습에 불필요
- **복잡도**: variants 배열, 조건부 스타일, ownerState 관리
- **현실**: 대부분 기본값 사용

### 3단계: memoTheme 제거 및 고정 스타일
- `6a4eb10e` - [AccordionSummary 단순화 3/7] memoTheme 제거 및 고정 스타일
  - `memoTheme` import 및 사용 제거 (3곳)
  - 테마 기반 동적 스타일을 고정값으로 변경:
    - `theme.spacing(0, 2)` → `'0 16px'`
    - `theme.transitions.create([...], { duration: ... })` → `'min-height 150ms, background-color 150ms'`
    - `theme.palette.action.hover` → `'rgba(0, 0, 0, 0.04)'`
    - `theme.palette.text.disabled` → `'rgba(0, 0, 0, 0.54)'`

**이 기능이 불필요한 이유**:
- **학습 목적**: AccordionSummary의 핵심은 "클릭 가능한 헤더"이지 "테마 시스템"이 아님
- **복잡도**: memoTheme 메모이제이션, theme.spacing/transitions/palette 사용, 테마 Context 구독
- **현실**: 대부분 기본 스타일 사용

### 4단계: ButtonBase 제거
- `4dbf6927` - [AccordionSummary 단순화 4/7] ButtonBase 제거
  - `ButtonBase` import 및 사용 제거
  - `focusRipple: false, disableRipple: true` 제거
  - `focusVisibleClassName` prop 제거
  - 일반 button 태그로 대체
  - focusVisible, hover 상태 스타일 제거

**이 기능이 불필요한 이유**:
- **학습 목적**: AccordionSummary의 핵심은 "클릭 가능한 헤더"이지 "ButtonBase 시스템"이 아님
- **복잡도**: ButtonBase 컴포넌트, focusRipple/disableRipple props, focusVisibleClassName 처리
- **일관성**: 단순화된 컴포넌트는 기본 HTML 요소 사용

### 5단계: useDefaultProps 제거
- `c6ceffa7` - [AccordionSummary 단순화 5/7] useDefaultProps 제거
  - 테마에서 기본 props 가져오는 로직 제거
  - `DefaultPropsProvider` import 제거
  - `inProps` → `props`로 단순화

**이 기능이 불필요한 이유**:
- **학습 목적**: 테마 시스템은 Material-UI 전체의 주제로, AccordionSummary 학습에는 과함
- **복잡도**: 테마 Context 구독, props 병합 로직
- **일관성**: 모든 단순화된 컴포넌트에서 제거

### 6단계: useUtilityClasses, composeClasses 제거
- `6ff5d3ec` - [AccordionSummary 단순화 6/7] useUtilityClasses, composeClasses 제거
  - `useUtilityClasses` 함수 제거
  - `composeClasses` import 및 호출 제거
  - `accordionSummaryClasses`, `getAccordionSummaryUtilityClass` import 제거
  - `clsx` import 및 사용 제거
  - className을 props에서 바로 사용
  - 4개 slots의 클래스명 자동 생성 시스템 제거 (root, focusVisible, content, expandIconWrapper)

**이 기능이 불필요한 이유**:
- **학습 목적**: 클래스명 생성 시스템은 테마 오버라이드용이며 핵심 로직이 아님
- **복잡도**: useUtilityClasses 함수, composeClasses 호출, slots 객체 정의, 조건부 클래스
- **단순함**: 인라인 스타일로도 충분히 동작

### 7단계: Styled component 시스템 및 PropTypes 제거
- `f6198dbb` - [AccordionSummary 단순화 7/7] Styled component 시스템 및 PropTypes 제거
  - styled() API 제거
  - AccordionSummaryRoot 제거 → button + 인라인 스타일
  - AccordionSummaryContent 제거 → span + 인라인 스타일
  - AccordionSummaryExpandIconWrapper 제거 → span + 인라인 스타일
  - ownerState 제거
  - PropTypes 전체 제거 (33줄)
  - accordionSummaryClasses 의존성 제거

**이 기능이 불필요한 이유**:
- **학습 목적**: AccordionSummary 구조 배우는 것이지 CSS-in-JS 배우는 게 아님
- **복잡도**: styled() API, ownerState, PropTypes 이해 필요
- **가독성**: 인라인 스타일이 더 직관적

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 259줄 | 73줄 (72% 감소) |
| **Props 개수** | 10개 (children, className, classes, expandIcon, focusVisibleClassName, onClick, slots, slotProps, sx, disableGutters) | 6개 (children, className, expandIcon, onClick, style, ...other) |
| **베이스 요소** | ✅ ButtonBase (styled) | ❌ button (HTML) |
| **Styled Components** | ✅ 3개 (Root, Content, ExpandIconWrapper) | ❌ 인라인 스타일 |
| **테마 통합** | ✅ memoTheme, theme.spacing/transitions/palette | ❌ 고정 스타일 값 |
| **Slot 시스템** | ✅ useSlot으로 3개 슬롯 | ❌ 제거 |
| **useDefaultProps** | ✅ 테마 props 병합 | ❌ 제거 |
| **Utility Classes** | ✅ useUtilityClasses (4개 slots) | ❌ 제거 |
| **PropTypes** | ✅ 33줄 | ❌ 제거 |
| **AccordionContext** | ✅ expanded, disabled, disableGutters, toggle | ✅ expanded, disabled, toggle (disableGutters 제거) |
| **expandIcon 회전** | ✅ transform: rotate | ✅ 유지 (인라인 스타일) |

---

## 학습 후 다음 단계

AccordionSummary를 이해했다면:

1. **Accordion** - AccordionSummary를 포함하는 부모 컴포넌트
2. **AccordionDetails** - Accordion의 내용 영역
3. **AccordionActions** - Accordion의 액션 버튼 영역
4. **실전 응용** - Accordion에 커스텀 헤더 만들기

**예시: 기본 사용법**
```javascript
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

<Accordion>
  <AccordionSummary expandIcon={<span>▼</span>}>
    자주 묻는 질문
  </AccordionSummary>
  <AccordionDetails>
    <p>여기에 답변을 작성합니다.</p>
  </AccordionDetails>
</Accordion>
```

**예시: 스타일 커스터마이징**
```javascript
<AccordionSummary
  expandIcon={<span>▼</span>}
  style={{
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    padding: '0 24px',
  }}
>
  커스텀 스타일이 적용된 헤더
</AccordionSummary>
```

**예시: className으로 CSS 적용**
```css
/* styles.css */
.custom-summary {
  background-color: #e3f2fd;
  border-bottom: 2px solid #2196f3;
}

.custom-summary:hover {
  background-color: #bbdefb;
}
```

```javascript
<AccordionSummary
  className="custom-summary"
  expandIcon={<span>▼</span>}
>
  CSS 클래스로 스타일이 적용된 헤더
</AccordionSummary>
```

**예시: 커스텀 아이콘과 onClick**
```javascript
const handleSummaryClick = (event) => {
  console.log('헤더가 클릭되었습니다!', event);
};

<AccordionSummary
  expandIcon={
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M7 10l5 5 5-5z" />
    </svg>
  }
  onClick={handleSummaryClick}
>
  커스텀 아이콘과 클릭 핸들러
</AccordionSummary>
```

**예시: 복잡한 헤더 구조**
```javascript
<AccordionSummary expandIcon={<span>▼</span>}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <img src="/avatar.png" alt="아바타" style={{ width: 32, height: 32 }} />
    <div>
      <h3 style={{ margin: 0 }}>제목</h3>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>부제목</p>
    </div>
  </div>
</AccordionSummary>
```

**예시: AccordionContext 활용 (고급)**
```javascript
import * as React from 'react';
import AccordionContext from '@mui/material/Accordion/AccordionContext';

function CustomAccordionSummary({ children }) {
  const { expanded, toggle } = React.useContext(AccordionContext);

  return (
    <button onClick={toggle}>
      {children}
      {expanded ? ' ▲' : ' ▼'}
    </button>
  );
}
```
