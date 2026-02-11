# Autocomplete 컴포넌트

> Material-UI의 Autocomplete 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Autocomplete는 **검색 가능한 드롭다운 메뉴**를 제공하는 컴포넌트입니다.

### 핵심 기능
1. **옵션 검색** - 사용자 입력에 따라 옵션을 필터링
2. **키보드 네비게이션** - Arrow Up/Down, Home/End, Page Up/Down, Enter, Escape 지원
3. **다중 선택** - multiple prop으로 여러 옵션 선택 가능 (태그로 표시)
4. **자유 입력** - freeSolo prop으로 옵션 외 값 입력 가능
5. **그룹핑** - groupBy prop으로 옵션을 카테고리별로 묶어 표시
6. **비동기 로딩** - loading prop으로 로딩 상태 표시
7. **커스터마이징** - Slot 시스템으로 내부 컴포넌트 교체 가능

---

## 내부 구조

### 1. 컴포넌트 계층 (렌더링 구조)

```javascript
// 위치: packages/mui-material/src/Autocomplete/Autocomplete.js (1,257줄)
// 위치: packages/mui-material/src/useAutocomplete/useAutocomplete.js (1,248줄)

Autocomplete (React.Fragment)
  ├─> AutocompleteRoot (styled div)
  │    └─> renderInput() 호출
  │         └─> TextField (사용자 제공)
  │              ├─> InputLabelProps (label)
  │              ├─> InputProps
  │              │    ├─> ref (setAnchorEl)
  │              │    ├─> startAdornment (multiple인 경우 Chip 배열)
  │              │    └─> endAdornment
  │              │         ├─> AutocompleteClearIndicator (X 버튼)
  │              │         └─> AutocompletePopupIndicator (드롭다운 화살표)
  │              └─> inputProps (input 요소)
  │
  └─> AutocompletePopper (Popper로 감싼 PopperSlot)
       └─> AutocompletePaper (Paper로 감싼 PaperSlot)
            ├─> AutocompleteLoading (loading 상태)
            ├─> AutocompleteNoOptions (옵션 없음 상태)
            └─> AutocompleteListbox (ListboxSlot - ul)
                 ├─> AutocompleteGroupLabel (그룹 헤더)
                 ├─> AutocompleteGroupUl (그룹 내 리스트)
                 └─> li (개별 옵션 - renderOption 호출)
```

### 2. 하위 컴포넌트가 담당하는 기능

- **useAutocomplete 훅** - 상태 관리, 이벤트 처리, 필터링, 키보드 네비게이션
- **Autocomplete 컴포넌트** - UI 렌더링, 스타일링, Slot 시스템

### 3. useAutocomplete 훅 (핵심 로직)

**위치**: `packages/mui-material/src/useAutocomplete/useAutocomplete.js` (1,248줄)

```javascript
function useAutocomplete(props) {
  // 상태 관리
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [focusedItem, setFocusedItem] = React.useState(-1);
  const [value, setValueState] = useControlled({ ... });
  const [inputValue, setInputValueState] = useControlled({ ... });
  const [focused, setFocused] = React.useState(false);

  // 필터링된 옵션 계산
  const filteredOptions = popupOpen ? filterOptions(options, { inputValue, getOptionLabel }) : [];

  // 그룹핑 (groupBy가 있는 경우)
  const groupedOptions = groupBy ? filteredOptions.reduce(...) : filteredOptions;

  // 키보드 네비게이션
  const validOptionIndex = (index, direction) => { ... };
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown': // 다음 옵션
      case 'ArrowUp': // 이전 옵션
      case 'Home': // 첫 옵션
      case 'End': // 마지막 옵션
      case 'PageUp': // 5개 위로
      case 'PageDown': // 5개 아래로
      case 'Enter': // 선택
      case 'Escape': // 닫기/초기화
      // ...
    }
  };

  // Props 빌더 (Compound Component 패턴)
  return {
    getRootProps, getInputProps, getInputLabelProps,
    getPopupIndicatorProps, getClearProps, getItemProps,
    getListboxProps, getOptionProps,
    value, inputValue, open: popupOpen, focused, // 상태
    groupedOptions, focusedItem, anchorEl, // 데이터
  };
}
```

**주요 함수들**:
- `createFilterOptions()` - 필터링 함수 팩토리 (ignoreAccents, ignoreCase, matchFrom, limit)
- `resetInputValue()` - input 값 초기화
- `setHighlightedIndex()` - 강조 옵션 변경
- `handleInputChange()` - 입력 변경 시 팝업 열기 및 필터링
- `handleKeyDown()` - 키보드 네비게이션 (Arrow, Home, End, Page, Enter, Escape)
- `handleOptionClick()` - 옵션 클릭 시 선택
- `handleClear()` - Clear 버튼 클릭 시 초기화
- `validOptionIndex()` - 다음/이전 유효한 옵션 인덱스 계산 (비활성화 항목 건너뛰기)

### 4. Styled 컴포넌트 (10개)

```javascript
// 1. AutocompleteRoot - 루트 컨테이너
const AutocompleteRoot = styled('div')({ ... });

// 2. AutocompleteEndAdornment - 오른쪽 끝 아이콘 영역
const AutocompleteEndAdornment = styled('div')({ position: 'absolute', right: 0, ... });

// 3. AutocompleteClearIndicator - X 버튼 (IconButton)
const AutocompleteClearIndicator = styled(IconButton)({ visibility: 'hidden', ... });

// 4. AutocompletePopupIndicator - 드롭다운 화살표 (IconButton)
const AutocompletePopupIndicator = styled(IconButton)({
  variants: [{ props: { popupOpen: true }, style: { transform: 'rotate(180deg)' } }]
});

// 5. AutocompletePopper - 팝업 컨테이너 (Popper)
const AutocompletePopper = styled(Popper)(memoTheme(({ theme }) => ({
  zIndex: theme.zIndex.modal,
})));

// 6. AutocompletePaper - 팝업 배경 (Paper)
const AutocompletePaper = styled(Paper)(memoTheme(({ theme }) => ({
  ...theme.typography.body1,
  overflow: 'auto',
})));

// 7. AutocompleteLoading - 로딩 상태 표시
const AutocompleteLoading = styled('div')(memoTheme(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: '14px 16px',
})));

// 8. AutocompleteNoOptions - 옵션 없음 표시
const AutocompleteNoOptions = styled('div')(memoTheme(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: '14px 16px',
})));

// 9. AutocompleteListbox - 옵션 목록 (ul)
const AutocompleteListbox = styled('ul')(memoTheme(({ theme }) => ({
  listStyle: 'none',
  maxHeight: '40vh',
  overflow: 'auto',
  // 옵션 스타일 (minHeight, padding, hover, focus, selected 등)
})));

// 10. AutocompleteGroupLabel - 그룹 헤더 (ListSubheader)
const AutocompleteGroupLabel = styled(ListSubheader)(memoTheme(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
})));

// 11. AutocompleteGroupUl - 그룹 옵션 목록 (ul)
const AutocompleteGroupUl = styled('ul')({ padding: 0 });
```

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `options` | array | 필수 | 선택지 배열 |
| `value` | any | null | 선택된 값 (제어) |
| `defaultValue` | any | null (단일) / [] (multiple) | 선택된 값 (비제어) |
| `inputValue` | string | - | 입력 필드 값 (제어) |
| `defaultInputValue` | string | '' | 입력 필드 값 (비제어) |
| `onChange` | func | - | 값 변경 콜백 |
| `onInputChange` | func | - | 입력 변경 콜백 |
| `onOpen` | func | - | 팝업 열림 콜백 |
| `onClose` | func | - | 팝업 닫힘 콜백 |
| `onHighlightChange` | func | - | 강조 옵션 변경 콜백 |
| `open` | bool | - | 팝업 열림 상태 (제어) |
| `defaultOpen` | bool | false | 팝업 열림 상태 (비제어) |
| `multiple` | bool | false | 다중 선택 |
| `freeSolo` | bool | false | 자유 입력 모드 |
| `disabled` | bool | false | 비활성화 |
| `readOnly` | bool | false | 읽기 전용 |
| `loading` | bool | false | 로딩 상태 |
| `renderInput` | func | 필수 | input 렌더링 함수 |
| `renderOption` | func | - | 옵션 렌더링 함수 |
| `renderTags` | func | - | 태그 렌더링 함수 (deprecated, renderValue 사용) |
| `renderValue` | func | - | 값 렌더링 함수 |
| `renderGroup` | func | - | 그룹 렌더링 함수 |
| `getOptionLabel` | func | (option) => option.label ?? option | 옵션 레이블 추출 |
| `getOptionDisabled` | func | - | 옵션 비활성화 판단 |
| `getOptionKey` | func | - | 옵션 키 추출 |
| `isOptionEqualToValue` | func | (option, value) => option === value | 옵션 동등성 비교 |
| `groupBy` | func | - | 그룹핑 함수 |
| `filterOptions` | func | createFilterOptions() | 필터링 함수 |
| `limitTags` | number | -1 | 다중 선택 태그 제한 |
| `getLimitTagsText` | func | (more) => `+${more}` | 태그 제한 텍스트 |
| `loadingText` | node | 'Loading…' | 로딩 텍스트 |
| `noOptionsText` | node | 'No options' | 옵션 없음 텍스트 |
| `clearText` | string | 'Clear' | Clear 버튼 텍스트 |
| `openText` | string | 'Open' | 드롭다운 버튼 텍스트 (열림) |
| `closeText` | string | 'Close' | 드롭다운 버튼 텍스트 (닫힘) |
| `size` | 'small' \| 'medium' | 'medium' | 크기 |
| `fullWidth` | bool | false | 전체 폭 |
| `autoComplete` | bool | false | 자동 완성 (inline completion) |
| `autoHighlight` | bool | false | 첫 옵션 자동 강조 |
| `autoSelect` | bool | false | blur 시 강조된 옵션 자동 선택 |
| `blurOnSelect` | bool \| 'touch' \| 'mouse' | false | 선택 시 blur |
| `clearOnBlur` | bool | !freeSolo | blur 시 입력값 초기화 |
| `clearOnEscape` | bool | false | Escape 시 초기화 |
| `disableClearable` | bool | false | Clear 버튼 비활성화 |
| `disableCloseOnSelect` | bool | false | 선택 시 팝업 닫기 비활성화 |
| `disableListWrap` | bool | false | 리스트 순환 비활성화 |
| `disablePortal` | bool | false | Portal 비활성화 |
| `disabledItemsFocusable` | bool | false | 비활성화 항목 포커스 가능 |
| `filterSelectedOptions` | bool | false | 선택된 항목 필터링 |
| `forcePopupIcon` | bool \| 'auto' | 'auto' | 드롭다운 아이콘 강제 표시 |
| `handleHomeEndKeys` | bool | !freeSolo | Home/End 키 처리 |
| `includeInputInList` | bool | false | input을 리스트에 포함 |
| `openOnFocus` | bool | false | 포커스 시 팝업 열기 |
| `selectOnFocus` | bool | !freeSolo | 포커스 시 입력값 선택 |
| `slots` | object | {} | Slot 컴포넌트 (paper, popper, listbox) |
| `slotProps` | object | {} | Slot Props (chip, clearIndicator 등) |
| `PaperComponent` | elementType | Paper | Paper 컴포넌트 (deprecated, slots.paper 사용) |
| `PopperComponent` | elementType | Popper | Popper 컴포넌트 (deprecated, slots.popper 사용) |
| `ListboxComponent` | elementType | 'ul' | Listbox 컴포넌트 (deprecated, slots.listbox 사용) |
| `ListboxProps` | object | - | Listbox props (deprecated, slotProps.listbox 사용) |
| `ChipProps` | object | - | Chip props (deprecated, slotProps.chip 사용) |
| `componentsProps` | object | - | 컴포넌트 props (deprecated, slotProps 사용) |
| `clearIcon` | node | <ClearIcon /> | Clear 아이콘 |
| `popupIcon` | node | <ArrowDropDownIcon /> | 드롭다운 아이콘 |
| `classes` | object | - | 클래스 오버라이드 |
| `sx` | object | - | 시스템 스타일 |

**전체 Props 개수**: 50개 이상

### 6. Slot 시스템

Autocomplete는 Material-UI v5의 Slot 시스템을 사용하여 내부 컴포넌트를 커스터마이징할 수 있습니다.

```javascript
const externalForwardedProps = {
  slots: {
    paper: PaperComponent,  // Paper 교체
    popper: PopperComponent,  // Popper 교체
    listbox: ListboxComponent,  // Listbox 교체
    ...slots,
  },
  slotProps: {
    chip: ChipProps,  // Chip props
    listbox: ListboxProps,  // Listbox props
    clearIndicator: ...,  // Clear 버튼 props
    popupIndicator: ...,  // 드롭다운 버튼 props
    ...slotProps,
  },
};

// useSlot 훅으로 Slot 컴포넌트 가져오기
const [ListboxSlot, listboxProps] = useSlot('listbox', {
  elementType: AutocompleteListbox,
  externalForwardedProps,
  ownerState,
  className: classes.listbox,
  additionalProps: otherListboxProps,
  ref: listboxRef,
});
```

### 7. 다중 선택 (multiple)

multiple이 true이면 value는 배열이 되고, 선택된 항목들을 Chip으로 표시합니다.

```javascript
if (multiple) {
  if (value.length > 0) {
    if (renderValue) {
      startAdornment = renderValue(value, getCustomizedItemProps, ownerState);
    } else {
      startAdornment = value.map((option, index) => (
        <Chip
          key={key}
          label={getOptionLabel(option)}
          size={size}
          {...customItemProps}
        />
      ));
    }
  }
}

// limitTags로 태그 개수 제한
if (limitTags > -1 && Array.isArray(startAdornment)) {
  const more = startAdornment.length - limitTags;
  if (!focused && more > 0) {
    startAdornment = startAdornment.splice(0, limitTags);
    startAdornment.push(
      <span className={classes.tag} key={startAdornment.length}>
        {getLimitTagsText(more)}  // "+N" 표시
      </span>
    );
  }
}
```

### 8. 그룹핑 (groupBy)

groupBy 함수가 제공되면 옵션을 그룹으로 묶어서 표시합니다.

```javascript
// useAutocomplete.js에서 그룹핑 알고리즘
if (groupBy) {
  groupedOptions = filteredOptions.reduce((acc, option, index) => {
    const group = groupBy(option);

    if (acc.length > 0 && acc[acc.length - 1].group === group) {
      // 같은 그룹에 추가
      acc[acc.length - 1].options.push(option);
    } else {
      // 새 그룹 생성
      acc.push({
        key: index,
        index,
        group,
        options: [option],
      });
    }

    return acc;
  }, []);
}

// Autocomplete.js에서 그룹 렌더링
groupedOptions.map((option, index) => {
  if (groupBy) {
    return renderGroup({
      key: option.key,
      group: option.group,
      children: option.options.map((option2, index2) =>
        renderListOption(option2, option.index + index2)
      ),
    });
  }
  return renderListOption(option, index);
})
```

---

## 설계 패턴

1. **Compound Component 패턴** (Props Getter)
   - useAutocomplete 훅이 `getRootProps()`, `getInputProps()`, `getOptionProps()` 등의 props getter 함수를 반환
   - 각 함수는 해당 요소에 필요한 props를 생성 (이벤트 핸들러, ARIA 속성 등)
   - 사용자는 이 props를 직접 spread하여 컴포넌트를 구성

2. **Controlled/Uncontrolled 이중 지원**
   - `useControlled` 훅으로 value, inputValue, open 등을 제어/비제어 모두 지원
   - defaultValue + onChange 또는 value 제공 방식 선택 가능

3. **Slot 패턴**
   - Material-UI v5의 컴포넌트 커스터마이징 시스템
   - `slots` prop으로 내부 컴포넌트 교체
   - `slotProps` prop으로 내부 컴포넌트에 props 전달

4. **Render Props 패턴**
   - `renderInput`, `renderOption`, `renderGroup`, `renderValue` 등으로 UI 커스터마이징
   - 사용자가 렌더링 로직을 완전히 제어 가능

5. **Factory 패턴**
   - `createFilterOptions()` 함수로 필터링 함수 생성
   - ignoreAccents, ignoreCase, matchFrom, limit 등 옵션 설정

---

## 복잡도의 이유

Autocomplete는 **2,600줄**이며, Material-UI에서 가장 복잡한 컴포넌트 중 하나입니다. 복잡한 이유는:

1. **로직과 UI 분리** - useAutocomplete (1,248줄) + Autocomplete (1,257줄)
   - 로직: 상태 관리, 이벤트 처리, 필터링, 키보드 네비게이션
   - UI: 렌더링, 스타일링, Slot 시스템

2. **다양한 기능 지원**
   - 단일/다중 선택
   - 자유 입력 (freeSolo)
   - 그룹핑 (groupBy)
   - 비동기 로딩
   - 커스터마이징 (render props, Slot)

3. **복잡한 키보드 네비게이션**
   - Arrow Up/Down, Home/End, Page Up/Down
   - Enter (선택), Escape (닫기/초기화)
   - Tab (포커스 이동)
   - 비활성화 항목 건너뛰기
   - 리스트 순환 (disableListWrap)

4. **제어/비제어 이중 지원**
   - value, inputValue, open 모두 제어/비제어 가능
   - useControlled 훅으로 복잡한 상태 관리

5. **필터링 알고리즘**
   - createFilterOptions() 팩토리 함수
   - ignoreAccents (발음 기호 제거)
   - ignoreCase (대소문자 무시)
   - matchFrom ('any' | 'start')
   - limit (결과 개수 제한)

6. **그룹핑 알고리즘**
   - reduce 연산으로 옵션을 그룹별로 분류 (약 40줄)
   - 그룹별 인덱스 재계산

7. **Slot 시스템**
   - useSlot 훅 3번 호출 (listbox, paper, popper)
   - externalForwardedProps 객체 생성 및 병합
   - 옛날 API (PaperComponent, ListboxComponent 등)와 호환

8. **스타일 시스템**
   - 10개의 styled 컴포넌트
   - useUtilityClasses() 함수 (약 40줄)
   - composeClasses() 호출
   - ownerState 패턴 (27줄)
   - variants 배열 (조건부 스타일)

9. **테마 시스템**
   - memoTheme() 래퍼
   - 테마 토큰 참조 (theme.zIndex.modal, theme.palette.text.secondary 등)

10. **PropTypes 메타데이터**
    - 50개 이상의 props에 대한 타입 검증 (약 500줄)

11. **Input variant 지원**
    - Input, OutlinedInput, FilledInput 모두 지원
    - 각 variant별로 다른 padding 및 스타일

---

## 핵심 학습 포인트

1. **Props Getter 패턴** - Compound Component의 유연한 구현
2. **제어/비제어 이중 지원** - useControlled 훅 활용
3. **복잡한 키보드 네비게이션** - 접근성과 사용자 경험
4. **필터링 + 그룹핑 알고리즘** - 복잡한 데이터 변환
5. **Slot 시스템** - 고급 커스터마이징 패턴
6. **Popper 포지셔닝** - 팝업 UI 배치
7. **다중 선택 + 태그** - 복합 UI 렌더링
