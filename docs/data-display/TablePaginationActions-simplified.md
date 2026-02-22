# TablePaginationActions (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';

const FirstPageIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}>
    <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
  </svg>
);

const LastPageIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}>
    <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
  </svg>
);

const KeyboardArrowLeft = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}>
    <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
  </svg>
);

const KeyboardArrowRight = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}>
    <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
  </svg>
);

const TablePaginationActions = React.forwardRef(function TablePaginationActions(props, ref) {
  const {
    className,
    count,
    disabled = false,
    getItemAriaLabel,
    onPageChange,
    page,
    rowsPerPage,
    showFirstButton,
    showLastButton,
    style,
    ...other
  } = props;

  const handleFirstPageButtonClick = (event) => onPageChange(event, 0);
  const handleBackButtonClick = (event) => onPageChange(event, page - 1);
  const handleNextButtonClick = (event) => onPageChange(event, page + 1);
  const handleLastPageButtonClick = (event) =>
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));

  const lastPage = Math.ceil(count / rowsPerPage) - 1;

  const btnStyle = {
    background: 'none',
    border: 'none',
    padding: 8,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    cursor: 'pointer',
  };

  return (
    <div ref={ref} className={className} style={style} {...other}>
      {showFirstButton && (
        <button
          onClick={handleFirstPageButtonClick}
          disabled={disabled || page === 0}
          aria-label={getItemAriaLabel('first', page)}
          title={getItemAriaLabel('first', page)}
          style={btnStyle}
        >
          <FirstPageIcon />
        </button>
      )}
      <button
        onClick={handleBackButtonClick}
        disabled={disabled || page === 0}
        aria-label={getItemAriaLabel('previous', page)}
        title={getItemAriaLabel('previous', page)}
        style={btnStyle}
      >
        <KeyboardArrowLeft />
      </button>
      <button
        onClick={handleNextButtonClick}
        disabled={disabled || (count !== -1 ? page >= lastPage : false)}
        aria-label={getItemAriaLabel('next', page)}
        title={getItemAriaLabel('next', page)}
        style={btnStyle}
      >
        <KeyboardArrowRight />
      </button>
      {showLastButton && (
        <button
          onClick={handleLastPageButtonClick}
          disabled={disabled || page >= lastPage}
          aria-label={getItemAriaLabel('last', page)}
          title={getItemAriaLabel('last', page)}
          style={btnStyle}
        >
          <LastPageIcon />
        </button>
      )}
    </div>
  );
});

export default TablePaginationActions;
```

**249줄 → 113줄 (−55%)**

---

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `styled('div')` (빈 스타일) | `<div>` 직접 사용 |
| `IconButton` | `<button>` 직접 사용 |
| `useRtl()` + RTL 분기 8개 | RTL 지원 제거 |
| `slots`, `slotProps` (8개) | 슬롯 시스템 제거 |
| `backIconButtonProps`, `nextIconButtonProps` | deprecated prop 제거 |
| 4개 아이콘 import (createSvgIcon) | 인라인 SVG로 대체 |
| `useUtilityClasses`, `composeClasses` | CSS 클래스 시스템 제거 |
| `getTablePaginationActionsUtilityClass` | 클래스 시스템 일부 |
| `classes` prop | 클래스 오버라이드 제거 |
| `useDefaultProps` | 기본값 직접 처리 |
| `ownerState` | styled 변형 시스템 제거 |
| `PropTypes` | 런타임 타입 검사 제거 |

---

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `count`, `page`, `rowsPerPage` | 페이지 수 계산 필수 |
| `onPageChange` | 핵심 기능 |
| `showFirstButton`, `showLastButton` | 버튼 표시 제어 |
| `getItemAriaLabel` | 접근성 (aria-label, title) |
| `disabled` | 전체 버튼 비활성화 |
| 페이지 계산 로직 | 핵심 학습 포인트 |

---

## 핵심 학습 포인트

### 1. 페이지 계산 로직

```js
const lastPage = Math.ceil(count / rowsPerPage) - 1;
```

| `count` | `rowsPerPage` | `lastPage` |
|---------|--------------|-----------|
| 100 | 10 | 9 (0~9 페이지) |
| 101 | 10 | 10 (0~10 페이지) |
| 0 | 10 | -1 (빈 데이터) |

`Math.ceil`: 나머지 데이터를 위한 마지막 페이지 포함.

**마지막 페이지 이동:**
```js
Math.max(0, Math.ceil(count / rowsPerPage) - 1)
```
`count === 0`이면 `lastPage === -1` → `Math.max(0, -1) === 0`으로 음수 방지.

### 2. count === -1 — 전체 데이터 수 미확정

```js
// next 버튼 disabled 조건
disabled={disabled || (count !== -1 ? page >= lastPage : false)}
```

| `count` | 의미 | next 버튼 |
|---------|------|----------|
| ≥ 0 | 전체 데이터 수 확정 | 마지막 페이지면 비활성 |
| -1 | 전체 데이터 수 모름 | 항상 활성 (언제 끝날지 모름) |

**`count === -1` 사용 예시**: 무한 스크롤 데이터, API가 총 개수를 반환하지 않을 때.

### 3. getItemAriaLabel — aria-label과 title 동시 설정

```jsx
<button
  aria-label={getItemAriaLabel('previous', page)}
  title={getItemAriaLabel('previous', page)}
>
```

같은 함수를 `aria-label`과 `title` 양쪽에 모두 사용:
- `aria-label`: 스크린 리더가 읽는 레이블 (HTML 구조 접근성)
- `title`: 마우스 호버 시 툴팁 (시각 접근성)

`getItemAriaLabel`은 사용자가 전달하는 함수로 로컬라이징 가능:
```js
// 기본값 (TablePagination에서 전달)
getItemAriaLabel={(type) => {
  if (type === 'first') return 'Go to first page';
  if (type === 'last') return 'Go to last page';
  if (type === 'next') return 'Go to next page';
  if (type === 'previous') return 'Go to previous page';
}}
```

### 4. disabled 버튼 조건 패턴

각 버튼마다 두 가지 조건:
```js
// 공통: 전체 disabled
disabled={disabled || <버튼별 조건>}
```

| 버튼 | 비활성 조건 |
|------|----------|
| first | `page === 0` (이미 첫 페이지) |
| previous | `page === 0` (이미 첫 페이지) |
| next | `count !== -1 && page >= lastPage` (마지막 페이지이고 총 수 확정) |
| last | `page >= lastPage` (이미 마지막 페이지) |

`disabled` HTML 속성은 브라우저가 클릭 이벤트를 차단하고 포커스를 제거.

### 5. btnStyle 상수 — 반복 코드 단순화

```js
const btnStyle = {
  background: 'none',
  border: 'none',
  padding: 8,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  cursor: 'pointer',
};
```

4개 버튼이 동일한 스타일을 공유하므로 상수로 추출.
원본의 `IconButton`이 제공하던 스타일을 수동으로 재현:
- `background: none, border: none` → 기본 버튼 스타일 제거
- `borderRadius: '50%'` → 원형 hover 영역
- `display: inline-flex, alignItems: center` → 아이콘 중앙 정렬
- `fontSize: '1.5rem'` → 아이콘 크기 (`width: 1em` 기반이므로)

### 6. RTL 제거 — 원본의 복잡성

원본 RTL 처리:
```js
// 버튼 4개, 아이콘 4개 = 총 8개 RTL 분기
const FirstButtonSlot = isRtl ? LastButton : FirstButton;
const PreviousButtonSlot = isRtl ? NextButton : PreviousButton;
// ...
const firstButtonSlotProps = isRtl ? slotProps.lastButton : slotProps.firstButton;
// ...
```

RTL에서는 first/last 스왑, prev/next 스왑 → 8개의 조건 변수.
단순화에서는 LTR만 지원하여 이 복잡성을 제거.
