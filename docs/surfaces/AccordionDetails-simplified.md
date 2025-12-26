# AccordionDetails 컴포넌트

> 단순화된 Accordion 내용 영역 컨테이너 - 74줄에서 23줄로 (69% 감소)

---

## 무슨 기능을 하는가?

수정된 AccordionDetails는 **Accordion의 확장된 내용 영역에 padding을 적용하는 간단한 컨테이너** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **고정 Padding** - 내용 영역에 8px 16px 16px padding 적용
2. **ref 전달** - React.forwardRef로 DOM 노드 직접 접근 가능
3. **스타일 커스터마이징** - style prop으로 padding 오버라이드 가능

---

## 핵심 학습 포인트

### 1. 인라인 스타일로 Padding 적용

```javascript
<div
  style={{
    padding: '8px 16px 16px',
    ...style,
  }}
>
  {children}
</div>
```

**학습 가치**:
- **CSS 기초**: padding 속성 이해 (상 우 하)
- **인라인 스타일**: React에서 동적 스타일 적용 방법
- **간결함**: 복잡한 테마 시스템 없이 명확한 값 사용

### 2. Style Props 병합 패턴

```javascript
const { className, children, style, ...other } = props;

<div
  style={{
    padding: '8px 16px 16px',
    ...style,  // 사용자 스타일로 오버라이드 가능
  }}
>
```

**학습 가치**:
- **Props 구조 분해**: 필요한 props만 추출하고 나머지는 spread
- **스타일 병합**: 기본 스타일 뒤에 `...style`로 사용자 커스터마이징 허용
- **유연성**: 필요시 padding 오버라이드 가능

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/AccordionDetails/AccordionDetails.js (23줄, 원본 74줄)
AccordionDetails (forwardRef)
  └─> div (인라인 스타일)
       └─> children (사용자 제공 내용)
```

### 2. 단순한 렌더링 로직

**원본과의 차이**:
- ❌ `AccordionDetailsRoot` styled component 제거 → 일반 div + 인라인 스타일
- ❌ `memoTheme()` 제거 → 고정 padding 값 사용
- ❌ `useUtilityClasses` 제거 → 클래스명 자동 생성 시스템 불필요
- ❌ `useDefaultProps` 제거 → 테마 통합 제거
- ❌ `ownerState` 제거 → props를 스타일에 전달하는 메커니즘 불필요
- ✅ `padding: '8px 16px 16px'`로 고정 → 원본의 `theme.spacing(1, 2, 2)` 대체

### 3. Props (4개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 내용 영역에 표시할 내용 |
| `className` | string | - | CSS 클래스명 |
| `style` | CSSProperties | - | 인라인 스타일 (기본 padding 오버라이드 가능) |
| `...other` | any | - | 기타 HTML div 속성 (id, data-* 등) |

**제거된 Props**:
- ❌ `classes`: 테마 오버라이드용 클래스 객체
- ❌ `sx`: Material-UI sx prop

---

## 커밋 히스토리로 보는 단순화 과정

AccordionDetails는 **4개의 커밋**을 통해 단순화되었습니다.

### 1단계: memoTheme 제거 및 고정 padding
- `39250c19` - [AccordionDetails 단순화 1/4] memoTheme 제거 및 고정 padding
  - `memoTheme` import 및 사용 제거
  - `theme.spacing(1, 2, 2)` → `padding: '8px 16px 16px'`로 변경
  - 테마 기반 동적 spacing을 고정값으로 단순화

**이 기능이 불필요한 이유**:
- **학습 목적**: AccordionDetails의 핵심은 "내용 영역 컨테이너"이지 "테마 spacing 시스템"이 아님
- **복잡도**: memoTheme() 메모이제이션, theme.spacing() 함수, 테마 Context 구독
- **현실**: 대부분 기본값(8px 16px 16px) 사용

### 2단계: useDefaultProps 제거
- `f959d307` - [AccordionDetails 단순화 2/4] useDefaultProps 제거
  - 테마에서 기본 props 가져오는 로직 제거
  - `inProps` → `props`로 단순화

**이 기능이 불필요한 이유**:
- **학습 목적**: 테마 시스템은 Material-UI 전체의 주제로, AccordionDetails 학습에는 과함
- **복잡도**: 테마 Context 구독, props 병합 로직

### 3단계: useUtilityClasses, composeClasses 제거
- `af8e4585` - [AccordionDetails 단순화 3/4] useUtilityClasses, composeClasses 제거
  - 상태별 클래스명 자동 생성 시스템 제거
  - clsx, composeClasses import 제거
  - className을 props에서 바로 사용

**이 기능이 불필요한 이유**:
- **학습 목적**: 클래스명 생성 시스템은 테마 오버라이드용이며 핵심 로직이 아님
- **복잡도**: useUtilityClasses 함수, composeClasses 호출, slots 객체 정의
- **단순함**: AccordionDetails는 동적 상태가 없어서 'root' 클래스만 생성

### 4단계: Styled component 시스템 및 PropTypes 제거
- `ddabece9` - [AccordionDetails 단순화 4/4] Styled component 시스템 및 PropTypes 제거
  - styled() API 제거 → 일반 div + 인라인 스타일
  - AccordionDetailsRoot 제거
  - ownerState 제거
  - PropTypes 전체 제거 (25줄)

**이 기능이 불필요한 이유**:
- **학습 목적**: AccordionDetails 구조 배우는 것이지 CSS-in-JS 배우는 게 아님
- **복잡도**: styled() API, ownerState, PropTypes 이해 필요
- **가독성**: 인라인 스타일이 더 직관적

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 74줄 | 23줄 (69% 감소) |
| **Props 개수** | 4개 (children, className, classes, sx) | 4개 (children, className, style, ...other) |
| **Styled Component** | ✅ AccordionDetailsRoot | ❌ 일반 div |
| **테마 통합** | ✅ memoTheme, theme.spacing | ❌ 고정 padding |
| **useDefaultProps** | ✅ 테마 props 병합 | ❌ 제거 |
| **Utility Classes** | ✅ useUtilityClasses | ❌ 제거 |
| **PropTypes** | ✅ 25줄 | ❌ 제거 |
| **Padding** | theme.spacing(1, 2, 2) (동적) | '8px 16px 16px' (고정) |

---

## 학습 후 다음 단계

AccordionDetails를 이해했다면:

1. **Accordion** - AccordionDetails를 사용하는 부모 컴포넌트
2. **AccordionSummary** - Accordion의 헤더(클릭 가능한 영역)
3. **AccordionActions** - Accordion의 액션 버튼 영역
4. **실전 응용** - Accordion에 풍부한 내용 영역 만들기

**예시: 기본 사용법**
```javascript
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

<Accordion>
  <AccordionSummary>자주 묻는 질문</AccordionSummary>
  <AccordionDetails>
    <p>여기에 답변을 작성합니다.</p>
    <ul>
      <li>항목 1</li>
      <li>항목 2</li>
    </ul>
  </AccordionDetails>
</Accordion>
```

**예시: 스타일 커스터마이징**
```javascript
<AccordionDetails
  style={{
    padding: '16px 24px',
    backgroundColor: '#f5f5f5',
  }}
>
  <p>커스텀 패딩과 배경색을 적용한 내용 영역입니다.</p>
</AccordionDetails>
```

**예시: className으로 CSS 적용**
```css
/* styles.css */
.custom-details {
  padding: 20px 32px;
  background-color: #fafafa;
  border-top: 1px solid #e0e0e0;
}

.custom-details p {
  line-height: 1.6;
}
```

```javascript
<AccordionDetails className="custom-details">
  <p>CSS 클래스로 스타일이 적용된 내용 영역입니다.</p>
</AccordionDetails>
```

**예시: 복잡한 내용 영역**
```javascript
<AccordionDetails>
  <div>
    <h3>제목</h3>
    <p>설명 텍스트...</p>
    <img src="/image.jpg" alt="이미지" />
    <button>자세히 보기</button>
  </div>
</AccordionDetails>
```
