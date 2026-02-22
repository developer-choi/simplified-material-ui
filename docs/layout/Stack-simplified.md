# Stack (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';

function joinChildren(children, separator) {
  const childrenArray = React.Children.toArray(children).filter(Boolean);
  return childrenArray.reduce((output, child, index) => {
    output.push(child);
    if (index < childrenArray.length - 1) {
      output.push(React.cloneElement(separator, { key: `separator-${index}` }));
    }
    return output;
  }, []);
}

const Stack = React.forwardRef(function Stack(props, ref) {
  const {
    children,
    className,
    direction = 'column',
    divider,
    spacing = 0,
    style,
    ...other
  } = props;

  const gap = typeof spacing === 'number' ? `${spacing * 8}px` : spacing;

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: 'flex', flexDirection: direction, gap, ...style }}
      {...other}
    >
      {divider ? joinChildren(children, divider) : children}
    </div>
  );
});

export default Stack;
```

**73줄 → 38줄 (−48%)**
(실제 제거되는 로직: `@mui/system/createStack` 239줄 포함 시 −85% 이상)

---

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `createStack` factory | 직접 구현으로 대체 |
| `@mui/system` 의존 전체 | styled, 브레이크포인트, 테마 시스템 제거 |
| `handleBreakpoints`, `resolveBreakpointValues` | 반응형 props (배열/객체 형식) 제거 |
| `createUnarySpacing` | `spacing * 8` 직접 계산 |
| `useFlexGap` prop | gap만 사용 (margin fallback 제거) |
| `component` prop | `<div>` 고정 |
| `useDefaultProps` | 기본값 직접 처리 |
| `PropTypes` | 런타임 타입 검사 제거 |
| `styled()` | inline style로 대체 |
| `sx` prop | 제거 |
| `composeClasses`, `useUtilityClasses` | CSS 클래스 시스템 제거 |
| `deepmerge`, `mergeBreakpointsInOrder` | 스타일 병합 유틸 |

---

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `joinChildren` 함수 | 핵심 학습 포인트 (divider 삽입 패턴) |
| `direction` prop | flexDirection 제어 |
| `spacing` prop | gap 크기 제어 |
| `divider` prop | children 사이 구분선 |

---

## 핵심 학습 포인트

### 1. joinChildren — children 사이에 separator 삽입

```js
function joinChildren(children, separator) {
  const childrenArray = React.Children.toArray(children).filter(Boolean);
  return childrenArray.reduce((output, child, index) => {
    output.push(child);
    if (index < childrenArray.length - 1) {
      output.push(React.cloneElement(separator, { key: `separator-${index}` }));
    }
    return output;
  }, []);
}
```

**예시**: `[A, B, C]` + separator → `[A, sep-0, B, sep-1, C]`

| 단계 | 설명 |
|------|------|
| `React.Children.toArray()` | children을 flat 배열로 변환 (Fragment 지원, key 안정화) |
| `.filter(Boolean)` | null, undefined, false 자식 제거 |
| `reduce` | 각 자식 사이에 separator 삽입 |
| `React.cloneElement(separator, { key })` | separator에 고유 key 주입 (React key 경고 방지) |
| `index < length - 1` | 마지막 요소 뒤에는 separator 없음 |

### 2. spacing → gap 변환

```js
const gap = typeof spacing === 'number' ? `${spacing * 8}px` : spacing;
```

| `spacing` 타입 | 예시 | 변환 결과 |
|---------------|------|----------|
| 숫자 | `spacing={2}` | `gap: '16px'` |
| 숫자 0 | `spacing={0}` | `gap: '0px'` |
| 문자열 | `spacing="1rem"` | `gap: '1rem'` |

**왜 8을 곱하는가?** MUI 기본 spacing 단위 = 8px. `theme.spacing(1) === 8px`.

### 3. createStack factory 패턴 — 왜 존재하는가

원본에서 Stack 로직은 `@mui/system/createStack`에 있고 Material-UI는 factory를 호출:

```js
// Stack.js (Material-UI)
const Stack = createStack({
  createStyledComponent: styled('div', ...),
  useThemeProps: (inProps) => useDefaultProps(...),
});
```

**이유**: MUI System(`@mui/system/Stack`)과 MUI Material(`@mui/material/Stack`)이 같은 Stack 로직을 공유. factory에 styled 컴포넌트와 테마 훅만 다르게 주입하여 재사용.

단순화에서는 Material-UI 전용이므로 factory 불필요 → 직접 구현.

### 4. useFlexGap 제거 — gap만 사용

원본의 두 가지 spacing 구현:

```js
// useFlexGap={true}: CSS gap (간단)
{ gap: '16px' }

// useFlexGap={false}: margin (기본, 구형 브라우저 호환)
{ '& > :not(style) ~ :not(style)': { marginTop: '16px' } }
```

단순화에서는 gap만 사용:
- 현대 브라우저는 모두 flex gap 지원 (2020년 이후)
- margin 방식은 `:not(style)` CSS 선택자 + styled 컴포넌트 필요

### 5. React.Children.toArray — children 정규화

```js
// 조건부 렌더링 시 null이 포함될 수 있음
<Stack divider={<Divider />}>
  {conditionA && <Item />}
  {conditionB && <Item />}
  <Item />
</Stack>
```

`conditionA`가 false이면 `children = [false, <Item />, <Item />]`.
`filter(Boolean)` 없이 reduce하면 `false` 자리에도 separator가 삽입됨.

```
filter(Boolean) 전: [false, <Item />, <Item />]
                     → [false, sep-0, <Item />, sep-1, <Item />]  // 잘못됨

filter(Boolean) 후: [<Item />, <Item />]
                     → [<Item />, sep-0, <Item />]  // 올바름
```
