# Link 단순화 결과

> Link 컴포넌트 간소화 과정 및 최종 결과

---

## 간소화 전/후 비교

| 항목 | 원본 | 단순화 |
|------|------|--------|
| 줄 수 | 335줄 | ~45줄 |
| 의존성 | Typography, styled, memoTheme, isFocusVisible 등 10+ | isFocusVisible 1개 |
| 스타일링 | CSS-in-JS (styled + variants) | 인라인 style + `<style>` 태그 |

---

## 최종 코드

```javascript
'use client';
import * as React from 'react';
import isFocusVisible from '@mui/utils/isFocusVisible';

const linkStyles = `.MuiLink-hover:hover { text-decoration: underline; }`;

function Link(props) {
  const {
    children,
    underline = 'always',
    ...other
  } = props;

  const [focusVisible, setFocusVisible] = React.useState(false);
  const handleBlur = (event) => {
    if (!isFocusVisible(event.target)) setFocusVisible(false);
  };
  const handleFocus = (event) => {
    if (isFocusVisible(event.target)) setFocusVisible(true);
  };

  return (
    <>
      <style>{linkStyles}</style>
      <a
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={underline === 'hover' ? 'MuiLink-hover' : undefined}
        style={{
          color: '#1976d2',
          textDecoration: underline === 'always' ? 'underline' : 'none',
          outline: focusVisible ? 'auto' : 0,
        }}
        {...other}
      >
        {children}
      </a>
    </>
  );
}

export default Link;
```

---

## 제거된 것들 (8단계)

| 단계 | 제거 대상 | 이유 |
|------|-----------|------|
| 1 | PropTypes (~93줄) | 학습 목적에 불필요 |
| 2 | `useDefaultProps` | 함수 파라미터 기본값으로 충분 |
| 3 | `className/classes/TypographyClasses/useUtilityClasses` | 인라인 스타일로 대체 |
| 4 | `color` prop + `v6Colors` + `getTextDecoration` + `createSimplePaletteValueFilter` | color보다 underline/focus가 핵심 |
| 5 | `component/variant/onBlur/onFocus` props | `<a>` 고정, 외부 콜백 불필요 |
| 6 | `sx` prop | 인라인 style로 충분 |
| 7 | `forwardRef` | 외부 ref 전달 학습 주제 분리 |
| 8 | `styled(Typography)/LinkRoot` + Typography/memoTheme/useTheme/capitalize | 핵심은 `<a>` 동작 자체 |

---

## 핵심 학습 포인트

### 1. isFocusVisible 패턴

```javascript
// 마우스 클릭 vs 키보드 Tab 포커스 구분
const [focusVisible, setFocusVisible] = React.useState(false);
const handleBlur = (event) => {
  if (!isFocusVisible(event.target)) setFocusVisible(false);
};
const handleFocus = (event) => {
  if (isFocusVisible(event.target)) setFocusVisible(true);
};
```

- **isFocusVisible**: `:focus-visible` CSS pseudo-class와 동일한 동작을 JS에서 구현
- 키보드 Tab으로 포커스 → `focusVisible = true` → `outline: auto` (접근성)
- 마우스 클릭으로 포커스 → `focusVisible = false` → `outline: 0`
- `outline: focusVisible ? 'auto' : 0` 로 조건부 스타일 적용

### 2. underline prop → 인라인 스타일 변환

```javascript
// 원본: styled variants 배열 (CSS-in-JS)
{ props: { underline: 'hover' }, style: { '&:hover': { textDecoration: 'underline' } } }

// 단순화: 조건부 인라인 스타일 + style 태그
const linkStyles = `.MuiLink-hover:hover { text-decoration: underline; }`;
// ...
className={underline === 'hover' ? 'MuiLink-hover' : undefined}
style={{ textDecoration: underline === 'always' ? 'underline' : 'none' }}
```

- `underline: 'hover'`는 CSS `:hover` pseudo-class 필요 → 인라인 style로 불가 → `<style>` 태그 활용
- `underline: 'always'`와 `'none'`은 인라인 style로 직접 적용 가능

### 3. `<style>` 태그 인라인 주입

```javascript
<>
  <style>{`.MuiLink-hover:hover { text-decoration: underline; }`}</style>
  <a className="MuiLink-hover" ...>링크</a>
</>
```

- CSS-in-JS 없이 pseudo-class 스타일 적용하는 가장 간단한 방법
- 컴포넌트가 렌더링될 때마다 style 태그가 생성되므로 실제 프로젝트에서는 글로벌 CSS 권장
