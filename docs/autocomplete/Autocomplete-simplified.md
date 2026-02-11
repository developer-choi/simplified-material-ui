# Autocomplete 컴포넌트

> 검색, 필터링, 키보드 네비게이션을 제공하는 입력 필드 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

원본 Autocomplete는 2,600줄에 달하는 Material-UI에서 가장 복잡한 컴포넌트 중 하나입니다.
단순화된 버전(1,673줄)은 **핵심 기능(검색, 필터링, 키보드 네비게이션, 다중 선택)을 유지**하면서
**학습에 불필요한 복잡한 시스템들을 제거**하여 이해하기 쉽게 만들었습니다.

---

## 무슨 기능을 하는가?

수정된 Autocomplete는 **검색 가능한 드롭다운 선택 필드** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **검색 및 필터링** - 입력값에 따라 옵션 실시간 필터링
2. **키보드 네비게이션** - Arrow Up/Down, Enter, Escape 등으로 탐색
3. **다중 선택 (multiple)** - 여러 옵션 동시 선택 가능
4. **자유 입력 (freeSolo)** - 옵션 외 임의 값 입력 가능
5. **태그 표시** - 다중 선택 시 Chip으로 시각화
6. **로딩 상태** - 비동기 옵션 로드 표시
7. **접근성 (ARIA)** - 스크린 리더 지원

---

## 핵심 학습 포인트

### 1. Props Getter 패턴 (Compound Component 패턴)

**역할**: 컴포넌트 로직과 UI를 분리하는 강력한 패턴

```javascript
// useAutocomplete.js (핵심 로직)
const {
  getRootProps,
  getInputProps,
  getListboxProps,
  getOptionProps,
  // ... 기타 getters
} = useAutocomplete({ options, value, onChange });

// Autocomplete.js (UI 렌더링)
<div {...getRootProps()}>
  <input {...getInputProps()} />
  <ul {...getListboxProps()}>
    {options.map((option, index) => (
      <li {...getOptionProps({ option, index })}>
        {option}
      </li>
    ))}
  </ul>
</div>
```

**학습 가치**:
- **로직과 UI 완전 분리**: useAutocomplete는 UI를 모름, Autocomplete는 로직을 모름
- **재사용성**: 동일한 useAutocomplete를 다른 UI 라이브러리에서도 사용 가능
- **유연성**: 사용자가 원하는 대로 UI 커스터마이징 가능
- **Props 전달 자동화**: 필요한 모든 이벤트 핸들러, ARIA 속성 등이 자동 포함

**실전 응용**:
- Dropdown, Select, Combobox 등 비슷한 컴포넌트에 적용
- Headless UI 라이브러리 설계 시 필수 패턴

### 2. Controlled vs Uncontrolled State 동시 지원

**역할**: 사용자가 제어 모드를 선택할 수 있도록 유연하게 구현

```javascript
// useAutocomplete.js
const [valueState, setValueState] = useControlled({
  controlled: valueProp,
  default: defaultValue,
  name: componentName,
  state: 'value',
});

const isControlled = valueProp !== undefined;
const value = isControlled ? valueProp : valueState;

// 값 변경 시
const handleValue = (newValue) => {
  if (!isControlled) {
    setValueState(newValue); // Uncontrolled: 내부 state 업데이트
  }

  if (onChange) {
    onChange(event, newValue); // Controlled: 부모에 알림
  }
};
```

**학습 가치**:
- **유연성**: 두 모드를 모두 지원하여 사용성 향상
- **useControlled 훅**: 이 패턴을 추상화한 재사용 가능한 훅
- **React 설계 철학**: 공식 문서가 권장하는 폼 컴포넌트 설계 방식

**Controlled 모드 (부모가 제어)**:
```javascript
const [value, setValue] = useState(null);
<Autocomplete value={value} onChange={(e, val) => setValue(val)} />
```

**Uncontrolled 모드 (컴포넌트 자체 제어)**:
```javascript
<Autocomplete defaultValue={initialValue} />
```

### 3. 키보드 네비게이션의 순환 알고리즘

**역할**: Arrow Up/Down으로 옵션 탐색 시 목록 끝에서 처음으로 순환

```javascript
// useAutocomplete.js - validOptionIndex 함수
const validOptionIndex = (index, direction) => {
  if (!listboxRef.current || index < 0) {
    return -1;
  }

  let nextFocus = index;

  while (true) {
    const option = listboxRef.current.querySelector(`[data-option-index="${nextFocus}"]`);
    const nextFocusDisabled = option?.disabled || option?.getAttribute('aria-disabled') === 'true';

    if (!nextFocusDisabled) {
      return nextFocus;
    }

    // 순환: 끝에 도달하면 처음으로, 처음에 도달하면 끝으로
    if (direction === 'next') {
      nextFocus = (nextFocus + 1) % filteredOptions.length;
    } else {
      nextFocus = (nextFocus - 1 + filteredOptions.length) % filteredOptions.length;
    }

    if (nextFocus === index) {
      return -1; // 한 바퀴 돌았는데 모두 비활성화됨
    }
  }
};
```

**학습 가치**:
- **모듈로 연산**: `(index + 1) % length`로 순환 구현
- **비활성화 옵션 건너뛰기**: disabled 옵션은 포커스 불가
- **무한 루프 방지**: 모두 비활성화 시 -1 반환하여 탈출

### 4. 필터링 알고리즘 (createFilterOptions)

**역할**: 입력값에 따라 옵션을 실시간으로 필터링

```javascript
// useAutocomplete.js - createFilterOptions
export function createFilterOptions(config = {}) {
  const {
    ignoreAccents = true,
    ignoreCase = true,
    limit,
    matchFrom = 'any',
    stringify,
    trim = false,
  } = config;

  return (options, { inputValue, getOptionLabel }) => {
    let input = trim ? inputValue.trim() : inputValue;
    if (ignoreCase) input = input.toLowerCase();
    if (ignoreAccents) input = stripDiacritics(input);

    const filteredOptions = options.filter((option) => {
      let candidate = (stringify || getOptionLabel)(option);
      if (ignoreCase) candidate = candidate.toLowerCase();
      if (ignoreAccents) candidate = stripDiacritics(candidate);

      return matchFrom === 'start'
        ? candidate.indexOf(input) === 0
        : candidate.indexOf(input) > -1;
    });

    return typeof limit === 'number'
      ? filteredOptions.slice(0, limit)
      : filteredOptions;
  };
}
```

**학습 가치**:
- **고차 함수**: 설정을 받아서 필터 함수를 반환
- **텍스트 정규화**: 대소문자, 악센트 무시 옵션
- **매칭 전략**: 'start'(접두사) vs 'any'(부분 문자열)
- **성능 최적화**: limit으로 결과 제한

### 5. Popper를 이용한 드롭다운 포지셔닝

**역할**: 입력 필드 아래에 옵션 목록을 띄우되, 화면 밖으로 나가지 않도록 자동 조정

```javascript
// Autocomplete.js
<AutocompletePopper
  open={popupOpen}
  anchorEl={anchorEl}
  placement="bottom-start"
  modifiers={[
    {
      name: 'flip',
      enabled: true,
      options: {
        altBoundary: true,
        rootBoundary: 'document',
        padding: 8,
      },
    },
  ]}
>
  <AutocompletePaper>
    <AutocompleteListbox {...getListboxProps()}>
      {/* 옵션들 */}
    </AutocompleteListbox>
  </AutocompletePaper>
</AutocompletePopper>
```

**학습 가치**:
- **Popper.js**: 드롭다운, 툴팁 등의 포지셔닝을 담당하는 라이브러리
- **Portal 렌더링**: document.body에 렌더링하여 z-index 문제 해결
- **자동 플립**: 화면 아래 공간 부족 시 위로 뒤집기
- **경계 감지**: 스크롤 가능한 컨테이너 내에서도 올바른 위치 계산

---

## 내부 구조

### 1. 렌더링 구조

```
Autocomplete (565줄)
  │
  ├─> useAutocomplete() 훅 (1,108줄)  ← 핵심 로직
  │    ├─ open/value/inputValue 상태 관리
  │    ├─ 키보드 이벤트 처리
  │    ├─ 필터링 알고리즘
  │    └─ Props Getters 반환
  │
  └─> AutocompleteRoot (div)
       ├─> renderInput() - 사용자 정의 Input
       │    └─> TextField (보통)
       │         ├─> input {...getInputProps()}  ← 입력 필드
       │         └─> AutocompleteEndAdornment
       │              ├─> AutocompleteClearIndicator (X 버튼)
       │              └─> AutocompletePopupIndicator (▼ 아이콘)
       │
       └─> AutocompletePopper (Portal)
            └─> AutocompletePaper
                 ├─> AutocompleteListbox (ul) {...getListboxProps()}
                 │    └─> li {...getOptionProps()} - 각 옵션
                 ├─> AutocompleteLoading - 로딩 중 표시
                 └─> AutocompleteNoOptions - 옵션 없음 표시
```

**위치**:
- `packages/mui-material/src/Autocomplete/Autocomplete.js` (565줄, 원본 1,257줄)
- `packages/mui-material/src/useAutocomplete/useAutocomplete.js` (1,108줄, 원본 1,248줄)

### 2. 핵심 상태 (useAutocomplete)

| 이름 | 타입 | 용도 |
|------|------|------|
| `value` | any \| any[] | 현재 선택된 값 (multiple이면 배열) |
| `inputValue` | string | 입력 필드의 텍스트 |
| `open` | boolean | 드롭다운 열림 상태 |
| `highlightedIndexRef` | ref | 현재 하이라이트된 옵션 인덱스 |
| `focusedItem` | state | 다중 선택 시 포커스된 태그 인덱스 |
| `inputRef` | ref | input 엘리먼트 참조 |
| `listboxRef` | ref | listbox(ul) 엘리먼트 참조 |
| `anchorEl` | state | Popper의 기준점 (input 엘리먼트) |
| `filteredOptions` | 변수 | 필터링된 옵션 배열 |
| `popupOpen` | 변수 | `open && !readOnly` (실제 팝업 표시 여부) |

### 3. 주요 함수 역할 (useAutocomplete)

#### handleOpen(event)

- **역할**: 드롭다운 열기
- **호출 시점**:
  - Popup indicator(▼) 클릭 시
  - 입력 필드 클릭 시 (inputValue가 비어있거나 닫혀있을 때)
- **핵심 로직**:
```javascript
const handleOpen = (event) => {
  if (open) return;
  setOpenState(true);
};
```
- **왜 이렇게 구현했는지**: 이미 열려있으면 무시하여 불필요한 렌더링 방지

#### handleClose(event, reason)

- **역할**: 드롭다운 닫기
- **호출 시점**:
  - Escape 키 누를 때 (reason: 'escape')
  - 옵션 선택 후 (reason: 'selectOption')
  - blur 발생 시 (reason: 'blur')
- **핵심 로직**:
```javascript
const handleClose = (event, reason) => {
  if (!open) return;
  setOpenState(false);
};
```

#### changeHighlightedIndex({ diff, direction, reason, event })

- **역할**: 하이라이트된 옵션 변경 (키보드 네비게이션)
- **호출 시점**: Arrow Up/Down, Home/End, PageUp/PageDown 키 입력 시
- **핵심 로직**:
```javascript
const changeHighlightedIndex = useEventCallback(({ diff, direction, reason, event }) => {
  if (!popupOpen) return;

  const getNextIndex = () => {
    const maxIndex = filteredOptions.length - 1;

    if (diff === 'reset') return defaultHighlighted;
    if (diff === 'start') return 0;
    if (diff === 'end') return maxIndex;

    const newIndex = highlightedIndexRef.current + diff;

    // 순환 로직
    if (newIndex < 0) {
      if (Math.abs(diff) > 1) return 0;
      return maxIndex;
    }

    if (newIndex > maxIndex) {
      if (Math.abs(diff) > 1) return maxIndex;
      return 0;
    }

    return newIndex;
  };

  const nextIndex = validOptionIndex(getNextIndex(), direction);
  setHighlightedIndex({ index: nextIndex, reason, event });
});
```
- **왜 이렇게 구현했는지**:
  - diff가 숫자면 상대 이동, 문자열('start', 'end')이면 절대 이동
  - Math.abs(diff) > 1 체크는 PageUp/PageDown 시 순환 방지 (끝으로 점프)

#### selectNewValue(event, option, reason, details)

- **역할**: 옵션 선택 시 값 업데이트
- **호출 시점**:
  - Enter 키로 선택
  - 마우스 클릭으로 선택
- **핵심 로직**:
```javascript
const selectNewValue = (event, option, reasonProp = 'selectOption', origin = 'options') => {
  let newValue = option;

  if (multiple) {
    newValue = Array.isArray(value) ? value.slice() : [];
    const itemIndex = findIndex(newValue, option, isOptionEqualToValue);

    if (itemIndex === -1) {
      newValue.push(option);
    } else {
      newValue.splice(itemIndex, 1);
    }
  }

  resetInputValue(event, newValue);
  handleValue(event, newValue, reasonProp, { option });

  if (!event || (!event.ctrlKey && !event.metaKey)) {
    handleClose(event, reasonProp);
  }
};
```
- **왜 이렇게 구현했는지**:
  - multiple: 배열에 추가/제거 (토글 방식)
  - Ctrl/Cmd 키 누르면 닫지 않음 (다중 선택 계속)

#### handleValue(event, newValue, reason, details)

- **역할**: 값 변경 처리 (Controlled/Uncontrolled 모두 지원)
- **호출 시점**: selectNewValue, handleClear 등에서 호출
- **핵심 로직**:
```javascript
const handleValue = (event, newValue, reason, details) => {
  // 값이 실제로 변경되었는지 체크
  if (multiple) {
    if (value.length === newValue.length && value.every((val, i) => val === newValue[i])) {
      return;
    }
  } else if (value === newValue) {
    return;
  }

  if (onChange) {
    onChange(event, newValue, reason, details);
  }

  setValueState(newValue); // Uncontrolled 모드용
};
```

#### handleInputChange(event)

- **역할**: 입력 필드 텍스트 변경 처리
- **호출 시점**: 사용자가 타이핑할 때마다
- **핵심 로직**:
```javascript
const handleInputChange = (event) => {
  const newValue = event.target.value;

  if (inputValue !== newValue) {
    setInputValueState(newValue);
    setInputPristine(false);

    if (onInputChange) {
      onInputChange(event, newValue, 'input');
    }
  }

  if (newValue === '') {
    if (!freeSolo) {
      handleValue(event, multiple ? [] : null, 'clear');
    }
  } else {
    handleOpen(event);
  }
};
```
- **왜 이렇게 구현했는지**:
  - 입력값이 비면 선택값도 초기화 (freeSolo 제외)
  - 입력 시작하면 자동으로 드롭다운 열기

#### handleClear(event)

- **역할**: X 버튼 클릭 시 값과 입력 초기화
- **호출 시점**: Clear indicator(X 버튼) 클릭
- **핵심 로직**:
```javascript
const handleClear = (event) => {
  ignoreFocus.current = true;
  setInputValueState('');

  if (onInputChange) {
    onInputChange(event, '', 'clear');
  }

  handleValue(event, multiple ? [] : null, 'clear');
};
```

#### getOptionProps({ option, index })

- **역할**: 각 옵션(li)에 전달할 props 반환 (Props Getter 패턴)
- **반환값**:
```javascript
{
  key: index,
  'data-option-index': index,
  tabIndex: -1,
  role: 'option',
  'aria-selected': isSelected,
  'aria-disabled': isDisabled,
  onMouseMove: handleOptionMouseMove,
  onMouseDown: handleOptionMouseDown,
  onClick: handleOptionClick,
}
```

### 4. 동작 흐름

#### 검색 및 선택 플로우차트

```
사용자가 입력 필드 클릭
        ↓
┌─────────────────────────────────┐
│ handlePopupIndicator 호출        │
│  - open이 false면 handleOpen     │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ 드롭다운 열림 (open = true)      │
│  - filteredOptions 계산          │
│  - Popper 렌더링                 │
└─────────────────────────────────┘
        ↓
사용자가 "app" 타이핑
        ↓
┌─────────────────────────────────┐
│ handleInputChange 호출           │
│  - inputValue = "app"            │
│  - filteredOptions 재계산        │
│    (filterOptions 함수 실행)     │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ 필터링된 옵션만 표시             │
│  "Apple", "Application" 등       │
└─────────────────────────────────┘
        ↓
사용자가 Arrow Down 키 입력
        ↓
┌─────────────────────────────────┐
│ changeHighlightedIndex 호출      │
│  - diff: 1, direction: 'next'    │
│  - highlightedIndex: 0           │
│  - 첫 번째 옵션 하이라이트        │
└─────────────────────────────────┘
        ↓
사용자가 Enter 키 입력
        ↓
┌─────────────────────────────────┐
│ selectNewValue 호출              │
│  - handleValue로 값 업데이트     │
│  - onChange 콜백 실행            │
│  - handleClose로 드롭다운 닫기   │
└─────────────────────────────────┘
```

#### 시나리오 예시

**시나리오 1: 기본 선택**
```
1. 사용자가 입력 필드 클릭
   → handlePopupIndicator 호출 → handleOpen
2. 드롭다운 열림 (모든 옵션 표시)
3. 사용자가 "Apple" 옵션 클릭
   → handleOptionClick → selectNewValue
4. value = "Apple"로 업데이트
5. onChange(event, "Apple", "selectOption") 호출
6. 드롭다운 닫힘
```

**시나리오 2: 다중 선택 (multiple)**
```
1. 드롭다운 열림
2. "Apple" 클릭
   → value = ["Apple"]
   → Ctrl/Cmd 누르지 않아서 드롭다운 닫힘
3. 다시 드롭다운 열기
4. "Banana" 클릭 (Ctrl 누른 상태)
   → value = ["Apple", "Banana"]
   → 드롭다운 열린 상태 유지
5. "Apple" 다시 클릭 (이미 선택됨)
   → value = ["Banana"] (제거됨)
```

**시나리오 3: freeSolo 모드**
```
1. 드롭다운 열림
2. "Custom Value" 타이핑 (옵션에 없음)
3. Enter 키 입력
   → selectNewValue(event, "Custom Value", "createOption", "freeSolo")
4. value = "Custom Value"
5. onChange 호출
```

### 5. 핵심 패턴

#### inputPristine 플래그

- **비유**: "입력 필드가 아직 건드려지지 않았나요?"
- **역할**: 초기 렌더링 시 inputValue와 value가 일치하는지 추적

**왜 필요한가?**

플래그 없을 때:
```javascript
// value = "Apple", inputValue = "Apple"
// 사용자가 아직 아무것도 안 했는데 필터링됨
filteredOptions = filterOptions(options, { inputValue: "Apple" });
// → "Apple"만 표시됨 (다른 옵션들 안 보임)
```

플래그가 있으면:
```javascript
const inputValueIsSelectedValue = !multiple &&
  value != null &&
  inputValue === getOptionLabel(value);

const filteredOptions = popupOpen
  ? filterOptions(options, {
      inputValue: inputValueIsSelectedValue && inputPristine ? '' : inputValue,
      getOptionLabel,
    })
  : [];
// inputPristine이 true면 빈 문자열로 필터링 → 모든 옵션 표시
```

#### ignoreFocus 플래그

- **비유**: "다음 focus 이벤트는 무시해"
- **역할**: 특정 동작 후 발생하는 불필요한 focus 이벤트 무시

**왜 필요한가?**

플래그 없을 때:
```
1. 사용자가 Clear 버튼(X) 클릭
2. handleClear 실행 → 값 초기화
3. input에 focus 복귀
4. handleFocus 실행 → handleOpen 호출
5. 드롭다운이 다시 열림 (원하지 않음)
```

플래그가 있으면:
```javascript
const handleClear = (event) => {
  ignoreFocus.current = true; // 플래그 설정
  // ... 값 초기화
};

const handleFocus = (event) => {
  if (ignoreFocus.current) {
    ignoreFocus.current = false;
    return; // focus 이벤트 무시
  }
  // ... 정상 처리
};
```

### 6. 주요 변경 사항 (원본 대비)

```javascript
// 변경 전: variant 시스템 (3가지 Input 지원)
const StyledInput = styled(Input)(...);
const StyledOutlinedInput = styled(OutlinedInput)(...);
const StyledFilledInput = styled(FilledInput)(...);

// 변경 후: OutlinedInput만
// (Autocomplete.js에서는 renderInput으로 위임)
```

**원본과의 차이**:
- ❌ `groupBy` 제거 → 그룹핑 없이 플랫한 리스트만
- ❌ `Slot 시스템` 제거 → 고정된 컴포넌트 사용
- ❌ `Component Props` 제거 → Paper, Popper 등 교체 불가
- ❌ `size`, `fullWidth` 제거 → 기본 크기 고정
- ❌ `disable props` 제거 → 기능 항상 활성화
- ❌ `이벤트 props` 제거 → onChange, onInputChange만 유지
- ❌ `선택적 기능 props` 제거 → autoComplete, autoSelect 등 제거
- ❌ `useDefaultProps`, `스타일 시스템`, `테마 시스템` 제거
- ✅ `multiple` 유지 → 다중 선택 기능
- ✅ `freeSolo` 유지 → 자유 입력 기능
- ✅ `키보드 네비게이션` 유지 → 완전한 접근성

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `options` | array | **필수** | 선택 가능한 옵션 배열 |
| `value` | any \| any[] | - | 제어 모드: 현재 값 |
| `defaultValue` | any \| any[] | `multiple ? [] : null` | 비제어 모드: 초기값 |
| `onChange` | func | - | `(event, value, reason, details?) => void` |
| `inputValue` | string | - | 제어 모드: 입력 필드 값 |
| `defaultInputValue` | string | `''` | 비제어 모드: 입력 초기값 |
| `onInputChange` | func | - | `(event, value, reason) => void` |
| `renderInput` | func | **필수** | `(params) => ReactNode` - Input 렌더링 |
| `renderOption` | func | - | `(props, option, state) => ReactNode` |
| `renderTags` | func | - | `(value, getTagProps, ownerState) => ReactNode` |
| `getOptionLabel` | func | `option => option.label ?? option` | 옵션 레이블 추출 |
| `getOptionDisabled` | func | - | `option => boolean` - 비활성화 판단 |
| `isOptionEqualToValue` | func | `(option, value) => option === value` | 동등성 비교 |
| `filterOptions` | func | `createFilterOptions()` | 커스텀 필터링 |
| `multiple` | boolean | false | 다중 선택 활성화 |
| `freeSolo` | boolean | false | 자유 입력 활성화 |
| `limitTags` | number | -1 | 표시할 최대 태그 수 (multiple) |
| `getLimitTagsText` | func | `(more) => +${more}` | 숨겨진 태그 텍스트 |
| `open` | boolean | - | 제어 모드: 드롭다운 열림 상태 |
| `defaultOpen` | boolean | false | 비제어 모드: 초기 열림 상태 |
| `loading` | boolean | false | 로딩 상태 표시 |
| `loadingText` | ReactNode | 'Loading…' | 로딩 텍스트 |
| `noOptionsText` | ReactNode | 'No options' | 옵션 없음 텍스트 |
| `clearOnBlur` | boolean | `!freeSolo` | blur 시 입력값 초기화 |
| `clearText` | string | 'Clear' | Clear 버튼 툴팁 |
| `closeText` | string | 'Close' | Close 버튼 툴팁 |
| `openText` | string | 'Open' | Open 버튼 툴팁 |
| `disabled` | boolean | false | 비활성화 |
| `readOnly` | boolean | false | 읽기 전용 |
| `disablePortal` | boolean | false | Portal 사용 안 함 |
| `clearIcon` | ReactNode | `<ClearIcon />` | Clear 아이콘 |
| `popupIcon` | ReactNode | `<ArrowDropDownIcon />` | Popup 아이콘 |
| `forcePopupIcon` | boolean \| 'auto' | 'auto' | Popup 아이콘 강제 표시 |
| `ChipProps` | object | - | Chip 컴포넌트에 전달 |

**제거된 Props**:
- ❌ `groupBy` - 그룹핑 기능 제거
- ❌ `renderGroup` - 그룹 렌더링 제거
- ❌ `slots` / `slotProps` - Slot 시스템 제거
- ❌ `PaperComponent` / `PopperComponent` / `ListboxComponent` - 컴포넌트 교체 제거
- ❌ `size` - 크기 변형 제거
- ❌ `fullWidth` - 전체 너비 제거
- ❌ `disableClearable` / `disableCloseOnSelect` / `disableListWrap` - disable props 제거
- ❌ `onOpen` / `onClose` / `onHighlightChange` - 추가 이벤트 제거
- ❌ `autoComplete` / `autoHighlight` / `autoSelect` / `blurOnSelect` - 선택적 기능 제거
- ❌ `clearOnEscape` / `filterSelectedOptions` / `handleHomeEndKeys` - 선택적 기능 제거
- ❌ `includeInputInList` / `openOnFocus` / `selectOnFocus` - 선택적 기능 제거
- ❌ `classes` - 클래스 오버라이드 제거

---

## 커밋 히스토리로 보는 단순화 과정

Autocomplete는 **13개의 커밋**을 통해 단순화되었습니다.

### 1단계: PropTypes 제거

- `039e7d6f` - [Autocomplete 단순화 1/13] PropTypes 제거

**삭제된 코드**: 약 483줄의 PropTypes 정의

**왜 불필요한가**:
- **학습 목적**: PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님
- **복잡도**: 50개 이상의 props에 대한 검증 코드로 실제 로직보다 메타데이터가 더 많음

### 2단계: groupBy(그룹핑) 기능 제거

- `4538469a` - [Autocomplete 단순화 2/13] groupBy(그룹핑) 기능 제거

**삭제된 코드**:
```javascript
// useAutocomplete.js
let groupedOptions = filteredOptions;
if (groupBy) {
  const indexBy = new Map();
  groupedOptions = filteredOptions.reduce((acc, option, index) => {
    const group = groupBy(option);
    if (acc.length > 0 && acc[acc.length - 1].group === group) {
      acc[acc.length - 1].options.push(option);
    } else {
      acc.push({ key: indexBy.size, index, group, options: [option] });
      indexBy.set(group, indexBy.size);
    }
    return acc;
  }, []);
}

// Autocomplete.js - AutocompleteGroupLabel, AutocompleteGroupUl 제거
```

**왜 불필요한가**:
- **학습 목적**: 플랫한 리스트만으로도 검색/선택 개념 학습 가능
- **복잡도**: 그룹핑 알고리즘 약 40줄, 2개의 추가 컴포넌트

### 3단계: Slot 시스템 제거

- `70b6791e` - [Autocomplete 단순화 3/13] Slot 시스템 제거

**삭제된 코드**:
```javascript
const [ListboxSlot, listboxProps] = useSlot('listbox', {
  elementType: AutocompleteListbox,
  externalForwardedProps,
  ownerState,
  className: classes.listbox,
});

// 3번의 useSlot 호출, externalForwardedProps 객체 생성
```

**왜 불필요한가**:
- **학습 목적**: 고정된 구조가 이해하기 쉬움
- **복잡도**: props 병합 로직 복잡, 약 40줄

### 4단계: Component Props 제거

- `13d62c00` - [Autocomplete 단순화 4/13] Component Props 제거

**삭제된 코드**:
```javascript
<PaperComponent {...PaperProps}>
<PopperComponent {...PopperProps}>
<ListboxComponent {...ListboxProps}>

// fallback 처리 로직
```

**왜 불필요한가**:
- **학습 목적**: 고정된 컴포넌트로도 충분히 이해 가능
- **복잡도**: Slot 시스템과 중복, 각 Component prop마다 fallback 처리

### 7단계: Disable Props 제거

- `8e9db77e` - [Autocomplete 단순화 7/13] Disable Props 제거

**삭제된 코드**:
```javascript
if (disableClearable) { /* ... */ }
if (disableCloseOnSelect) { /* ... */ }
if (disableListWrap) { /* ... */ }
if (disabledItemsFocusable) { /* ... */ }
```

**왜 불필요한가**:
- **학습 목적**: 기본 동작을 배우는 것이 우선
- **복잡도**: 각 disable prop마다 조건문 추가, 테스트 케이스 2^n개

### 8단계: 추가 이벤트 Props 제거

- `e6a3c989` - [Autocomplete 단순화 8/13] 추가 이벤트 Props 제거

**삭제된 코드**:
```javascript
if (onOpen) onOpen(event);
if (onClose) onClose(event, reason);
if (onHighlightChange) onHighlightChange(event, option, reason);
```

**왜 불필요한가**:
- **학습 목적**: 핵심 이벤트(onChange, onInputChange)만으로 충분
- **복잡도**: 세밀한 제어는 고급 사용 시나리오

### 9단계: 선택적 기능 Props 제거

- `7d0662aa` - [Autocomplete 단순화 9/13] 선택적 기능 Props 제거

**삭제된 코드**: 약 101줄
```javascript
if (autoComplete) { /* 자동 완성 */ }
if (autoSelect) { /* blur 시 자동 선택 */ }
if (autoHighlight) { /* 첫 번째 옵션 자동 하이라이트 */ }
if (blurOnSelect) { /* 선택 시 blur */ }
if (clearOnEscape) { /* Escape로 clear */ }
if (filterSelectedOptions) { /* 선택된 옵션 숨기기 */ }
if (handleHomeEndKeys) { /* Home/End 키 */ }
if (includeInputInList) { /* 입력 필드도 탐색 */ }
if (openOnFocus) { /* focus 시 자동 열기 */ }
if (selectOnFocus) { /* focus 시 전체 선택 */ }
```

**왜 불필요한가**:
- **학습 목적**: 기본 동작만으로 충분히 이해 가능
- **복잡도**: 각 prop마다 조건부 로직 추가

### 10단계: useDefaultProps 제거

- `e07c8004` - [Autocomplete 단순화 10/13] useDefaultProps 제거

**삭제된 코드**:
```javascript
const props = useDefaultProps({ props: inProps, name: 'MuiAutocomplete' });
```

**왜 불필요한가**:
- **학습 목적**: 함수 파라미터 기본값으로 충분
- **복잡도**: 테마 Context 구독, props 병합 로직

### 11단계: 스타일 시스템 제거

- `74b70371` - [Autocomplete 단순화 11/13] 스타일 시스템 제거

**삭제된 코드**: 약 40줄
```javascript
const useUtilityClasses = (ownerState) => {
  const slots = { root: [...], inputRoot: [...], ... };
  return composeClasses(slots, getAutocompleteUtilityClass, classes);
};

const classes = useUtilityClasses(ownerState);
```

**왜 불필요한가**:
- **학습 목적**: 클래스 병합 로직이 복잡도 증가
- **복잡도**: useUtilityClasses 함수 40줄, composeClasses 호출

### 12단계: 테마 시스템 제거

- `753e8ee2` - [Autocomplete 단순화 12/13] 테마 시스템 제거

**삭제된 코드**:
```javascript
memoTheme(({ theme }) => ({
  zIndex: (theme.vars || theme).zIndex.modal,
  ...
}))

// 변경 후
({ theme }) => ({
  zIndex: (theme.vars || theme).zIndex.modal,
  ...
})
```

**왜 불필요한가**:
- **학습 목적**: memoTheme 래퍼가 불필요한 추상화
- **복잡도**: 메모이제이션 최적화가 학습에 불필요

### 13단계: Styled 컴포넌트 간소화

- `486883cd` - [Autocomplete 단순화 13/13] Styled 컴포넌트 간소화

**삭제된 코드**: 약 28줄
```javascript
overridesResolver: (props, styles) => {
  const { ownerState } = props;
  return [
    styles.root,
    ownerState.hasPopupIcon && styles.hasPopupIcon,
    // ...
  ];
}
```

**왜 불필요한가**:
- **학습 목적**: overridesResolver가 스타일 오버라이드 시스템인데, 학습 목표가 아님
- **복잡도**: 3개의 overridesResolver 함수 제거

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 2,600줄 | 1,673줄 (35.7% 감소) |
| **Autocomplete.js** | 1,257줄 | 565줄 (55.1% 감소) |
| **useAutocomplete.js** | 1,248줄 | 1,108줄 (11.2% 감소) |
| **Props 개수** | 50개 이상 | 33개 |
| **그룹핑 (groupBy)** | ✅ | ❌ |
| **다중 선택 (multiple)** | ✅ | ✅ 유지 |
| **자유 입력 (freeSolo)** | ✅ | ✅ 유지 |
| **Slot 시스템** | ✅ | ❌ |
| **Component Props** | ✅ 7개 | ❌ |
| **size 변형** | ✅ small/medium | ❌ |
| **Disable props** | ✅ 5개 | ❌ |
| **선택적 기능 props** | ✅ 10개 | ❌ |
| **스타일 시스템** | ✅ useUtilityClasses | ❌ |
| **테마 시스템** | ✅ memoTheme | ❌ |
| **키보드 네비게이션** | ✅ 완전 지원 | ✅ 유지 |
| **ARIA 접근성** | ✅ | ✅ 유지 |

---

## 학습 후 다음 단계

Autocomplete를 이해했다면:

1. **Select** - 더 단순한 선택 컴포넌트
   - Autocomplete와 비슷하지만 검색 기능 없음
   - SelectInput의 작동 방식 이해
   - OutlinedInput과의 통합

2. **TextField** - 입력 컴포넌트의 기초
   - renderInput에서 사용되는 컴포넌트
   - FormControl과의 통합
   - variant 시스템 (outlined/filled/standard)

3. **Popper** - 포지셔닝 시스템
   - Autocomplete가 사용하는 드롭다운 포지셔닝
   - Portal 렌더링
   - Popper.js의 작동 원리

4. **실전 응용**
   - 비동기 옵션 로딩 (API 호출)
   - 무한 스크롤 옵션
   - 커스텀 필터링 알고리즘
   - 커스텀 렌더링 (renderOption, renderTags)

**예시: 기본 사용**
```javascript
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

function BasicAutocomplete() {
  const options = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

  return (
    <Autocomplete
      options={options}
      renderInput={(params) => <TextField {...params} label="Fruit" />}
    />
  );
}
```

**예시: 제어된 모드**
```javascript
function ControlledAutocomplete() {
  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => setValue(newValue)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      options={['Apple', 'Banana', 'Cherry']}
      renderInput={(params) => <TextField {...params} label="Controlled" />}
    />
  );
}
```

**예시: 다중 선택**
```javascript
function MultipleAutocomplete() {
  const [values, setValues] = React.useState([]);

  return (
    <Autocomplete
      multiple
      value={values}
      onChange={(event, newValues) => setValues(newValues)}
      options={['React', 'Vue', 'Angular', 'Svelte']}
      renderInput={(params) => <TextField {...params} label="Frameworks" />}
    />
  );
}
```

**예시: freeSolo 모드**
```javascript
function FreeSoloAutocomplete() {
  return (
    <Autocomplete
      freeSolo
      options={['Option 1', 'Option 2', 'Option 3']}
      renderInput={(params) => (
        <TextField {...params} label="Free Solo (any value allowed)" />
      )}
    />
  );
}
```

**예시: 비동기 옵션 로딩**
```javascript
function AsyncAutocomplete() {
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const handleInputChange = (event, value) => {
    if (value.length > 0) {
      setLoading(true);
      fetch(`/api/search?q=${value}`)
        .then(res => res.json())
        .then(data => {
          setOptions(data);
          setLoading(false);
        });
    }
  };

  return (
    <Autocomplete
      options={options}
      loading={loading}
      loadingText="Loading..."
      onInputChange={handleInputChange}
      renderInput={(params) => <TextField {...params} label="Search" />}
    />
  );
}
```

**예시: 커스텀 렌더링**
```javascript
function CustomAutocomplete() {
  const options = [
    { name: 'Apple', emoji: '🍎' },
    { name: 'Banana', emoji: '🍌' },
    { name: 'Cherry', emoji: '🍒' },
  ];

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => (
        <li {...props}>
          <span style={{ marginRight: 8 }}>{option.emoji}</span>
          {option.name}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="Fruit" />}
    />
  );
}
```
