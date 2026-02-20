# StepIcon 컴포넌트

> 상태별 아이콘을 표시하는 단순화된 컴포넌트

---

## 무슨 기능을 하는가?

단순화된 StepIcon은 **스텝 상태에 따라 세 가지 아이콘을 분기 렌더링**합니다.

### 핵심 기능 (남은 것)

1. **상태별 분기 렌더링**
   - `error=true` → WarningIcon (최우선)
   - `completed=true` → CheckCircleIcon
   - 기본 → 원(circle) + 숫자(text) SVG

2. **상태별 색상**
   - active/completed: `#1976d2`
   - error: `#d32f2f`
   - 기본(disabled): `#bdbdbd`

3. **커스텀 아이콘 pass-through**
   - `icon`이 number/string이 아니면 그대로 반환

---

## 핵심 학습 포인트

### 1. error 우선순위가 completed보다 높다

```javascript
if (error) {
  return <WarningIcon />;   // error 먼저 체크
}
if (completed) {
  return <CheckCircleIcon />;
}
// 기본: 원 + 숫자
```

error와 completed가 동시에 true일 경우 error가 이긴다.

### 2. icon 타입 체크로 커스텀 아이콘 분기

```javascript
if (typeof icon === 'number' || typeof icon === 'string') {
  // MUI 기본 SVG 렌더링
}
return icon; // node면 그대로 (커스텀 아이콘)
```

StepLabel이 `icon={index + 1}` (숫자)를 기본으로 내려주고,
사용자가 `<StepLabel icon={<MyIcon />}>`으로 오버라이드 가능.

### 3. 색상 계산 one-liner

```javascript
const color = error ? '#d32f2f' : (active || completed) ? '#1976d2' : '#bdbdbd';
```

active와 completed가 같은 색인 이유: 둘 다 "완료된 혹은 현재 진행 중" 상태이기 때문.

### 4. 외부 SVG import → 인라인 SVG

```javascript
// ❌ 원본: 외부 컴포넌트 import
import CheckCircle from '../internal/svg-icons/CheckCircle';
import Warning from '../internal/svg-icons/Warning';
import SvgIcon from '../SvgIcon';

// ✅ 단순화: 인라인 SVG (Avatar의 PersonIcon 패턴 동일)
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" style={{ ... }}>
    <path d="M12 0a12 12 0 1 0 ..." />
  </svg>
);
```

---

## 내부 구조

```
StepIcon (84줄, 원본 161줄)
 ├─ CheckCircleIcon (인라인 SVG, 4-8줄)
 ├─ WarningIcon (인라인 SVG, 10-14줄)
 └─ StepIcon (메인 컴포넌트, 16-82줄)
     ├─ color 계산 (1줄)
     ├─ error → <span><WarningIcon /></span>
     ├─ completed → <span><CheckCircleIcon /></span>
     ├─ 기본 → <svg><circle /><text>{icon}</text></svg>
     └─ node → return icon
```

---

## 커밋 히스토리로 보는 단순화 과정

### [1/3] styled → 인라인 스타일, 외부 아이콘 → 인라인 SVG (-48줄 +36줄)

**삭제한 것**:
- `styled(SvgIcon)` StepIconRoot — SvgIcon 베이스, memoTheme 색상, CSS 클래스 기반 상태
- `styled('text')` StepIconText — fill/fontSize/fontFamily 테마값
- `import CheckCircle, Warning, SvgIcon` — 외부 아이콘 의존성
- `memoTheme()` + color transition 애니메이션

**추가한 것**:
- CheckCircleIcon, WarningIcon 인라인 SVG
- `const color = error ? '#d32f2f' : (active || completed) ? '#1976d2' : '#bdbdbd'`

### [2/3] useUtilityClasses, composeClasses, classes prop 제거 (-23줄)

**삭제한 것**:
- `useUtilityClasses()` 함수
- `composeClasses`, `stepIconClasses`, `getStepIconUtilityClass` import
- `classes.root`, `classes.text` 사용 → `className` 직접 사용

### [3/3] useDefaultProps, PropTypes, ownerState 제거 (-50줄)

**삭제한 것**:
- `useDefaultProps({ props: inProps, name: 'MuiStepIcon' })`
- `const ownerState = { ...props, active, completed, error }`
- `PropTypes` import + `StepIcon.propTypes` 전체 (42줄)

---

## 원본과의 차이점

| 항목 | 원본 | 단순화 후 |
|---|---|---|
| **코드 라인** | 161줄 | 84줄 (48% 감소) |
| **Import 개수** | 8개 | 1개 (React만) |
| **styled 컴포넌트** | 2개 (StepIconRoot, StepIconText) | ❌ |
| **외부 아이콘** | CheckCircle, Warning, SvgIcon | ❌ → 인라인 SVG |
| **memoTheme** | ✅ | ❌ → 하드코딩 (#1976d2 등) |
| **color transition** | ✅ | ❌ |
| **useUtilityClasses** | ✅ | ❌ |
| **classes prop** | ✅ | ❌ |
| **useDefaultProps** | ✅ | ❌ |
| **PropTypes** | ✅ (42줄) | ❌ |
| **분기 로직** | ✅ | ✅ 유지 |
| **pass-through (node)** | ✅ | ✅ 유지 |
| **error 우선순위** | ✅ | ✅ 유지 |
