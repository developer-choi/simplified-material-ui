# NativeSelectInput 컴포넌트

> 네이티브 `<select>` 엘리먼트를 Material-UI 스타일로 렌더링하는 단순화된 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Material-UI는 라이브러리 코드라서 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

---

## 무슨 기능을 하는가?

수정된 NativeSelectInput은 **네이티브 `<select>` 엘리먼트와 드롭다운 아이콘을 렌더링하는 내부 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **Select 엘리먼트 렌더링** - 브라우저 네이티브 `<select>` 태그 출력
2. **드롭다운 아이콘 표시** - select 옆에 화살표 아이콘 렌더링 (multiple 제외)
3. **상태 기반 스타일링** - disabled, open 상태에 따른 스타일링

---

## 핵심 학습 포인트

이 컴포넌트에서 배울 수 있는 **핵심 개념과 패턴**을 코드와 함께 설명합니다.

### 1. 브라우저 기본 스타일 제거

```javascript
const selectStyle = {
  MozAppearance: 'none',        // Firefox
  WebkitAppearance: 'none',     // Chrome, Safari
  userSelect: 'none',           // 텍스트 선택 방지
  borderRadius: 0,
  cursor: disabled ? 'default' : 'pointer',
  paddingRight: 24,             // 아이콘을 위한 공간
  minWidth: 16,
};
```

**학습 가치**:
- **MozAppearance/WebkitAppearance**: 브라우저별 기본 화살표 제거
- **vendor prefix**: 각 브라우저 엔진별 접두사 (moz-, webkit-)
- **userSelect: 'none'**: 빠른 상호작용 시 텍스트 선택 방지

**왜 필요한가?**
- 네이티브 select는 브라우저마다 다른 기본 스타일이 있습니다
- Material-UI 디자인 시스템과 통합하려면 기본 스타일을 제거해야 합니다

### 2. 절대 위치 아이콘 (pointerEvents: 'none')

```javascript
const iconStyle = {
  position: 'absolute',          // select 위에 겹치기
  right: 0,
  top: 'calc(50% - .5em)',      // 수직 중앙 정렬
  pointerEvents: 'none',         // 클릭을 select로 전달 ★ 핵심
  color: disabled ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.54)',
  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
};
```

**학습 가치**:
- **pointerEvents: 'none'**: 아이콘 클릭을 무시하고 밑의 select로 전달
- **position: absolute**: select 오른쪽에 겹쳐서 렌더링
- **transform**: open 상태일 때 아이콘 회전

**왜 pointerEvents: 'none'인가?**

```javascript
// pointerEvents: 'none' 없으면
<svg style={{ position: 'absolute', right: 0 }}>
  ❌ 아이콘 클릭 → select 열리지 않음 (아이콘이 클릭을 가로챔)
</svg>

// pointerEvents: 'none' 있으면
<svg style={{ position: 'absolute', right: 0, pointerEvents: 'none' }}>
  ✅ 아이콘 클릭 → select 열림 (클릭이 select로 전달됨)
</svg>
```

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/NativeSelect/NativeSelectInput.js (55줄, 원본 253줄)

NativeSelectInput
  └─> Fragment
       ├─> <select>          ← 네이티브 select 엘리먼트
       │    └─> {children}   // <option> 엘리먼트들
       └─> <ArrowDropDownIcon /> ← multiple=false일 때만
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `disabled` | boolean | select 비활성화 상태 |
| `error` | boolean | 에러 상태 (스타일링에 활용 가능) |
| `multiple` | boolean | 다중 선택 여부 (true면 아이콘 숨김) |
| `open` | boolean | 드롭다운 열림 상태 (아이콘 회전) |

### 3. 동작 흐름

#### NativeSelectInput 렌더링 플로우차트

```
props 전달 (disabled, error, multiple, open, ...)
        ↓
┌─────────────────────────────────┐
│ 스타일 객체 생성                  │
│  - selectStyle: disabled에 따른 cursor  │
│  - iconStyle: disabled, open에 따른 색상/회전 │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ Fragment 렌더링                  │
│  ├─> <select style={selectStyle}> │
│  └─> !multiple ? <Icon> : null │
└─────────────────────────────────┘
```

#### 시나리오 예시

**시나리오 1: 단일 선택 (multiple=false)**
```
사용자가 select 클릭
  → 네이티브 드롭다운 열림
  → open=true → 아이콘 180도 회전
  → 옵션 선택 → onChange 이벤트 발생
```

**시나리오 2: 다중 선택 (multiple=true)**
```
multiple=true
  → 아이콘 숨김 (드롭다운 화살표 불필요)
  → 높이 자동 조정 (height: auto)
  → 여러 옵션 선택 가능
```

---

## 주요 변경 사항 (원본 대비)

```javascript
// 변경 전: styled-components
export const StyledSelectSelect = styled('select', {
  name: 'MuiNativeSelect',
})(({ theme }) => ({
  MozAppearance: 'none',
  // ... 100줄의 스타일 정의
}));

const NativeSelectSelect = styled(StyledSelectSelect, {
  slot: 'Select',
  shouldForwardProp: rootShouldForwardProp,
  overridesResolver: (props, styles) => [...],
})({});

// 변경 후: 인라인 스타일
const selectStyle = {
  MozAppearance: 'none',
  borderRadius: 0,
  cursor: disabled ? 'default' : 'pointer',
  // ...
};

<select style={selectStyle} />
```

**원본과의 차이**:
- ❌ `styled()` 제거 → 일반 `<select>` 엘리먼트 사용
- ❌ `overridesResolver` 제거 → 테마 오버라이드 불가
- ❌ `variants` 배열 제거 → 인라인 style로 대체
- ❌ `useUtilityClasses` 제거 → 클래스 시스템 제거
- ❌ `clsx()` 제거 → className 병합 불필요
- ❌ `variant` prop 제거 → standard만 지원
- ❌ `IconComponent` prop 제거 → ArrowDropDownIcon 고정
- ❌ `inputRef` prop 제거 → ref만 사용
- ✅ 핵심 기능 유지 → 네이티브 select 렌더링

---

## 커밋 히스토리로 보는 단순화 과정

NativeSelectInput은 **8개의 커밋**을 통해 단순화되었습니다.

### 1단계: PropTypes 제거

- `30837b8a` - [NativeSelect 단순화 1/8] PropTypes 제거

**삭제된 코드**:
```javascript
NativeSelectInput.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  disabled: PropTypes.bool,
  // ... 54줄의 PropTypes 정의
};
```

**왜 불필요한가**:
- **학습 목적**: PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님
- **복잡도**: 54줄의 정의가 실제 코드보다 길음

### 2단계: Variant 시스템 제거

- `a61b4c7b` - [NativeSelect 단순화 2/8] variant 시스템 제거 및 standard 고정

**삭제된 코드**:
```javascript
variants: [
  {
    props: ({ ownerState }) => ownerState.variant !== 'filled' && ownerState.variant !== 'outlined',
    style: { '&&&': { paddingRight: 24 } },
  },
  {
    props: { variant: 'filled' },
    style: { '&&&': { paddingRight: 32 } },
  },
  {
    props: { variant: 'outlined' },
    style: { borderRadius: theme.shape.borderRadius, ... },
  },
]
```

**왜 불필요한가**:
- **학습 목적**: 하나의 variant(standard)로도 개념 이해 충분
- **복잡도**: 3가지 variant × 조건부 스타일링 = 복잡한 조합

### 3단계: IconComponent 커스터마이징 제거

- `e9039c93` - [NativeSelect 단순화 3/8] IconComponent 고정으로 변경

**삭제된 코드**:
```javascript
<NativeSelectIcon as={IconComponent} />  // 동적 컴포넌트

// 변경 후
<ArrowDropDownIcon />  // 고정된 아이콘
```

**왜 불필요한가**:
- **학습 목적**: 고정된 아이콘으로도 컴포넌트 이해 가능
- **현실**: 대부분 기본값(ArrowDropDownIcon) 사용

### 4단계: inputRef deprecated prop 제거

- `8c0811fb` - [NativeSelect 단순화 4/8] inputRef deprecated prop 제거

**삭제된 코드**:
```javascript
ref={inputRef || ref}  // 하위 호환성을 위한 병합

// 변경 후
ref={ref}  // ref만 사용
```

**왜 불필요한가**:
- **학습 목적**: 하위 호환성은 프로덕션 라이브러리의 책임
- **현실**: 이미 deprecated로 표시됨

### 5단계: 스타일 시스템 제거

- `4debf50b` - [NativeSelectInput 단순화 5/8] useUtilityClasses, composeClasses, 클래스 시스템 제거

**삭제된 코드**:
```javascript
const useUtilityClasses = (ownerState) => {
  const slots = {
    select: ['select', disabled && 'disabled', ...],
    icon: ['icon', open && 'iconOpen', ...],
  };
  return composeClasses(slots, getNativeSelectUtilityClasses, classes);
};

className={clsx(classes.select, className)}
```

**왜 불필요한가**:
- **학습 목적**: 클래스 병합은 CSS-in-JS의 고급 주제
- **복잡도**: useUtilityClasses, composeClasses, clsx 3단계 병합

### 6단계: styled-components 제거

- `b1305365` - [NativeSelectInput 단순화 6/8] styled-components 제거 및 인라인 스타일로 변경

**삭제된 코드**:
```javascript
export const StyledSelectSelect = styled('select', {...})(({ theme }) => ({
  MozAppearance: 'none',
  // ... 40줄의 스타일
}));

const NativeSelectSelect = styled(StyledSelectSelect, {
  slot: 'Select',
  shouldForwardProp: rootShouldForwardProp,
  overridesResolver: (props, styles) => [...],
})({});
```

**왜 불필요한가**:
- **학습 목적**: styled() API 이해가 목적이 아님
- **복잡도**: 2중 wrapped, overridesResolver, variants 배열 등

### 7단계: NativeSelect wrapper 단순화

- `6ac30467` - [NativeSelect 단순화 7/8] input prop 제거 및 NativeSelectInput 직접 렌더링

**삭제된 코드**:
```javascript
// NativeSelect.js
{React.cloneElement(input, {
  inputComponent: NativeSelectInput,
  inputProps: {
    children,
    classes: otherClasses,
    ...inputProps,
    ...(input ? input.props.inputProps : {}),
  },
  ref,
  ...other,
})}

// 변경 후
<NativeSelectInput ref={ref} {...props}>
  {children}
</NativeSelectInput>
```

**왜 불필요한가**:
- **학습 목적**: NativeSelect의 핵심은 NativeSelectInput 사용법이지 Input 통합 방법이 아님
- **복잡도**: React.cloneElement, inputProps 병합 로직

### 8단계: useDefaultProps 제거

- `4d612f32` - [NativeSelect 단순화 8/8] useDefaultProps 제거

**삭제된 코드**:
```javascript
const props = useDefaultProps({ name: 'MuiNativeSelect', props: inProps });
const { children, ... } = props;

// 변경 후
const { children, ... } = props;  // props 직접 사용
```

**왜 불필요한가**:
- **학습 목적**: 함수 파라미터 기본값으로 충분
- **복잡도**: props vs inProps 구분

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 253줄 | 55줄 (78% 감소) |
| **Props 개수** | 11개 | 7개 |
| **스타일링** | styled-components | 인라인 style |
| **Variant** | standard, outlined, filled | standard만 |
| **클래스 시스템** | useUtilityClasses, composeClasses | 없음 |
| **커스터마이징** | IconComponent, classes, input | 없음 |
| **하위 호환성** | inputRef deprecated props | 없음 |

---

## 학습 후 다음 단계

NativeSelectInput을 이해했다면:

1. **SelectInput** - Menu 기반 커스텀 드롭다운 구현
   - NativeSelectInput과의 차이: 네이티브 vs 커스텀
   - Menu 컴포넌트와의 통합 방법

2. **InputBase** - Form Input의 기반 컴포넌트
   - NativeSelect와의 통합 방법 (원본)
   - FormControl Context와의 연결

3. **실전 응용** - 나만의 Select 컴포넌트 만들기

**예시: 기본 사용**
```javascript
import NativeSelect from '@mui/material/NativeSelect';

<NativeSelect value={value} onChange={handleChange}>
  <option value={10}>Ten</option>
  <option value={20}>Twenty</option>
  <option value={30}>Thirty</option>
</NativeSelect>
```

**예시: 비활성화 상태**
```javascript
<NativeSelect disabled value={value}>
  <option value={1}>Option 1</option>
</NativeSelect>
```

**예시: 다중 선택**
```javascript
<NativeSelect multiple value={[10, 20]} onChange={handleChange}>
  <option value={10}>Ten</option>
  <option value={20}>Twenty</option>
  <option value={30}>Thirty</option>
</NativeSelect>
```
