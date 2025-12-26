# AccordionActions 컴포넌트

> 단순화된 Accordion 액션 버튼 컨테이너 - 95줄에서 27줄로 (72% 감소)

---

## 무슨 기능을 하는가?

수정된 AccordionActions는 **Accordion 하단에 액션 버튼들을 flexbox 레이아웃으로 우측 정렬하는 간단한 컨테이너** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **Flexbox 레이아웃** - display: flex로 버튼들을 가로 배치, justifyContent: flex-end로 우측 정렬
2. **버튼 간 간격** - gap: 8로 버튼 사이 간격 자동 적용
3. **ref 전달** - React.forwardRef로 DOM 노드 직접 접근 가능

---

## 핵심 학습 포인트

### 1. 인라인 스타일로 Flexbox 레이아웃 구현

```javascript
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    padding: 8,
    justifyContent: 'flex-end',
    gap: 8,
    ...style,
  }}
>
  {children}
</div>
```

**학습 가치**:
- **CSS Flexbox 기초**: display: flex, justifyContent, alignItems, gap 속성 이해
- **gap 속성의 장점**: 복잡한 선택자 없이 자식 간 간격 설정 (원본의 `'& > :not(style) ~ :not(style)'`보다 훨씬 간단)
- **인라인 스타일**: React에서 동적 스타일 적용 방법

### 2. Style Props 병합 패턴

```javascript
const { className, children, style, ...other } = props;

<div
  style={{
    display: 'flex',
    // ... 기본 스타일
    ...style,  // 사용자 스타일로 오버라이드 가능
  }}
>
```

**학습 가치**:
- **Props 구조 분해**: 필요한 props만 추출하고 나머지는 spread
- **스타일 병합**: 기본 스타일 뒤에 `...style`로 사용자 커스터마이징 허용
- **유연성**: 사용자가 필요시 스타일 오버라이드 가능

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/AccordionActions/AccordionActions.js (27줄, 원본 95줄)
AccordionActions (forwardRef)
  └─> div (인라인 스타일)
       └─> children (Button 등 - 사용자 제공)
```

### 2. 단순한 렌더링 로직

**원본과의 차이**:
- ❌ `AccordionActionsRoot` styled component 제거 → 일반 div + 인라인 스타일
- ❌ `useUtilityClasses` 제거 → 클래스명 자동 생성 시스템 불필요
- ❌ `useDefaultProps` 제거 → 테마 통합 제거
- ❌ `ownerState` 제거 → props를 스타일에 전달하는 메커니즘 불필요
- ✅ `gap: 8`로 간격 구현 → 원본의 복잡한 CSS 선택자(`'& > :not(style) ~ :not(style)'`) 대체

### 3. Props (4개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 액션 버튼들 (Button 컴포넌트 등) |
| `className` | string | - | CSS 클래스명 |
| `style` | CSSProperties | - | 인라인 스타일 (기본 스타일 오버라이드 가능) |
| `...other` | any | - | 기타 HTML div 속성 (id, data-* 등) |

**제거된 Props**:
- ❌ `disableSpacing`: 간격 제거 옵션 (항상 gap: 8로 고정)
- ❌ `classes`: 테마 오버라이드용 클래스 객체
- ❌ `sx`: Material-UI sx prop

---

## 커밋 히스토리로 보는 단순화 과정

AccordionActions는 **5개의 커밋**을 통해 단순화되었습니다.

### 1단계: disableSpacing prop 제거
- `fb50a9f3` - [AccordionActions 단순화 1/5] disableSpacing prop 제거
  - `disableSpacing` prop 제거
  - variants 배열 제거 (조건부 간격 스타일)
  - useUtilityClasses에서 조건부 클래스 제거
  - 버튼 간 간격을 항상 8px로 고정

**이 기능이 불필요한 이유**:
- **학습 목적**: AccordionActions의 핵심은 "버튼 영역 레이아웃"이지 "간격 조정"이 아님
- **복잡도**: variants 배열, ownerState, 조건부 클래스로 코드 복잡도 증가
- **현실**: 대부분 기본값(간격 있음) 사용

### 2단계: useDefaultProps 제거
- `4ea4f6b9` - [AccordionActions 단순화 2/5] useDefaultProps 제거
  - 테마에서 기본 props 가져오는 로직 제거
  - `inProps` → `props`로 단순화

**이 기능이 불필요한 이유**:
- **학습 목적**: 테마 시스템은 Material-UI 전체의 주제로, AccordionActions 학습에는 과함
- **복잡도**: 테마 Context 구독, props 병합 로직

### 3단계: useUtilityClasses, composeClasses 제거
- `3b3dc96e` - [AccordionActions 단순화 3/5] useUtilityClasses, composeClasses 제거
  - 상태별 클래스명 자동 생성 시스템 제거
  - clsx, composeClasses import 제거
  - className을 props에서 바로 사용

**이 기능이 불필요한 이유**:
- **학습 목적**: 클래스명 생성 시스템은 테마 오버라이드용이며 핵심 로직이 아님
- **복잡도**: useUtilityClasses 함수, composeClasses 호출, slots 객체 정의

### 4단계: Styled component 시스템 제거
- `8f1eadcd` - [AccordionActions 단순화 4/5] Styled component 시스템 제거
  - styled() API 제거 → 일반 div + 인라인 스타일
  - AccordionActionsRoot 제거
  - overridesResolver, variants 제거
  - `'& > :not(style) ~ :not(style)'` → `gap: 8`로 단순화

**이 기능이 불필요한 이유**:
- **학습 목적**: AccordionActions 구조 배우는 것이지 CSS-in-JS 배우는 게 아님
- **복잡도**: styled() API, overridesResolver, variants, ownerState 이해 필요
- **가독성**: 인라인 스타일이 더 직관적

### 5단계: PropTypes 제거
- `4308c2d4` - [AccordionActions 단순화 5/5] PropTypes 제거
  - 런타임 타입 검증 제거
  - PropTypes import 제거
  - 30줄의 PropTypes 블록 제거

**이 기능이 불필요한 이유**:
- **학습 목적**: PropTypes는 타입 검증 도구이지 AccordionActions 로직이 아님
- **복잡도**: 실제 코드(35줄)보다 PropTypes(30줄)가 더 많았음
- **프로덕션**: PropTypes는 빌드 시 제거됨

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 95줄 | 27줄 (72% 감소) |
| **Props 개수** | 5개 (children, className, disableSpacing, classes, sx) | 4개 (children, className, style, ...other) |
| **Styled Component** | ✅ AccordionActionsRoot | ❌ 일반 div |
| **테마 통합** | ✅ useDefaultProps | ❌ 제거 |
| **Utility Classes** | ✅ useUtilityClasses | ❌ 제거 |
| **PropTypes** | ✅ 30줄 | ❌ 제거 |
| **간격 조정** | ✅ disableSpacing prop | ❌ 항상 gap: 8 |
| **간격 구현** | `'& > :not(style) ~ :not(style)'` 선택자 | `gap: 8` 속성 |

---

## 학습 후 다음 단계

AccordionActions를 이해했다면:

1. **Accordion** - AccordionActions를 사용하는 부모 컴포넌트
2. **AccordionSummary** - Accordion의 헤더(클릭 가능한 영역)
3. **AccordionDetails** - Accordion의 내용 영역
4. **실전 응용** - Accordion에 확인/취소 버튼 추가하기

**예시: 기본 사용법**
```javascript
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions';
import Button from '@mui/material/Button';

<Accordion>
  <AccordionSummary>설정</AccordionSummary>
  <AccordionDetails>
    설정 내용을 여기에 작성합니다.
  </AccordionDetails>
  <AccordionActions>
    <Button>취소</Button>
    <Button variant="contained">저장</Button>
  </AccordionActions>
</Accordion>
```

**예시: 스타일 커스터마이징**
```javascript
<AccordionActions
  style={{
    backgroundColor: '#f5f5f5',
    padding: 16,
    gap: 12,
  }}
>
  <Button>취소</Button>
  <Button variant="contained">저장</Button>
</AccordionActions>
```

**예시: className으로 CSS 적용**
```css
/* styles.css */
.custom-actions {
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.custom-actions button {
  text-transform: none;
}
```

```javascript
<AccordionActions className="custom-actions">
  <Button>취소</Button>
  <Button variant="contained">저장</Button>
</AccordionActions>
```
