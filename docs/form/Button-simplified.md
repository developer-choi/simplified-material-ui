# Button 컴포넌트

> 학습 목적으로 단순화된 Material-UI Button 컴포넌트

---

## 무슨 기능을 하는가?

단순화된 Button은 **사용자의 클릭 액션을 받아 이벤트를 발생시키는 기본적인 인터랙티브 UI 요소**입니다.

### 핵심 기능 (남은 것)
1. **클릭 이벤트 처리** - onClick 핸들러로 사용자 액션 처리
2. **시각적 스타일 변형** - variant(text/outlined/contained), color(3가지), size(3가지) 조합
3. **로딩 상태 표시** - loading prop으로 비동기 작업 진행 중임을 시각적으로 표현 (center 위치 고정)
4. **아이콘 통합** - startIcon/endIcon으로 버튼 내 아이콘 배치
5. **ButtonGroup 통합** - ButtonGroup 내부에서 Context로 props 공유

---

## 핵심 학습 포인트

### 1. 인라인 스타일 계산 함수 패턴

```javascript
const getButtonStyles = (variant, color, size, loading) => {
  const styles = {
    minWidth: 64,
    padding: '6px 16px',
    border: 0,
    borderRadius: 4,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
  };

  // variant별 기본 스타일
  if (variant === 'text') {
    styles.padding = '6px 8px';
  } else if (variant === 'outlined') {
    styles.padding = '5px 15px';
    styles.border = '1px solid';
  } else if (variant === 'contained') {
    styles.boxShadow = '0px 3px 1px -2px rgba(0,0,0,0.2), ...';
  }

  // size, color, loading 조건별 스타일 추가
  // ...

  return styles;
};
```

**학습 가치**:
- CSS-in-JS의 복잡한 styled components 대신 **순수 JavaScript 함수로 스타일 계산**
- props 조합에 따른 스타일을 **조건문으로 명확하게 표현**
- theme 시스템 없이도 **하드코딩된 값으로 충분히 동작** 가능함을 이해
- 런타임에 동적으로 스타일을 생성하는 방식

### 2. Context 기반 Props 병합

```javascript
const contextProps = React.useContext(ButtonGroupContext);
const props = resolveProps(contextProps, inProps);
```

**학습 가치**:
- ButtonGroup이 Context로 variant, size, color 등을 **자식 Button에 자동 전달**
- `resolveProps`로 **직접 전달된 props가 Context props보다 우선**
- 컴포넌트 합성(Composition) 패턴의 실용적 사용 예시

### 3. 조건부 렌더링과 Placeholder 패턴

```javascript
const loader = typeof loading === 'boolean' ? (
  <span style={{ display: 'contents' }}>
    {loading && (
      <ButtonLoadingIndicator ownerState={ownerState}>
        <CircularProgress aria-labelledby={loadingId} color="inherit" size={16} />
      </ButtonLoadingIndicator>
    )}
  </span>
) : null;
```

**학습 가치**:
- `typeof loading === 'boolean'`로 **명시적 boolean 타입만 처리**
- `display: 'contents'`로 wrapper가 레이아웃에 영향을 주지 않도록 처리
- loading이 true일 때만 CircularProgress 렌더링

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Button/Button.js (257줄, 원본 748줄)
Button (React.forwardRef)
  └─> ButtonBase
       ├─> ButtonStartIcon (startIcon이 있을 때)
       ├─> loader wrapper
       │    └─> ButtonLoadingIndicator (loading === true일 때)
       │         └─> CircularProgress
       ├─> children (버튼 텍스트/내용)
       └─> ButtonEndIcon (endIcon이 있을 때)
```

### 2. 스타일 시스템 단순화

**원본과의 차이**:
- ❌ `ButtonRoot` styled component 제거 → `ButtonBase` 직접 사용
- ❌ `memoTheme` 메모이제이션 제거 → 간단한 스타일 계산 함수
- ❌ `variants` 배열 (16개 항목) 제거 → 조건문으로 대체
- ❌ theme 시스템 통합 제거 → 하드코딩된 색상 값 사용
- ✅ `ButtonStartIcon`, `ButtonEndIcon`, `ButtonLoadingIndicator`는 유지 (styled components)

```javascript
// 원본: styled component with memoTheme
const ButtonRoot = styled(ButtonBase, {...})(
  memoTheme(({ theme }) => ({
    ...theme.typography.button,
    variants: [...]  // 16개 항목
  }))
);

// 단순화: 인라인 스타일 계산 함수
const buttonStyles = getButtonStyles(variant, color, size, loading);
<ButtonBase style={buttonStyles} ... />
```

### 3. Props 단순화

**원본과의 차이**:
- ❌ `loadingPosition` 제거 → 항상 center 고정
- ❌ `loadingIndicator` 제거 → CircularProgress 고정
- ❌ `color` 7가지 → 3가지만 (primary/secondary/error)
- ❌ `fullWidth` 제거 → CSS로 직접 제어
- ❌ `disableElevation` 제거 → 항상 elevation 활성화
- ❌ `disableRipple`, `disableFocusRipple` 제거 → 항상 ripple 활성화
- ❌ `component` 제거 → 항상 button 요소

### 4. Theme 시스템 제거

**원본과의 차이**:
- ❌ `useDefaultProps` 제거 → 함수 파라미터 기본값 사용
- ❌ `useUtilityClasses` 제거 → className 자동 생성 제거
- ❌ `composeClasses`, `getButtonUtilityClass` 제거

### 5. Props (11개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 버튼 내용 |
| `color` | 'primary' \| 'secondary' \| 'error' | 'primary' | 색상 (3가지만) |
| `variant` | 'text' \| 'outlined' \| 'contained' | 'text' | 버튼 스타일 |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | 버튼 크기 |
| `loading` | boolean \| null | null | 로딩 상태 (center 고정) |
| `startIcon` | ReactNode | - | 텍스트 앞 아이콘 |
| `endIcon` | ReactNode | - | 텍스트 뒤 아이콘 |
| `disabled` | boolean | false | 비활성화 |
| `onClick` | function | - | 클릭 핸들러 |
| `type` | 'button' \| 'reset' \| 'submit' | - | Form 제출 타입 |
| `className`, `style` | - | - | 외부 스타일 |

---

## 커밋 히스토리로 보는 단순화 과정

Button은 **12개의 커밋**을 통해 단순화되었습니다.

### 1단계: Loading 시스템 단순화
- `0c7dd544` - [Button 단순화 1/12] loadingPosition prop 제거
  - loadingPosition (start/center/end) 제거, center로 고정
  - 왜 불필요?: 위치 선택은 디자인 세부사항, 하나의 위치(center)로도 충분히 로딩 개념 이해 가능

- `f729e737` - [Button 단순화 2/12] loadingIndicator prop 제거
  - 커스텀 로딩 인디케이터 제거, CircularProgress 고정
  - 왜 불필요?: 커스터마이징보다는 기본 동작 이해가 중요, 고정된 인디케이터로도 충분

### 2단계: Style Props 제거
- `54858388` - [Button 단순화 3/12] Color prop 단순화 (3가지만)
  - color 7가지 → 3가지 (primary/secondary/error)
  - 왜 불필요?: success/info/warning은 디자인 시스템의 확장 개념, 3가지로도 충분

- `7c5eb8a0` - [Button 단순화 4/12] fullWidth prop 제거
  - fullWidth 제거, CSS로 직접 제어
  - 왜 불필요?: Button의 핵심은 클릭 이벤트이지 레이아웃이 아님, CSS width: 100%로 충분

- `1a855ae5` - [Button 단순화 5/12] disableElevation prop 제거
  - disableElevation 제거, 항상 elevation 활성화
  - 왜 불필요?: Material Design의 elevation은 깊이감 표현의 핵심, 제거는 커스터마이징 영역

### 3단계: Ripple Props 제거
- `f4f6e774` - [Button 단순화 6/12] disableRipple prop 제거
  - disableRipple 제거, 항상 ripple 활성화
  - 왜 불필요?: Ripple은 Material Design의 시각적 피드백 핵심, ButtonBase에서 별도 학습

- `df297b22` - [Button 단순화 7/12] disableFocusRipple prop 제거
  - disableFocusRipple 제거, 항상 focus ripple 활성화
  - 왜 불필요?: Focus ripple은 접근성(accessibility)의 핵심, 키보드 사용자에게 필수

### 4단계: Component Prop 제거
- `cfd6dc80` - [Button 단순화 8/12] component prop 제거
  - component prop 제거, 항상 button 요소 사용
  - 왜 불필요?: 다형성(polymorphism)은 고급 TypeScript 주제, Link가 필요하면 별도 컴포넌트 작성

### 5단계: Theme 시스템 제거
- `7b32bd30` - [Button 단순화 9/12] useDefaultProps 제거
  - useDefaultProps 제거, 함수 파라미터 기본값 사용
  - 왜 불필요?: 테마 시스템은 Material-UI 전체 주제, 함수 기본값이 더 직관적

- `b9b16a01` - [Button 단순화 10/12] useUtilityClasses 제거
  - useUtilityClasses 제거, className 자동 생성 제거
  - 왜 불필요?: Button의 핵심은 클릭 이벤트이지 className 생성이 아님, 테마 커스터마이징용

### 6단계: Styled Components 제거
- `33c6780e` - [Button 단순화 11/12] Styled Components 제거
  - ButtonRoot styled component 제거, ButtonBase 직접 사용
  - memoTheme, variants 배열 → 간단한 스타일 계산 함수로 대체
  - 왜 불필요?: CSS-in-JS는 별도 학습 주제, 인라인 스타일이 더 직관적

### 7단계: PropTypes 제거
- `fb51f3df` - [Button 단순화 12/12] PropTypes 제거
  - PropTypes 전체 제거 (88줄)
  - 왜 불필요?: PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님, TypeScript가 더 강력

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 748줄 | 257줄 (65.6% 감소) |
| **Props 개수** | 20개 | 11개 |
| **Color 옵션** | 7가지 | 3가지 |
| **Styled Components** | 5개 (ButtonRoot, StartIcon, EndIcon, LoadingIndicator, Placeholder) | 3개 (StartIcon, EndIcon, LoadingIndicator만 유지) |
| **Theme 시스템** | ✅ useDefaultProps, useUtilityClasses, memoTheme | ❌ 모두 제거 |
| **Loading 위치** | start/center/end 선택 가능 | center 고정 |
| **PropTypes** | 128줄 | ❌ 제거 |
| **다형성 지원** | ✅ component prop | ❌ button으로 고정 |

---

## 학습 후 다음 단계

Button을 이해했다면:

1. **ButtonBase** - ripple 효과, 포커스 관리, 키보드 접근성의 기반
2. **ButtonGroup** - Context로 props 공유하는 컨테이너 패턴
3. **IconButton** - 아이콘만 있는 버튼 (Button의 변형)
4. **실전 응용** - Form 제출, 비동기 작업 처리, 조건부 비활성화

**예시: 기본 사용**
```javascript
import Button from '@mui/material/Button';

function MyForm() {
  const handleSubmit = () => {
    console.log('Form submitted');
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
      <Button variant="outlined" color="secondary">
        Cancel
      </Button>
      <Button variant="text" color="error">
        Delete
      </Button>
    </div>
  );
}
```

**예시: 로딩 상태와 아이콘**
```javascript
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';

function SaveButton() {
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    setLoading(true);
    await saveData();
    setLoading(false);
  };

  return (
    <Button
      variant="contained"
      color="primary"
      loading={loading}
      startIcon={<SaveIcon />}
      onClick={handleSave}
    >
      Save
    </Button>
  );
}
```

**예시: Size 변형**
```javascript
<Button size="small" variant="contained">Small</Button>
<Button size="medium" variant="contained">Medium</Button>
<Button size="large" variant="contained">Large</Button>
```
