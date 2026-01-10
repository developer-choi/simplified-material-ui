# InputAdornment 컴포넌트

> Input 필드 양 끝에 아이콘이나 텍스트를 배치하는 단순한 장식 컴포넌트

---

## 무슨 기능을 하는가?

수정된 InputAdornment는 **Input, TextField 등의 입력 필드 양 끝에 아이콘이나 텍스트를 배치하여 사용자 경험을 향상시키는 레이아웃 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **위치 기반 렌더링** - position prop('start' 또는 'end')에 따라 입력 필드의 앞/뒤에 배치
2. **Flexbox 레이아웃** - children을 flex 컨테이너로 감싸서 정렬
3. **Vertical Alignment** - position='start'일 때 zero-width space로 baseline 정렬 보정
4. **포인터 이벤트 제어** - disablePointerEvents로 클릭 이벤트를 하위 input으로 전달
5. **Variant 기반 스타일링** - variant prop에 따라 조건부 margin 적용

---

## 핵심 학습 포인트

### 1. Zero-width Space를 활용한 Baseline 정렬

```javascript
{position === 'start' ? (
  <span className="notranslate" aria-hidden>
    &#8203;
  </span>
) : null}
{children}
```

**학습 가치**:
- CSS Flexbox에서 baseline 정렬 시 참조점이 필요함
- Zero-width space(`&#8203;`, U+200B)는 보이지 않지만 텍스트 baseline을 제공
- position='start'일 때만 삽입하여 Input 텍스트와 아이콘의 수직 정렬을 맞춤
- `aria-hidden`으로 스크린 리더에서 제외
- `notranslate` 클래스로 Google Translate가 zero-width space를 잘못 처리하는 문제 방지

### 2. 인라인 스타일을 통한 조건부 스타일링

```javascript
<div
  style={{
    display: 'flex',
    maxHeight: '2em',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    color: '#757575',
    ...(position === 'start' && { marginRight: 8 }),
    ...(position === 'end' && { marginLeft: 8 }),
    ...(disablePointerEvents && { pointerEvents: 'none' }),
    ...(variantProp === 'filled' && position === 'start' && { marginTop: 16 }),
  }}
>
```

**학습 가치**:
- Spread 연산자(`...`)로 조건부 스타일 객체 병합
- position='start'일 때 marginRight: 8로 Input과 간격 유지
- position='end'일 때 marginLeft: 8로 Input과 간격 유지
- variant='filled' + position='start'일 때 marginTop: 16 추가 (FilledInput의 라벨 공간 확보)
- disablePointerEvents로 클릭 이벤트를 투과시켜 Input이 포커스를 받도록

### 3. 단순한 Flexbox 레이아웃 패턴

```javascript
display: 'flex',
maxHeight: '2em',
alignItems: 'center',
whiteSpace: 'nowrap',
```

**학습 가치**:
- Flexbox로 아이콘/텍스트를 수직 중앙 정렬
- `maxHeight: '2em'`으로 Input 높이에 맞춤
- `whiteSpace: 'nowrap'`으로 텍스트 줄바꿈 방지
- 아이콘과 텍스트가 한 줄에 표시되도록 보장

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/InputAdornment/InputAdornment.js (44줄, 원본 218줄)
<div style={...}>  // Flexbox 컨테이너
  {position === 'start' && <span>&#8203;</span>}  // Zero-width space
  {children}  // 아이콘 또는 텍스트
</div>
```

**원본과의 차이**:
- ❌ `InputAdornmentRoot` (styled div) 제거 → 일반 div + 인라인 스타일
- ❌ `FormControlContext.Provider` 제거 → children 격리 불필요
- ❌ `Typography` 자동 래핑 제거 → 사용자가 직접 래핑

### 2. Props (5개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | **(필수)** 렌더링할 콘텐츠 (주로 Icon) |
| `position` | 'start' \| 'end' | - | **(필수)** Input의 시작/끝 위치 |
| `className` | string | - | 추가 CSS 클래스 |
| `variant` | 'filled' \| 'outlined' \| 'standard' | - | Input variant (filled + start일 때 marginTop 적용) |
| `disablePointerEvents` | boolean | false | true일 때 클릭 이벤트가 Input으로 전달됨 |

**제거된 Props**:
- ❌ `component` - 항상 'div'로 고정
- ❌ `disableTypography` - Typography 자동 래핑 제거로 불필요
- ❌ `sx` - styled-components 제거로 불필요
- ❌ `classes` - utility classes 시스템 제거로 불필요

### 3. 스타일링 로직 단순화

**원본 (Styled Components)**:
```javascript
const InputAdornmentRoot = styled('div', {
  name: 'MuiInputAdornment',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    display: 'flex',
    color: (theme.vars || theme).palette.action.active,
    variants: [
      {
        props: { variant: 'filled' },
        style: { ... },
      },
      // ... 더 많은 variants
    ],
  })),
);
```

**수정본 (인라인 스타일)**:
```javascript
<div style={{
  display: 'flex',
  color: '#757575',
  ...(position === 'start' && { marginRight: 8 }),
  // ... 간단한 조건부 스타일
}}>
```

**변경 사항**:
- styled() API 제거 → 일반 div
- memoTheme 제거 → 고정 색상 `#757575`
- variants 배열 → spread 연산자로 조건부 스타일
- theme.vars 처리 → 하드코딩된 값

---

## 커밋 히스토리로 보는 단순화 과정

InputAdornment는 **7개의 커밋**을 통해 단순화되었습니다.

### 1단계: Theme 시스템 제거
- `35727169` - [InputAdornment 단순화 1/7] Theme 시스템 제거

**무엇을 제거했는가**:
- `useDefaultProps` hook 제거
- DefaultPropsProvider를 통한 theme 기반 props 주입 제거

**왜 불필요한가**:
- **학습 목적**: InputAdornment는 단순한 레이아웃 컴포넌트이므로 명시적인 props 전달이 더 명확
- **복잡도**: Theme 컨텍스트 의존성과 설정 파일이 불필요

### 2단계: FormControl 통합 제거
- `ba66a96f` - [InputAdornment 단순화 2/7] FormControl 통합 제거

**무엇을 제거했는가**:
- `useFormControl` hook 제거
- `FormControlContext.Provider value={null}` 래퍼 제거
- variant 자동 추론 로직 제거 (약 30줄)
- hiddenLabel, size 상태 상속 제거

**왜 불필요한가**:
- **학습 목적**: 암묵적 variant 전달은 초보자에게 혼란스러움. 명시적으로 전달하는 것이 더 명확
- **복잡도**: FormControl과의 양방향 통신이 학습용 컴포넌트에서는 과도함
- **현실/일관성**: InputAdornment를 독립적으로 사용할 때 더 직관적

### 3단계: Utility Classes 시스템 제거
- `81cc9105` - [InputAdornment 단순화 3/7] Utility Classes 시스템 제거

**무엇을 제거했는가**:
- `composeClasses` 제거
- `useUtilityClasses` 함수 제거 (14줄)
- `getInputAdornmentUtilityClass` 제거
- classes prop 제거

**왜 불필요한가**:
- **학습 목적**: Utility classes는 MUI의 고급 스타일 커스터마이징 기능. 학습용에서는 인라인 스타일로 충분
- **복잡도**: 동적 className 생성 로직 (약 20줄) 제거

### 4단계: Styled Components를 인라인 스타일로 전환
- `a21a6509` - [InputAdornment 단순화 4/7] Styled Components를 인라인 스타일로 전환

**무엇을 제거했는가**:
- `styled` API 제거
- `memoTheme` 제거
- `overridesResolver` 함수 제거 (9줄)
- `InputAdornmentRoot` 컴포넌트 정의 제거 (46줄)
- variants 배열 구조 제거

**왜 불필요한가**:
- **학습 목적**: Styled Components는 고급 스타일링 기법. 초보자는 인라인 스타일이 더 직관적
- **복잡도**: 약 50줄의 복잡한 스타일 정의 → 20줄의 간단한 인라인 스타일

**변경 후**:
```javascript
<div style={{
  display: 'flex',
  maxHeight: '2em',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  color: '#757575',
  ...(position === 'start' && { marginRight: 8 }),
  ...(position === 'end' && { marginLeft: 8 }),
  ...(disablePointerEvents && { pointerEvents: 'none' }),
  ...(variantProp === 'filled' && position === 'start' && { marginTop: 16 }),
}}>
```

### 5단계: Typography 자동 래핑 제거
- `fa958bb4` - [InputAdornment 단순화 5/7] Typography 자동 래핑 제거

**무엇을 제거했는가**:
- `Typography` import 제거
- `disableTypography` prop 제거
- `typeof children === 'string'` 조건 분기 제거 (약 15줄)

**왜 불필요한가**:
- **학습 목적**: 자동 래핑은 "마법 같은" 동작으로 혼란스러움. 명시적으로 원하는 컴포넌트를 전달하는 것이 더 명확
- **현실/일관성**: InputAdornment는 주로 Icon과 함께 사용되며, 문자열을 전달하는 경우는 드묾

**변경 후**:
```javascript
// 단순히 children을 그대로 렌더링
{position === 'start' ? (
  <span className="notranslate" aria-hidden>
    &#8203;
  </span>
) : null}
{children}
```

### 6단계: 부수적 기능 및 유틸리티 제거
- `6630ccf5` - [InputAdornment 단순화 6/7] 부수적 기능 및 유틸리티 제거

**무엇을 제거했는가**:
- `capitalize` 유틸리티 제거
- `component` prop 제거 (div로 고정)
- `ownerState` 객체 제거 (이전 단계에서 이미 제거됨)

**왜 불필요한가**:
- **학습 목적**: `component` prop (다형성)은 고급 패턴으로 학습 초반에는 불필요
- **복잡도**: capitalize는 제거된 기능들과 함께 사용되던 유틸리티

### 7단계: PropTypes 제거
- `80fa6a5c` - [InputAdornment 단순화 7/7] PropTypes 제거

**무엇을 제거했는가**:
- `PropTypes` import 제거
- `InputAdornment.propTypes` 블록 제거 (53줄)

**왜 불필요한가**:
- **학습 목적**: PropTypes는 레거시 타입 검증 방식. 현대적인 프로젝트는 TypeScript 사용
- **복잡도**: 53줄의 PropTypes 정의는 컴포넌트 로직(44줄)보다 길어서 학습 방해
- **현실/일관성**: TypeScript로 컴파일 타임에 타입 체크. PropTypes는 개발 환경에서만 작동

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 218줄 | 44줄 (79.8% 감소) |
| **Props 개수** | 9개 | 5개 |
| **Theme 시스템** | ✅ useDefaultProps | ❌ 제거 |
| **FormControl 통합** | ✅ variant 자동 추론 | ❌ 명시적 전달 필요 |
| **Utility Classes** | ✅ useUtilityClasses | ❌ 'MuiInputAdornment-root'만 사용 |
| **Styled Components** | ✅ styled() + memoTheme | ❌ 인라인 스타일 |
| **Typography 래핑** | ✅ 문자열 자동 래핑 | ❌ children 그대로 렌더링 |
| **다형성** | ✅ component prop | ❌ div 고정 |
| **PropTypes** | ✅ 53줄 | ❌ 제거 |
| **Zero-width Space** | ✅ 유지 | ✅ 유지 (핵심 기능) |

---

## 학습 후 다음 단계

InputAdornment를 이해했다면:

1. **InputBase** - InputAdornment와 함께 사용되는 기본 Input 컴포넌트 학습
2. **TextField** - InputBase + InputLabel + FormControl을 조합한 완성형 Input
3. **실전 응용** - 검색 박스, 비밀번호 입력 등 실제 사용 사례

### 예시: 검색 아이콘이 있는 Input

```javascript
import InputBase from './InputBase';
import InputAdornment from './InputAdornment';
import SearchIcon from './SearchIcon';

<InputBase
  placeholder="검색..."
  startAdornment={
    <InputAdornment position="start">
      <SearchIcon />
    </InputAdornment>
  }
/>
```

### 예시: 비밀번호 표시 토글

```javascript
const [showPassword, setShowPassword] = React.useState(false);

<InputBase
  type={showPassword ? 'text' : 'password'}
  endAdornment={
    <InputAdornment position="end">
      <IconButton onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  }
/>
```

### 예시: Variant에 따른 스타일링

```javascript
// filled variant + start position일 때 marginTop: 16 적용
<InputBase
  variant="filled"
  startAdornment={
    <InputAdornment position="start" variant="filled">
      <AccountCircle />
    </InputAdornment>
  }
/>
```

### 학습 포인트 정리

1. **Zero-width Space**: Flexbox baseline 정렬 문제를 해결하는 실용적 기법
2. **조건부 인라인 스타일**: Spread 연산자로 깔끔하게 조건부 스타일 적용
3. **Flexbox 레이아웃**: 간단한 수직 중앙 정렬 패턴
4. **disablePointerEvents**: 클릭 이벤트를 투과시켜 사용자 경험 향상
5. **명시적 Props 전달**: Theme/FormControl 통합 없이도 충분히 동작하는 단순한 컴포넌트
