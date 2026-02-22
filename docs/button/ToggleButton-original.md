# ToggleButton (Original)

## 핵심 역할

선택/해제 토글 버튼 컴포넌트. 단독으로 사용하거나 `ToggleButtonGroup` 내에서 그룹으로 사용한다.
그룹 내에서는 Context를 통해 `color`, `size`, `fullWidth`, `disabled`, `onChange`, `value`를 수신하여
`selected` 상태와 onChange 핸들러를 자동으로 결정한다.

## 복잡도 요소

### 1. resolveProps — 3단계 props 우선순위

```js
// props 우선순위: inProps > contextProps > themeDefaultProps
const { value: contextValue, ...contextProps } = React.useContext(ToggleButtonGroupContext);
const toggleButtonGroupButtonContextPositionClassName = React.useContext(ToggleButtonGroupButtonContext);

const resolvedProps = resolveProps(
  { ...contextProps, selected: isValueSelected(inProps.value, contextValue) },
  inProps,
);
const props = useDefaultProps({ props: resolvedProps, name: 'MuiToggleButton' });
```

- `contextProps`: ToggleButtonGroup에서 내려온 color, size, fullWidth, disabled, onChange
- `inProps`: 직접 전달된 props (우선)
- `themeDefaultProps`: 테마 기본값 (최후)
- `resolveProps`: undefined가 아닌 값이 있으면 inProps가 이김

### 2. styled(ButtonBase) + memoTheme + 동적 팔레트 순회

```js
const ToggleButtonRoot = styled(ButtonBase, ...)(
  memoTheme(({ theme }) => ({
    ...theme.typography.button,  // 타이포그래피 스타일 전체
    borderRadius: theme.shape.borderRadius,
    padding: 11,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.action.active,
    variants: [
      {
        props: { color: 'standard' },
        style: {
          [`&.${toggleButtonClasses.selected}`]: {
            color: theme.palette.text.primary,
            backgroundColor: theme.alpha(theme.palette.text.primary, selectedOpacity),
          },
        },
      },
      // 팔레트 전체 동적 순회
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter())
        .map(([color]) => ({
          props: { color },
          style: {
            [`&.${toggleButtonClasses.selected}`]: {
              color: theme.palette[color].main,
              backgroundColor: theme.alpha(theme.palette[color].main, selectedOpacity),
            },
          },
        })),
    ],
  })),
);
```

`selected` 상태의 색상을 CSS 클래스(`.Mui-selected`) 선택자로 처리.
팔레트 전체 순회로 7가지 semantic 색상 자동 지원.

### 3. ToggleButtonGroupButtonContext — position className 주입

```js
const positionClassName = toggleButtonGroupButtonContextPositionClassName || '';
// 값: 'MuiToggleButtonGroup-firstButton' | 'MuiToggleButtonGroup-lastButton' | 'MuiToggleButtonGroup-middleButton' | ''

<ToggleButtonRoot
  className={clsx(contextProps.className, classes.root, className, positionClassName)}
  ...
>
```

`ToggleButtonGroup`이 position에 따라 className을 Context로 주입.
ToggleButtonGroup의 styled에서 그 클래스로 border-radius를 조정:
```js
[`& .MuiToggleButtonGroup-firstButton`]: { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
[`& .MuiToggleButtonGroup-lastButton`]: { marginLeft: -1, borderLeft: '1px solid transparent', ... }
```

### 4. handleChange — onClick + onChange 래핑

```js
const handleChange = (event) => {
  if (onClick) {
    onClick(event, value);
    if (event.defaultPrevented) return;  // onClick에서 preventDefault하면 onChange 미호출
  }
  if (onChange) onChange(event, value);
};
```

클릭 시 `value`를 함께 전달. `event.defaultPrevented`로 onChange 호출 차단 가능.
ToggleButtonGroup의 `handleChange`/`handleExclusiveChange`가 이 onChange를 받아 group value 갱신.

### 5. isValueSelected — group value에서 selected 결정

```js
// isValueSelected.js
export default function isValueSelected(value, candidate) {
  if (candidate === undefined || value === undefined) return false;
  if (Array.isArray(candidate)) return candidate.includes(value);  // multi-select
  return value === candidate;  // exclusive (single select)
}

// ToggleButton에서:
selected: isValueSelected(inProps.value, contextValue)
// contextValue = ToggleButtonGroup의 value prop (string | string[])
```

exclusive 모드(단일 선택): contextValue가 string → strict equal.
multi-select 모드: contextValue가 string[] → Array.includes.
