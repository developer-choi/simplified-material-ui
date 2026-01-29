# SelectInput 컴포넌트

> Material-UI SelectInput의 최소 단순화 컴포넌트

---

## 무슨 기능을 하는가?

SelectInput은 **Select 컴포넌트의 핵심 로직을 담당하는 내부 컴포넌트**로, Menu를 사용하여 드롭다운 선택 UI를 구현합니다.

### 핵심 기능 (남은 것)
1. **Menu 기반 드롭다운** - Menu 컴포넌트와 통합하여 옵션 목록 표시
2. **Multiple/Single 모드** - 다중 선택과 단일 선택 모두 지원
3. **Controlled/Uncontrolled** - value와 open prop으로 제어 모드 지원
4. **Children 변형** - MenuItem에 onClick, role 등 속성 주입
5. **표시 값 관리** - 선택된 값의 표시 로직 (renderValue 지원)
6. **ARIA 접근성** - role="combobox", aria-expanded 등 접근성 속성

> **제거된 기능**: Styled Components, PropTypes, Utility Classes, Slot 시스템, autoWidth, displayEmpty, variant, 개발 모드 경고, ownerDocument 유틸리티

---

## 핵심 학습 포인트

### 1. Children Manipulation 패턴

```javascript
const items = childrenArray.map((child) => {
  return React.cloneElement(child, {
    'aria-selected': selected ? 'true' : 'false',
    onClick: handleItemClick(child),
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

### 2. Controlled/Uncontrolled 패턴

```javascript
const [value, setValueState] = useControlled({
  controlled: valueProp,
  default: defaultValue,
  name: 'Select',
});

const [openState, setOpenState] = useControlled({
  controlled: openProp,
  default: defaultOpen,
  name: 'Select',
});
```

**학습 가치**:
- `useControlled` 훅으로 controlled/uncontrolled 모드 자동 감지
- **Controlled**: value prop으로 값 제어
- **Uncontrolled**: defaultValue로 초기값 설정, 내부 상태 사용

### 3. Event Augmentation (이벤트 증강)

```javascript
const handleItemClick = (child) => (event) => {
  // 값 변경 로직...

  if (onChange) {
    const nativeEvent = event.nativeEvent || event;
    const clonedEvent = new nativeEvent.constructor(nativeEvent.type, nativeEvent);

    Object.defineProperty(clonedEvent, 'target', {
      writable: true,
      value: { value: newValue, name },
    });
    onChange(clonedEvent, child);
  }
};
```

**학습 가치**:
- **Event 클론**: `event.target`을 `{ value, name }`으로 재정의
- 폼 라이브러리와의 호환성 확보
- `event.nativeEvent`로 원래 이벤트 보존

### 4. Menu 통합

```javascript
<Menu
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
    list: {
      'aria-labelledby': labelId,
      role: 'listbox',
      'aria-multiselectable': multiple ? 'true' : undefined,
      disableListWrap: true,
      id: listboxId,
      ...MenuProps.MenuListProps,
    },
    paper: {
      ...MenuProps.PaperProps,
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
- ARIA 속성: `role='listbox'`, `aria-multiselectable`

### 5. 표시 값 계산

```javascript
if (isFilled({ value })) {
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

### 6. 키보드 지원

```javascript
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
- **Space, ArrowUp/Down, Enter**: 메뉴 열기
- `preventDefault()`: 기본 동작 방지
- `readOnly` 체크: 읽기 전용 모드 지원

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Select/SelectInput.js (464줄, 원본 749줄)

SelectInput (React.forwardRef)
  └─> React.Fragment
       ├─> div (클릭 가능한 영역)
       │    └─> display (선택된 값 표시)
       ├─> input (숨겨진 input)
       ├─> IconComponent (드롭다운 아이콘)
       └─> Menu
            └─> MenuList
                 └─> items (변형된 MenuItem들)
```

### 2. 상태 관리

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
const inputRef = inputRefProp || React.useRef();
const displayRef = React.useRef(null);
const [displayNode, setDisplayNode] = React.useState(null);
```

**학습 가치**:
- `useControlled` 훅으로 제어 모드 자동 감지
- `displayRef`로 포커스 관리
- `displayNode`로 메뉴 위치 계산

### 3. 아이템 클릭 핸들러

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
- **Event 클론**: 폼 라이브러리 호환성
- **Single 모드 후 메뉴 닫기**: `update(false, event)`

### 4. 메뉴 열기/닫기

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
```

**학습 가치**:
- **왼쪽 클릭만**: `event.button !== 0` 체크
- **기본 동작 방지**: `preventDefault()`로 포커스 하이재킹
- **키보드 열기**: Space, ArrowUp/Down, Enter 키
- **콜백 호출**: onOpen, onClose

---

## 전체 코드

```javascript
'use client';
import * as React from 'react';
import useId from '@mui/utils/useId';
import Menu from '../../../menu/Menu/Menu';
import { isFilled } from '../../../form/InputBase/utils';
import useForkRef from '../utils/useForkRef';
import useControlled from '../utils/useControlled';

function areEqualValues(a, b) {
  if (typeof b === 'object' && b !== null) {
    return a === b;
  }

  // The value could be a number, the DOM will stringify it anyway.
  return String(a) === String(b);
}

function isEmpty(display) {
  return display == null || (typeof display === 'string' && !display.trim());
}

/**
 * @ignore - internal component.
 */
const SelectInput = React.forwardRef(function SelectInput(props, ref) {
  const {
    'aria-describedby': ariaDescribedby,
    'aria-label': ariaLabel,
    autoFocus,
    children,
    className,
    defaultOpen,
    defaultValue,
    disabled,
    error = false,
    IconComponent,
    inputRef: inputRefProp,
    labelId,
    MenuProps = {},
    multiple,
    name,
    onBlur,
    onChange,
    onClose,
    onFocus,
    onKeyDown,
    onMouseDown,
    onOpen,
    open: openProp,
    readOnly,
    renderValue,
    required,
    SelectDisplayProps = {},
    tabIndex: tabIndexProp,
    value: valueProp,
    ...other
  } = props;

  const [value, setValueState] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: 'Select',
  });

  const [openState, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen,
    name: 'Select',
  });

  const inputRef = inputRefProp || React.useRef();
  const displayRef = React.useRef(null);
  const [displayNode, setDisplayNode] = React.useState(null);
  const { current: isOpenControlled } = React.useRef(openProp != null);

  const handleRef = useForkRef(ref, inputRefProp);

  const handleDisplayRef = React.useCallback((node) => {
    displayRef.current = node;

    if (node) {
      setDisplayNode(node);
    }
  }, []);

  const anchorElement = displayNode?.parentNode;

  React.useImperativeHandle(
    handleRef,
    () => ({
      focus: () => {
        displayRef.current.focus();
      },
      node: inputRef.current,
      value,
    }),
    [inputRef, value],
  );

  // `isOpenControlled` is ignored because the component should never switch between controlled and uncontrolled modes.
  // `defaultOpen` and `openState` are ignored to avoid unnecessary callbacks.
  React.useEffect(() => {
    if (autoFocus) {
      displayRef.current.focus();
    }
  }, [autoFocus]);

  React.useEffect(() => {
    if (!labelId) {
      return undefined;
    }
    const label = document.getElementById(labelId);
    if (label) {
      const handler = () => {
        if (getSelection().isCollapsed) {
          displayRef.current.focus();
        }
      };
      label.addEventListener('click', handler);

      return () => {
        label.removeEventListener('click', handler);
      };
    }
    return undefined;
  }, [labelId]);

  const update = (open, event) => {
    if (open) {
      if (onOpen) {
        onOpen(event);
      }
    } else if (onClose) {
      onClose(event);
    }

    if (!isOpenControlled) {
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
      const validKeys = [
        ' ',
        'ArrowUp',
        'ArrowDown',
        // The native select doesn't respond to enter on macOS, but it's recommended by
        // https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
        'Enter',
      ];

      if (validKeys.includes(event.key)) {
        event.preventDefault();
        update(true, event);
      }
      onKeyDown?.(event);
    }
  };

  const handleClose = (event) => {
    update(false, event);
  };

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
        // Redefine target to allow name and value to be read.
        // This allows seamless integration with the most popular form libraries.
        // https://github.com/mui/material-ui/issues/13485#issuecomment-676048492
        // Clone the event to not override `target` of the original event.
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

  const open = displayNode !== null && openState;

  const handleBlur = (event) => {
    // if open event.stopImmediatePropagation
    if (!open && onBlur) {
      // Preact support, target is read only property on a native event.
      Object.defineProperty(event, 'target', { writable: true, value: { value, name } });
      onBlur(event);
    }
  };

  delete other['aria-invalid'];

  let display;
  let displaySingle;
  const displayMultiple = [];
  let computeDisplay = false;
  let foundMatch = false;

  // No need to display any value if the field is empty.
  if (isFilled({ value })) {
    if (renderValue) {
      display = renderValue(value);
    } else {
      computeDisplay = true;
    }
  }

  const childrenArray = React.Children.toArray(children);

  const items = childrenArray.map((child) => {
    if (!React.isValidElement(child)) {
      return null;
    }

    let selected;

    if (multiple) {
      if (!Array.isArray(value)) {
        throw /* minify-error */ new Error(
          'MUI: The `value` prop must be an array ' +
            'when using the `Select` component with `multiple`.',
        );
      }

      selected = value.some((v) => areEqualValues(v, child.props.value));
      if (selected && computeDisplay) {
        displayMultiple.push(child.props.children);
      }

      if (!foundMatch && selected) {
        foundMatch = true;
      }
    } else {
      selected = areEqualValues(value, child.props.value);
      if (selected && computeDisplay) {
        displaySingle = child.props.children;
      }

      if (!foundMatch && selected) {
        foundMatch = true;
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

  if (computeDisplay) {
    if (multiple) {
      if (displayMultiple.length === 0) {
        display = null;
      } else {
        display = displayMultiple.reduce((output, child, index) => {
          output.push(child);
          if (index < displayMultiple.length - 1) {
            output.push(', ');
          }
          return output;
        }, []);
      }
    } else {
      display = displaySingle;
    }
  }

  let tabIndex;
  if (typeof tabIndexProp !== 'undefined') {
    tabIndex = tabIndexProp;
  } else {
    tabIndex = disabled ? null : 0;
  }

  const buttonId = SelectDisplayProps.id || (name ? `mui-component-select-${name}` : undefined);

  const listboxId = useId();

  return (
    <React.Fragment>
      <div
        ref={handleDisplayRef}
        tabIndex={tabIndex}
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
        {...SelectDisplayProps}
        style={{
          height: 'auto',
          minHeight: '1.4375em',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          cursor: disabled ? 'default' : 'text',
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          ...SelectDisplayProps.style,
        }}
        className={SelectDisplayProps.className || className}
        // The id is required for proper a11y
        id={buttonId}
      >
        {/* So the vertical align positioning algorithm kicks in. */}
        {isEmpty(display) ? (
          // notranslate needed while Google Translate will not fix zero-width space issue
          <span className="notranslate" aria-hidden>
            &#8203;
          </span>
        ) : (
          display
        )}
      </div>
      <input
        aria-invalid={error}
        value={Array.isArray(value) ? value.join(',') : value}
        name={name}
        ref={inputRef}
        aria-hidden
        onChange={handleChange}
        tabIndex={-1}
        disabled={disabled}
        style={{
          bottom: 0,
          left: 0,
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
        autoFocus={autoFocus}
        required={required}
        {...other}
      />
      <IconComponent />
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
          list: {
            'aria-labelledby': labelId,
            role: 'listbox',
            'aria-multiselectable': multiple ? 'true' : undefined,
            disableListWrap: true,
            id: listboxId,
            ...MenuProps.MenuListProps,
          },
          paper: {
            ...MenuProps.PaperProps,
          },
        }}
      >
        {items}
      </Menu>
    </React.Fragment>
  );
});

export default SelectInput;
```

---

## Props (23개)

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
| `renderValue` | func | - | 사용자 정의 표시 함수 |
| `onChange` | func | - | 값 변경 콜백 |
| `onOpen` | func | - | 메뉴 열기 콜백 |
| `onClose` | func | - | 메뉴 닫기 콜백 |
| `onFocus` | func | - | 포커스 콜백 |
| `onBlur` | func | - | 블러 콜백 |
| `onKeyDown` | func | - | 키 다운 콜백 |
| `onMouseDown` | func | - | 마우스 다운 콜백 |
| `IconComponent` | elementType | - | 아이콘 컴포넌트 |
| `name` | string | - | input name 속성 |
| `labelId` | string | - | 라벨 ID |
| `autoFocus` | boolean | - | 자동 포커스 |
| `inputRef` | ref | - | input ref |
| `SelectDisplayProps` | object | {} | 표시 영역 props |
| `tabIndex` | number \| string | - | tabIndex |
| `MenuProps` | object | {} | Menu에 전달할 props |

---

## 커밋 히스토리로 보는 단순화 과정

SelectInput은 **8개의 커밋**을 통해 단순화되었습니다.

### 1단계: Styled Components 제거
- `1b57cdf8` - [SelectInput 단순화 1/9] Styled Components 제거

**왜 불필요한가**:
- **학습 목적**: SelectInput의 핵심은 "드롭다운 선택 로직"이지 "스타일링 시스템"이 아님
- **복잡도**: styled(), overridesResolver, ownerState 연동 (약 80줄)
- **간소화**: 인라인 스타일로 충분

**삭제 대상**:
- `SelectSelect`, `SelectIcon`, `SelectNativeInput` styled 컴포넌트
- `styled`, `slotShouldForwardProp`, `StyledSelectSelect`, `StyledSelectIcon` import
- `capitalize`, `composeClasses`, `clsx`, `selectClasses` import
- `useUtilityClasses` 함수

**결과**: 47줄 감소

### 2단계: PropTypes 제거
- `f46d7740` - [SelectInput 단순화 2/9] PropTypes 제거

**왜 불필요한가**:
- **학습 목적**: PropTypes는 런타임 타입 검증 도구
- **복잡도**: 30개 props 정의, JSDoc 주석 (약 150줄)

**삭제 대상**:
- `PropTypes` 정의 전체
- `PropTypes`, `refType` import

**결과**: 151줄 감소

### 3단계: Slot 시스템 제거
- `7407ffbc` - [SelectInput 단순화 3/9] Slot 시스템 제거

**왜 불필요한가**:
- **학습 목적**: Slot 시스템은 고급 기능
- **복잡도**: slotProps 병합 로직 (약 20줄)

**삭제 대상**:
- `MenuProps.slotProps` 병합 로직
- `ownerState` 생성
- `paperProps`, `listProps` 별도 변수

**결과**: 26줄 감소

### 4단계: autoWidth 제거
- `c0a2da0a` - [SelectInput 단순화 4/9] autoWidth 제거

**왜 불필요한가**:
- **학습 목적**: 자동 너비 계산은 상세 구현
- **복잡도**: 메뉴 너비 계산 로직 (약 10줄)

**삭제 대상**:
- `autoWidth` prop
- `menuMinWidthState` state
- `setMenuMinWidthState` 호출
- menu minWidth 스타일

**결과**: 21줄 감소

### 5단계: displayEmpty 제거
- `e7cd1621` - [SelectInput 단순화 5/9] displayEmpty 제거

**왜 불필요한가**:
- **학습 목적**: 빈 값 표시는 부가 기능
- **간소화**: 빈 값은 기본적으로 placeholder로 처리

**삭제 대상**:
- `displayEmpty` prop
- 조건문에서 `|| displayEmpty` 제거

**결과**: 2줄 감소

### 6단계: variant 제거
- `e9994f22` - [SelectInput 단순화 6/9] variant 제거

**왜 불필요한가**:
- **학습 목적**: 스타일 변형은 스타일링 시스템의 영역
- **간소화**: 단일 스타일로 충분

**삭제 대상**:
- `variant` prop
- `capitalize` 함수

**결과**: 8줄 감소

### 7단계: 개발 모드 경고 제거
- `a7bdb7bf` - [SelectInput 단순화 7/9] 개발 모드 경고 제거

**왜 불필요한가**:
- **학습 목적**: 개발 도구 기능은 핵심 로직이 아님
- **복잡도**: console.error/warn (약 30줄)

**삭제 대상**:
- Fragment 사용 경고
- 값 불일치 경고
- `process.env.NODE_ENV` 조건
- `isFragment` import

**결과**: 31줄 감소

### 8단계: 외부 유틸리티 간소화
- `e35c2301` - [SelectInput 단순화 8/9] 외부 유틸리티 간소화

**왜 불필요한가**:
- **학습 목적**: iframe 등 특수 케이스용 유틸리티 불필요
- **간소화**: 표준 API로 대체

**삭제 대상**:
- `ownerDocument` import
- `ownerDocument(displayRef.current)` → `document`

**결과**: 2줄 감소

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 749줄 | 464줄 (**38% 감소**) |
| **Props 개수** | 30개 | 23개 (-7개) |
| **외부 의존** | 14개 | 5개 (-9개) |
| **Styled Components** | ✅ 3개 | ❌ 인라인 div/span/input |
| **PropTypes** | ✅ 150줄 | ❌ |
| **Utility Classes** | ✅ composeClasses | ❌ |
| **Slot 시스템** | ✅ slotProps 병합 | ❌ 직접 구성 |
| **autoWidth** | ✅ menuMinWidthState | ❌ |
| **displayEmpty** | ✅ | ❌ |
| **variant** | ✅ 3개 | ❌ |
| **개발 모드 경고** | ✅ NODE_ENV 체크 | ❌ |
| **ownerDocument** | ✅ | ❌ document |
| **핵심 기능** | ✅ | ✅ 유지 |

---

## 설계 패턴

### 1. Children Manipulation Pattern
React.cloneElement로 자식 컴포넌트에 prop 주입

### 2. Controlled/Uncontrolled Pattern
useControlled 훅으로 모드 자동 감지

### 3. Event Augmentation Pattern
Event 객체의 target을 재정의하여 폼 라이브러리 호환성 확보

### 4. Compound Component Pattern
SelectInput + Menu + MenuItem 조합

### 5. Render Props Pattern
renderValue로 표시 로직 커스터마이즈

---

## 학습 후 다음 단계

SelectInput을 이해했다면:

1. **Select** - SelectInput을 감싸는 최종 컴포넌트
2. **TextField** - Select + FormControl + Label 조합

**예시: 기본 사용**
```javascript
<SelectInput
  value={value}
  onChange={handleChange}
>
  <MenuItem value={10}>Ten</MenuItem>
  <MenuItem value={20}>Twenty</MenuItem>
  <MenuItem value={30}>Thirty</MenuItem>
</SelectInput>
```

**예시: Multiple 모드**
```javascript
<SelectInput
  multiple
  value={value}
  onChange={handleChange}
>
  <MenuItem value={10}>Ten</MenuItem>
  <MenuItem value={20}>Twenty</MenuItem>
  <MenuItem value={30}>Thirty</MenuItem>
</SelectInput>
```

**예시: renderValue**
```javascript
<SelectInput
  value={value}
  renderValue={(selected) => {
    if (selected === '') {
      return <em>선택하세요</em>;
    }
    return selected;
  }}
>
  <MenuItem value="">선택하세요</MenuItem>
  <MenuItem value={10}>Ten</MenuItem>
  <MenuItem value={20}>Twenty</MenuItem>
</SelectInput>
```
