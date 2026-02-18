# NativeSelect 단순화 결과

> NativeSelect 컴포넌트 간소화 과정 및 최종 결과

---

## 간소화 전/후 비교

| 항목 | 원본 | 단순화 |
|------|------|--------|
| 줄 수 | ~95줄 (2파일) | ~70줄 (2파일) |
| 제거 | forwardRef, muiName, 명시적 props 전달 | - |

---

## 최종 코드

### NativeSelect.js

```javascript
'use client';
import * as React from 'react';
import NativeSelectInput from './NativeSelectInput';

function NativeSelect({ children, ...props }) {
  return (
    <NativeSelectInput {...props}>
      {children}
    </NativeSelectInput>
  );
}

export default NativeSelect;
```

### NativeSelectInput.js

```javascript
'use client';
import * as React from 'react';
import ArrowDropDownIcon from '../internal/svg-icons/ArrowDropDown';

function NativeSelectInput(props) {
  const {
    disabled,
    error,   // DOM에 전달 방지용 (사용 안 함)
    multiple,
    open,
    ...other
  } = props;

  const selectStyle = {
    MozAppearance: 'none',
    WebkitAppearance: 'none',
    userSelect: 'none',
    borderRadius: 0,
    cursor: disabled ? 'default' : 'pointer',
    paddingRight: 24,
    minWidth: 16,
  };

  const iconStyle = {
    position: 'absolute',
    right: 0,
    top: 'calc(50% - .5em)',
    pointerEvents: 'none',
    color: disabled ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.54)',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    width: '1em',
    height: '1em',
  };

  return (
    <React.Fragment>
      <select style={selectStyle} disabled={disabled} multiple={multiple} {...other} />
      {!multiple && <ArrowDropDownIcon style={iconStyle} />}
    </React.Fragment>
  );
}

export default NativeSelectInput;
```

---

## 제거된 것들 (1단계)

| 제거 대상 | 이유 |
|-----------|------|
| `forwardRef` (NativeSelect, NativeSelectInput) | 외부 ref 전달 학습 주제 분리 |
| `NativeSelect.muiName = 'Select'` | MUI 내부 컴포넌트 감지 시스템 |
| NativeSelect 명시적 props 전달 | `{...props}` 스프레드로 단순화 |

---

## 핵심 학습 포인트

### 1. 얇은 래퍼 (Thin Wrapper) 패턴

```javascript
// NativeSelect는 단순히 NativeSelectInput을 감싸는 래퍼
function NativeSelect({ children, ...props }) {
  return <NativeSelectInput {...props}>{children}</NativeSelectInput>;
}
```

- API 진입점과 구현을 분리하는 패턴
- 외부에서는 `NativeSelect`를 사용, 내부 구현은 `NativeSelectInput`에 집중

### 2. props 필터링 - 비표준 DOM 속성 방지

```javascript
function NativeSelectInput(props) {
  const {
    disabled,
    error,   // ← 의도적으로 소비 (DOM에 전달 안 함)
    multiple,
    open,    // ← 의도적으로 소비 (DOM에 전달 안 함)
    ...other // ← 나머지는 <select>에 전달
  } = props;
}
```

- `error`, `open`은 `<select>` DOM에 전달하면 React 경고 발생
- 구조분해로 해당 props를 "소비"해서 `...other`에서 제외
- 이 패턴은 커스텀 컴포넌트가 DOM 엘리먼트를 감쌀 때 흔히 사용됨

### 3. 브라우저 기본 스타일 제거

```javascript
const selectStyle = {
  MozAppearance: 'none',    // Firefox 기본 select 스타일 제거
  WebkitAppearance: 'none', // Chrome/Safari 기본 select 스타일 제거
  paddingRight: 24,         // 커스텀 아이콘 공간 확보
};
```

- 브라우저마다 다른 기본 `<select>` 스타일을 제거
- 커스텀 `ArrowDropDownIcon`으로 일관된 UI 제공

### 4. multiple 조건부 렌더링

```javascript
{!multiple && <ArrowDropDownIcon style={iconStyle} />}
```

- `multiple=true` 드롭다운은 펼쳐진 리스트 형태 → 화살표 아이콘 불필요
- `multiple=false` (기본) → 드롭다운 화살표 표시
