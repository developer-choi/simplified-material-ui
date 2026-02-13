# ButtonGroup 컴포넌트

> 여러 Button을 그룹으로 묶고 Context로 props를 전달하는 컨테이너

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

ButtonGroup의 핵심은 Context 패턴과 위치 기반 className 전달입니다. 이 문서는 이러한 패턴들이 어떻게 동작하는지 상세히 설명합니다.

---

## 무슨 기능을 하는가?

단순화된 ButtonGroup는 **여러 Button을 그룹으로 묶고, Context로 공통 props를 전달하며, 위치별로 다른 className을 제공하는 컨테이너** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **ButtonGroupContext** - 자식 Button들에게 color, variant, size, className 전달
2. **ButtonGroupButtonContext** - 각 버튼의 위치 className 전달 (firstButton, middleButton, lastButton)
3. **getValidReactChildren** - null, undefined, boolean 제거하여 유효한 자식만 필터링
4. **getButtonPositionClassName** - 배열 인덱스로 각 버튼의 위치 판단

---

## 핵심 학습 포인트

### 1. 중첩된 Context 패턴

```javascript
<ButtonGroupContext.Provider value={context}>
  {validChildren.map((child, index) => (
    <ButtonGroupButtonContext.Provider
      key={index}
      value={getButtonPositionClassName(index)}
    >
      {child}
    </ButtonGroupButtonContext.Provider>
  ))}
</ButtonGroupContext.Provider>
```

**학습 가치**:
- **2단계 Context 구조**: 공통 props (ButtonGroupContext) + 개별 className (ButtonGroupButtonContext)
- 각 자식마다 별도의 ButtonGroupButtonContext.Provider로 감싸서 위치별 className 전달
- Button 컴포넌트가 두 Context를 모두 사용

### 2. getValidReactChildren으로 자식 필터링

```javascript
const validChildren = getValidReactChildren(children);
const childrenCount = validChildren.length;
```

**학습 가치**:
- `null`, `undefined`, `false`, `true` 제거
- 조건부 렌더링 지원: `{condition && <Button />}` → condition이 false면 제외
- 실제 렌더링될 Button 개수만 계산

### 3. 배열 인덱스로 위치 판단

```javascript
const getButtonPositionClassName = (index) => {
  const isFirstButton = index === 0;
  const isLastButton = index === childrenCount - 1;

  if (isFirstButton && isLastButton) {
    return '';  // 버튼이 하나뿐이면 위치 클래스 없음
  }
  if (isFirstButton) {
    return classes.firstButton;
  }
  if (isLastButton) {
    return classes.lastButton;
  }
  return classes.middleButton;
};
```

**학습 가치**:
- CSS 선택자 대신 JavaScript로 위치 판단
- 버튼이 하나뿐이면 firstButton/lastButton 클래스 불필요
- 명시적이고 제어 가능한 방식

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/ButtonGroup/ButtonGroup.js (90줄, 원본 445줄)

ButtonGroup (forwardRef)
  └─> div (role="group")
       └─> ButtonGroupContext.Provider
            └─> ButtonGroupButtonContext.Provider (각 자식마다)
                 └─> Button (children)
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `classes` | 객체 | 하드코딩된 className 문자열 |
| `context` | useMemo | ButtonGroupContext에 전달할 값 |
| `validChildren` | 배열 | 유효한 자식 요소들 |
| `childrenCount` | 숫자 | 유효한 자식 개수 |

### 3. 함수 역할

#### getButtonPositionClassName(index)

- **역할**: 버튼의 위치에 따른 className 반환
- **호출 시점**: validChildren.map() 내부
- **핵심 로직**:

```javascript
// 1. 위치 판단
const isFirstButton = index === 0;
const isLastButton = index === childrenCount - 1;

// 2. className 반환
if (isFirstButton && isLastButton) return '';  // 버튼 하나
if (isFirstButton) return 'MuiButtonGroup-firstButton';
if (isLastButton) return 'MuiButtonGroup-lastButton';
return 'MuiButtonGroup-middleButton';
```

- **왜 이렇게 구현했는지**: Button 컴포넌트가 이 className을 받아 border-radius를 조정

### 4. 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `variant` prop 제거 → 'outlined'로 고정
- ❌ `orientation` prop 제거 → 'horizontal'로 고정
- ❌ `color` prop 제거 → 'primary'로 고정
- ❌ `size` prop 제거 → 'medium'로 고정
- ❌ `disabled`, `disableElevation`, `disableFocusRipple`, `disableRipple` 제거
- ❌ `fullWidth`, `component` 제거
- ❌ styled 시스템 (240줄) → 인라인 스타일 (3줄)
- ❌ useUtilityClasses, composeClasses → 하드코딩된 classes 객체
- ❌ PropTypes (88줄) 제거
- ✅ Context 패턴 유지
- ✅ getValidReactChildren 유지
- ✅ getButtonPositionClassName 로직 유지

### 5. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | Button 컴포넌트들 |
| `className` | string | - | 추가 CSS 클래스 |
| `...other` | any | - | 기타 HTML 속성 |

**제거된 Props**:
- ❌ `variant`, `orientation`, `color`, `size` - 모두 고정값으로 변경
- ❌ `disabled`, `disableElevation`, `disableFocusRipple`, `disableRipple` - 복잡도 감소
- ❌ `fullWidth`, `component` - 학습에 불필요

---

## 커밋 히스토리로 보는 단순화 과정

ButtonGroup는 **11개의 커밋**을 통해 단순화되었습니다.

### Commit 1-4: Props 고정

- `1b0d80e8` - variant를 'outlined'로 고정
- `7c818b20` - orientation을 'horizontal'로 고정
- `c6ce1149` - color를 'primary'로 고정
- `2b26ce5f` - size를 'medium'로 고정

**이유**: 42가지 조합 (3 variant × 2 orientation × 7 color) → 1가지로 단순화

### Commit 5-7: Disable Props 제거

- `10f9d873` - disabled, disableElevation 제거
- `48c2842b` - disableFocusRipple, disableRipple 제거
- `ad808193` - fullWidth 제거

**이유**: Button 컴포넌트의 책임이며, Context로만 전달하므로 학습 가치 낮음

### Commit 8: Component Prop 제거

- `f78e68a5` - component prop 제거, div로 고정

**이유**: 다형성은 ButtonGroup의 핵심이 아님

### Commit 9-10: System 제거

- `f9caf66c` - Theme 시스템 제거 (useDefaultProps, useUtilityClasses, composeClasses)
- `3c22f795` - Styled 시스템 제거 (styled, memoTheme, ownerState, 240줄 variants)

**이유**: 핵심은 "Context 패턴"이지 "Theme/Styled 시스템"이 아님

### Commit 11: PropTypes 제거

- `561f2335` - PropTypes 제거 (88줄)

**이유**: TypeScript로 타입 검증 가능

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 445줄 | 90줄 (79.8% 감소) |
| **Props 개수** | 11개 | 2개 (children, className) |
| **variant** | ✅ contained/outlined/text | ❌ outlined 고정 |
| **orientation** | ✅ horizontal/vertical | ❌ horizontal 고정 |
| **color** | ✅ 7가지 | ❌ primary 고정 |
| **size** | ✅ small/medium/large | ❌ medium 고정 |
| **styled 시스템** | ✅ 240줄 | ❌ 인라인 스타일 3줄 |
| **Context 패턴** | ✅ | ✅ (유지) |
| **getValidReactChildren** | ✅ | ✅ (유지) |
| **위치 className** | ✅ | ✅ (유지) |

---

## 학습 후 다음 단계

ButtonGroup를 이해했다면:

1. **Button** - ButtonGroup과 함께 사용되는 컴포넌트, Context를 통해 props 받는 방법 학습
2. **중첩 Context 패턴** - 여러 Context를 함께 사용하는 고급 패턴
3. **Compound Component 패턴** - 부모-자식 간 암묵적 통신 패턴
4. **실전 응용** - 커스텀 그룹 컴포넌트 만들기 (ToggleButtonGroup, SegmentedControl 등)

**예시: 기본 사용**
```javascript
import ButtonGroup from './ButtonGroup';
import Button from '@mui/material/Button';

function App() {
  return (
    <ButtonGroup>
      <Button>첫 번째</Button>
      <Button>두 번째</Button>
      <Button>세 번째</Button>
    </ButtonGroup>
  );
}
```

**예시: 조건부 렌더링**
```javascript
<ButtonGroup>
  <Button>항상 표시</Button>
  {showSecond && <Button>조건부</Button>}
  <Button>마지막</Button>
</ButtonGroup>
// getValidReactChildren이 false 제거, 올바른 위치 className 전달
```

---

## 결론

단순화된 ButtonGroup의 핵심은:
- ✅ **Context 패턴**: 자식들에게 props를 암묵적으로 전달
- ✅ **중첩 Context**: 공통 props + 개별 className 분리
- ✅ **위치 기반 로직**: JavaScript로 명시적 제어

**핵심 교훈**: 복잡한 styled 시스템, 수십 가지 variant 조합을 제거해도, Context 패턴만으로 그룹화와 props 전달이라는 핵심 기능을 충분히 구현할 수 있습니다.
