# FormGroup 컴포넌트

> Checkbox, Switch를 그룹으로 묶어 레이아웃하는 단순화된 래퍼 컴포넌트

---

## 무슨 기능을 하는가?

수정된 FormGroup는 **폼 컨트롤(Checkbox, Switch)을 그룹으로 묶어 flexbox 레이아웃을 제공하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **Flexbox 레이아웃** - 자식 컨트롤들을 column 또는 row 방향으로 배치
2. **row 모드** - `row={true}`로 가로 배치 전환
3. **FormControl 연동** - 부모 FormControl의 error 상태를 동기화

---

## 핵심 학습 포인트

### 1. Flexbox 레이아웃 패턴

```javascript
// 기본 스타일
const baseStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
};

// row 스타일
const rowStyle = {
  ...baseStyle,
  flexDirection: 'row',
};

// 사용
const formGroupStyle = row ? rowStyle : baseStyle;
```

**학습 가치**:
- `flexDirection: 'column'`으로 세로 배치 (기본)
- `flexDirection: 'row'`로 가로 배치
- `flexWrap: 'wrap'`으로 넘치면 줄바꿈
- 스프레드 연산자로 스타일 확장

### 2. FormControl Context 연동

```javascript
const muiFormControl = useFormControl();
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['error'],
});

// fcs.error로 FormControl의 error 상태에 접근 가능
```

**학습 가치**:
- `useFormControl()`: 부모 FormControl Context 구독
- `formControlState()`: props와 Context 상태를 병합 (props 우선)
- 필요한 상태만 선택적으로 동기화 (`states: ['error']`)

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/FormGroup/FormGroup.js (49줄, 원본 109줄)
FormGroup (React.forwardRef)
  └─> div (flexbox container)
       └─> children (Checkbox, Switch 등)
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `muiFormControl` | 부모 FormControl Context |
| `fcs` | FormControl 상태 (error) |
| `formGroupStyle` | row에 따른 스타일 객체 |

### 3. Props (3개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 그룹 내 컨트롤 |
| `className` | string | - | 외부 클래스 |
| `row` | boolean | false | 가로 배치 여부 |

---

## 커밋 히스토리로 보는 단순화 과정

FormGroup는 **4개의 커밋**을 통해 단순화되었습니다.

### 1단계: useUtilityClasses 제거
- `be0a9b24` - [FormGroup 단순화 1/4] useUtilityClasses 제거 (14줄 삭제)
- **왜 불필요한가**: 자동 CSS 클래스 생성(MuiFormGroup-root 등)은 테마 커스터마이징용으로 학습 목적과 무관.

### 2단계: useDefaultProps 제거
- `e2d9b006` - [FormGroup 단순화 2/4] useDefaultProps 제거 (7줄 삭제)
- **왜 불필요한가**: 테마 기반 기본값 시스템은 학습 범위 외. 파라미터 기본값이 더 직관적.

### 3단계: styled 시스템 제거
- `5a412674` - [FormGroup 단순화 3/4] styled 시스템 제거 (25줄 → 17줄)
- **왜 불필요한가**: styled-components, variants 시스템은 별도 학습 주제. 인라인 스타일이 바로 보임.

### 4단계: PropTypes 제거
- `bdef2259` - [FormGroup 단순화 4/4] PropTypes 제거 (33줄 삭제)
- **왜 불필요한가**: PropTypes는 런타임 타입 검증으로 컴포넌트 로직과 무관. TypeScript가 대안.

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 109줄 | 49줄 (55% 감소) |
| **Props 개수** | 5개 | 3개 |
| **styled 컴포넌트** | FormGroupRoot | div + 인라인 스타일 |
| **useUtilityClasses** | 자동 클래스 생성 | 제거됨 |
| **useDefaultProps** | 테마 기반 기본값 | 파라미터 기본값 |
| **PropTypes** | 32줄 | 제거됨 |
| **FormControl 연동** | 유지 | 유지 |

---

## 학습 후 다음 단계

FormGroup를 이해했다면:

1. **FormControl** - FormGroup가 연동하는 부모 Context 제공자
2. **Checkbox** - FormGroup 내부에서 사용되는 체크박스 컴포넌트
3. **RadioGroup** - Radio 전용 그룹 컴포넌트 (값 관리 포함)

**예시: 기본 사용 (세로 배치)**
```javascript
import FormGroup from './FormGroup';
import Checkbox from './Checkbox';

<FormGroup>
  <Checkbox label="옵션 1" />
  <Checkbox label="옵션 2" />
  <Checkbox label="옵션 3" />
</FormGroup>
```

**예시: 가로 배치**
```javascript
<FormGroup row>
  <Checkbox label="옵션 1" />
  <Checkbox label="옵션 2" />
  <Checkbox label="옵션 3" />
</FormGroup>
```

**예시: FormControl과 함께 사용**
```javascript
import FormControl from './FormControl';
import FormLabel from './FormLabel';
import FormGroup from './FormGroup';
import Checkbox from './Checkbox';

<FormControl error={hasError}>
  <FormLabel>취미 선택</FormLabel>
  <FormGroup>
    <Checkbox label="독서" />
    <Checkbox label="운동" />
  </FormGroup>
</FormControl>
```
