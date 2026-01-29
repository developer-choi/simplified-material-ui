# SelectInput 컴포넌트

> Material-UI의 SelectInput 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

SelectInput은 **Select 컴포넌트의 핵심 로직을 담당하는 내부 컴포넌트**로, Menu를 사용하여 드롭다운 선택 UI를 구현합니다.

### 핵심 기능
1. **Menu 기반 드롭다운** - Menu 컴포넌트와 통합하여 옵션 목록 표시
2. **Multiple/Single 모드** - 다중 선택과 단일 선택 모두 지원
3. **Controlled/Uncontrolled** - value와 open prop으로 제어 모드 지원
4. **Children 변형** - MenuItem에 onClick, role 등 속성 주입
5. **표시 값 관리** - 선택된 값의 표시 로직 (renderValue 지원)
6. **ARIA 접근성** - role="combobox", aria-expanded 등 접근성 속성

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Select/SelectInput.js (749줄)

SelectInput (React.forwardRef)
  └─> React.Fragment
       ├─> SelectSelect (styled div)
       │    └─> display (선택된 값 표시)
       ├─> SelectNativeInput (styled input, 숨김)
       ├─> SelectIcon (styled icon)
       └─> Menu
            └─> MenuList
                 └─> items (변형된 MenuItem들)
```

### 2. Styled Components

#### SelectSelect (클릭 가능한 영역)
```javascript
const SelectSelect = styled(StyledSelectSelect, {
  name: 'MuiSelect',
  slot: 'Select',
  overridesResolver: (props, styles) => [
    { [`&.${selectClasses.select}`]: styles.select },
    { [`&.${selectClasses.select}`]: styles[ownerState.variant] },
    { [`&.${selectClasses.error}`]: styles.error },
    { [`&.${selectClasses.multiple}`]: styles.multiple },
  ],
})({
  [`&.${selectClasses.select}`]: {
    height: 'auto',
    minHeight: '1.4375em',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
});
```

**역할**:
- 사용자가 클릭하여 메뉴를 여는 영역
- 선택된 값 표시
- variant별 스타일 (standard, outlined, filled)
- focus, error 상태 스타일

#### SelectIcon (드롭다운 아이콘)
```javascript
const SelectIcon = styled(StyledSelectIcon, {
  name: 'MuiSelect',
  slot: 'Icon',
  overridesResolver: (props, styles) => [
    styles.icon,
    ownerState.variant && styles[`icon${capitalize(ownerState.variant)}`],
    ownerState.open && styles.iconOpen,
  ],
})({});
```

**역할**:
- 드롭다운 화살표 아이콘
- open 상태에서 회전 또는 변경
- variant별 스타일

#### SelectNativeInput (숨겨진 input)
```javascript
const SelectNativeInput = styled('input', {
  shouldForwardProp: (prop) => slotShouldForwardProp(prop) && prop !== 'classes',
  name: 'MuiSelect',
  slot: 'NativeInput',
})({
  bottom: 0,
  left: 0,
  position: 'absolute',
  opacity: 0,
  pointerEvents: 'none',
  width: '100%',
  boxSizing: 'border-box',
});
```

**역할**:
- 폼 제출 시 값을 포함하기 위한 숨겨진 input
- 자동 완성(autofill) 지원
- 접근성 (screen reader)

### 3. 상태 관리

```javascript
// 값 상태 (controlled/uncontrolled)
const [value, setValueState] = useControlled({
  controlled: valueProp,
  default: defaultValue,
  name: 'Select',
});

// 열림 상태 (controlled/uncontrolled)
const [openState, setOpenState] = useControlled({
  controlled: openProp,
  default: defaultOpen,
  name: 'Select',
});

// Ref 관리
const inputRef = React.useRef(null);
const displayRef = React.useRef(null);
const [displayNode, setDisplayNode] = React.useState(null);
const [menuMinWidthState, setMenuMinWidthState] = React.useState();
```

**학습 가치**:
- `useControlled` 훅으로 controlled/uncontrolled 모드 자동 감지
- `displayRef`로 포커스 관리
- `menuMinWidthState`로 메뉴 너비 계산

### 4. Children 변형 로직

```javascript
const items = childrenArray.map((child) => {
  if (!React.isValidElement(child)) {
    return null;
  }

  let selected;

  if (multiple) {
    selected = value.some((v) => areEqualValues(v, child.props.value));
    if (selected && computeDisplay) {
      displayMultiple.push(child.props.children);
    }
  } else {
    selected = areEqualValues(value, child.props.value);
    if (selected && computeDisplay) {
      displaySingle = child.props.children;
    }
  }

  return React.cloneElement(child, {
    'aria-selected': selected ? 'true' : 'false',
    onClick: handleItemClick(child),
    onKeyUp: (event) => {
      if (event.key === ' ') {
        event.preventDefault();
      }
      if (child.props.onKeyUp) {
        child.props.onKeyUp(event);
      }
    },
    role: 'option',
    selected,
    value: undefined,
    'data-value': child.props.value,
  });
});
```

**학습 가치**:
- `React.cloneElement`로 자식 컴포넌트에 prop 주입
- selected 상태 계산 (single: areEqualValues, multiple: value.some)
- `role='option'`으로 ARIA 역할 부여
- `value`를 `data-value`로 이동 (HTML 유효성)

### 5. 아이템 클릭 핸들러

```javascript
const handleItemClick = (child) => (event) => {
  let newValue;

  if (!event.currentTarget.hasAttribute('tabindex')) {
    return;
  }

  if (multiple) {
    newValue = Array.isArray(value) ? value.slice() : [];
    const itemIndex = value.indexOf(child.props.value);
    if (itemIndex === -1) {
      newValue.push(child.props.value);
    } else {
      newValue.splice(itemIndex, 1);
    }
  } else {
    newValue = child.props.value;
  }

  if (child.props.onClick) {
    child.props.onClick(event);
  }

  if (value !== newValue) {
    setValueState(newValue);

    if (onChange) {
      const nativeEvent = event.nativeEvent || event;
      const clonedEvent = new nativeEvent.constructor(nativeEvent.type, nativeEvent);

      Object.defineProperty(clonedEvent, 'target', {
        writable: true,
        value: { value: newValue, name },
      });
      onChange(clonedEvent, child);
    }
  }

  if (!multiple) {
    update(false, event);
  }
};
```

**학습 가치**:
- **Multiple 모드**: 배열에 추가/제거 (toggle)
- **Single 모드**: 값 교체
- **Event 클론**: `event.target`을 `{ value, name }`으로 재정의
  - 폼 라이브러리와의 호환성을 위해
- **Single 모드 후 메뉴 닫기**: `update(false, event)`

### 6. 메뉴 열기/닫기

```javascript
const update = (open, event) => {
  if (open) {
    if (onOpen) {
      onOpen(event);
    }
  } else if (onClose) {
    onClose(event);
  }

  if (!isOpenControlled) {
    setMenuMinWidthState(autoWidth ? null : anchorElement.clientWidth);
    setOpenState(open);
  }
};

const handleMouseDown = (event) => {
  onMouseDown?.(event);
  if (event.button !== 0) {
    return;
  }
  event.preventDefault();
  displayRef.current.focus();
  update(true, event);
};

const handleKeyDown = (event) => {
  if (!readOnly) {
    const validKeys = [' ', 'ArrowUp', 'ArrowDown', 'Enter'];

    if (validKeys.includes(event.key)) {
      event.preventDefault();
      update(true, event);
    }
    onKeyDown?.(event);
  }
};
```

**학습 가치**:
- **왼쪽 클릭만**: `event.button !== 0` 체크
- **기본 동작 방지**: `preventDefault()`로 포커스 하이재킹
- **키보드 열기**: Space, ArrowUp/Down, Enter 키
- **콜백 호출**: onOpen, onClose
- **메뉴 너비 계산**: `anchorElement.clientWidth`

### 7. 표시 값 계산

```javascript
if (isFilled({ value }) || displayEmpty) {
  if (renderValue) {
    display = renderValue(value);
  } else {
    computeDisplay = true;
  }
}

// children 순회 중에
if (selected && computeDisplay) {
  if (multiple) {
    displayMultiple.push(child.props.children);
  } else {
    displaySingle = child.props.children;
  }
}

// 최종 표시
if (computeDisplay) {
  if (multiple) {
    display = displayMultiple.reduce((output, child, index) => {
      output.push(child);
      if (index < displayMultiple.length - 1) {
        output.push(', ');
      }
      return output;
    }, []);
  } else {
    display = displaySingle;
  }
}
```

**학습 가치**:
- **renderValue**: 사용자 정의 표시 함수
- **자동 계산**: 선택된 아이템의 children 사용
- **Multiple**: 쉼표로 구분 ("옵션1, 옵션2, 옵션3")
- **displayEmpty**: 빈 값일 때도 표시

### 8. ARIA 접근성

```javascript
<SelectSelect
  role="combobox"
  aria-controls={open ? listboxId : undefined}
  aria-disabled={disabled ? 'true' : undefined}
  aria-expanded={open ? 'true' : 'false'}
  aria-haspopup="listbox"
  aria-label={ariaLabel}
  aria-labelledby={[labelId, buttonId].filter(Boolean).join(' ') || undefined}
  aria-describedby={ariaDescribedby}
  aria-required={required ? 'true' : undefined}
  aria-invalid={error ? 'true' : undefined}
  onKeyDown={handleKeyDown}
  onMouseDown={disabled || readOnly ? null : handleMouseDown}
  onBlur={handleBlur}
  onFocus={onFocus}
>
```

**Menu listbox**:
```javascript
<Menu
  slotProps={{
    list: {
      'aria-labelledby': labelId,
      role: 'listbox',
      'aria-multiselectable': multiple ? 'true' : undefined,
      id: listboxId,
      ...listProps,
    },
  }}
>
```

**학습 가치**:
- **role="combobox"**: 선택 가능한 드롭다운
- **aria-haspopup="listbox"**: listbox가 표시됨을 알림
- **aria-expanded**: 열림 상태
- **aria-controls**: 제어하는 요소 ID
- **role="listbox"**: 메뉴의 역할
- **aria-multiselectable**: 다중 선택 가능 여부

### 9. Menu 통합

```javascript
<Menu
  id={`menu-${name || ''}`}
  anchorEl={anchorElement}
  open={open}
  onClose={handleClose}
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'center',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'center',
  }}
  {...MenuProps}
  slotProps={{
    ...MenuProps.slotProps,
    list: {
      'aria-labelledby': labelId,
      role: 'listbox',
      'aria-multiselectable': multiple ? 'true' : undefined,
      disableListWrap: true,
      id: listboxId,
      ...listProps,
    },
    paper: {
      ...paperProps,
      style: {
        minWidth: menuMinWidth,
        ...(paperProps != null ? paperProps.style : null),
      },
    },
  }}
>
  {items}
</Menu>
```

**학습 가치**:
- `anchorElement`: displayNode.parentNode를 기준으로 메뉴 표시
- `anchorOrigin`: 아래쪽 중앙에서 열림
- `disableListWrap`: 리스트 순환 비활성화
- `minWidth`: 메뉴 너비를 select 너비에 맞춤

### 10. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `value` | any | - | 선택된 값 (controlled) |
| `defaultValue` | any | - | 초기값 (uncontrolled) |
| `open` | boolean | - | 메뉴 열림 상태 (controlled) |
| `defaultOpen` | boolean | false | 초기 열림 상태 (uncontrolled) |
| `children` | node | - | MenuItem들 |
| `multiple` | boolean | false | 다중 선택 모드 |
| `disabled` | boolean | false | 비활성화 |
| `error` | boolean | false | 에러 상태 |
| `required` | boolean | false | 필수 입력 |
| `readOnly` | boolean | false | 읽기 전용 |
| `displayEmpty` | boolean | false | 빈 값 표시 |
| `renderValue` | func | - | 사용자 정의 표시 함수 |
| `onChange` | func | - | 값 변경 콜백 |
| `onOpen` | func | - | 메뉴 열기 콜백 |
| `onClose` | func | - | 메뉴 닫기 콜백 |
| `onFocus` | func | - | 포커스 콜백 |
| `onBlur` | func | - | 블러 콜백 |
| `autoWidth` | boolean | false | 자동 너비 |
| `MenuProps` | object | {} | Menu에 전달할 props |
| `IconComponent` | elementType | - | 아이콘 컴포넌트 |
| `variant` | 'standard' \| 'outlined' \| 'filled' | 'standard' | 스타일 변형 |
| `name` | string | - | input name 속성 |
| `labelId` | string | - | 라벨 ID (aria-labelledby) |

---

## 복잡도의 이유

SelectInput는 **749줄**이며, 복잡한 이유는:

1. **Styled Components** (약 80줄)
   - SelectSelect, SelectIcon, SelectNativeInput
   - overridesResolver, ownerState 기반 스타일
   - variant별 스타일

2. **Children 변형** (약 60줄)
   - React.cloneElement로 prop 주입
   - selected 상태 계산
   - display 값 계산

3. **이벤트 핸들링** (약 100줄)
   - handleItemClick (다중/단일 로직)
   - handleKeyDown, handleMouseDown, handleClose
   - Event 클론 및 target 재정의

4. **Controlled/Uncontrolled** (약 50줄)
   - useControlled 훅
   - value, open 상태 관리

5. **표시 값 계산** (약 80줄)
   - renderValue 지원
   - multiple 모드 쉼표 구분
   - displayEmpty 지원

6. **Menu 통합** (약 40줄)
   - anchorOrigin, transformOrigin
   - slotProps 병합
   - listbox ARIA 속성

7. **접근성** (약 40줄)
   - ARIA 속성
   - role 부여
   - labelId 연동

8. **Ref 관리** (약 30줄)
   - useForkRef로 ref 병합
   - useImperativeHandle로 메서드 노출

9. **개발 모드 경고** (약 30줄)
   - Fragment 사용 경고
   - 값 불일치 경고

10. **PropTypes** (약 150줄)
    - 30개 이상의 props 정의
    - JSDoc 주석

---

## 설계 패턴

### 1. Compound Component Pattern
SelectInput + Menu + MenuItem 조합으로 드롭다운 구현

### 2. Controlled/Uncontrolled Pattern
useControlled 훅으로 모드 자동 감지

### 3. Children Manipulation
React.cloneElement로 자식 컴포넌트에 prop 주입

### 4. Render Props Pattern
renderValue로 표시 로직 커스터마이즈

### 5. Event augmentation
Event 객체의 target을 재정의하여 폼 라이브러리 호환성 확보
