# Stack (Original)

## 역할

자식 컴포넌트들을 수직 또는 수평 방향으로 쌓는 flex 레이아웃 컴포넌트.

---

## 구조

```
Stack.js (73줄, Material-UI 레이어)
  └─ createStack() ──► @mui/system/Stack/createStack.tsx (239줄)
       ├─ useThemeProps / extendSxProp         ← 테마 기본값, sx prop 처리
       ├─ composeClasses / useUtilityClasses   ← CSS 클래스 시스템
       ├─ handleBreakpoints                    ← xs/sm/md/lg/xl 반응형 처리
       ├─ resolveBreakpointValues              ← 배열/객체 → 브레이크포인트 맵
       ├─ createUnarySpacing                   ← spacing 숫자 → px 변환
       ├─ useFlexGap 분기                      ← gap vs margin 방식 선택
       ├─ joinChildren                         ← divider 삽입
       └─ deepmerge / mergeBreakpointsInOrder  ← 스타일 병합
```

---

## 주요 props

| prop | 역할 |
|------|------|
| `direction` | flex 방향 (`'column'`/`'row'`/`'row-reverse'`/`'column-reverse'`) |
| `spacing` | 자식 간격 (숫자: `×8px`, 문자열: 직접 사용, 반응형 가능) |
| `divider` | 자식 사이에 삽입할 구분 요소 |
| `useFlexGap` | `true`: CSS gap, `false`: margin 방식 (기본 false) |
| `component` | 루트 요소 타입 변경 |

---

## 복잡도 원인

### 1. createStack factory 패턴

```js
// Stack.js
const Stack = createStack({
  createStyledComponent: styled('div', { name: 'MuiStack', slot: 'Root' }),
  useThemeProps: (inProps) => useDefaultProps({ props: inProps, name: 'MuiStack' }),
});
```

MUI System과 MUI Material이 같은 Stack 로직을 재사용하기 위해 factory 패턴 사용.
실제 로직은 `@mui/system`에 있고, Material-UI는 styled 컴포넌트와 테마 설정만 주입.

### 2. 반응형 spacing/direction

```js
// 배열 형식 (브레이크포인트 순서대로)
<Stack spacing={[1, 2, 3]} direction={['column', 'row']} />

// 객체 형식 (브레이크포인트 지정)
<Stack spacing={{ xs: 1, sm: 2, md: 3 }} />
```

`resolveBreakpointValues` → `handleBreakpoints` → `mergeBreakpointsInOrder` 를 거쳐
각 브레이크포인트별 미디어 쿼리 스타일로 변환.

### 3. useFlexGap 두 가지 spacing 방식

```js
// useFlexGap={true}: CSS gap (현대적, 간단)
{ gap: '16px' }

// useFlexGap={false}: margin으로 구현 (하위 호환성, 기본값)
{
  '& > :not(style):not(style)': { margin: 0 },
  '& > :not(style) ~ :not(style)': { marginTop: '16px' },  // direction='column'
}
```

CSS `gap`은 구형 브라우저에서 지원이 불완전하여 margin 방식을 기본으로 사용.

### 4. joinChildren

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

`divider` prop이 있을 때 각 자식 사이에 구분선 요소를 삽입.

### 5. createUnarySpacing — spacing 단위 변환

```js
// MUI 기본: theme.spacing(1) = 8px
const transformer = createUnarySpacing(theme);
// spacing={2} → transformer(2) → '16px'
// spacing="1rem" → '1rem' (문자열은 그대로)
```
