# ToggleButtonGroup (Original)

## 핵심 역할

ToggleButton들을 감싸는 그룹 컨테이너. `exclusive`로 단일/다중 선택 모드를 결정하고,
`ToggleButtonGroupContext`로 자식 ToggleButton에 `color`, `size`, `fullWidth`, `disabled`,
`onChange`(handle), `value`를 주입한다.
`ToggleButtonGroupButtonContext`로 각 자식에 position className을 주입해 border-radius를 CSS로 조정한다.

## 복잡도 요소

### 1. ToggleButtonGroupRoot styled('div') — orientation, fullWidth, position 클래스 선택자 중첩

```js
const ToggleButtonGroupRoot = styled('div', ...)(
  memoTheme(({ theme }) => ({
    display: 'inline-flex',
    borderRadius: theme.shape.borderRadius,
    variants: [
      {
        props: { orientation: 'vertical' },
        style: {
          flexDirection: 'column',
          // position 클래스로 border-radius 조정
          [`& .MuiToggleButtonGroup-firstButton, & .MuiToggleButtonGroup-middleButton`]: {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
          [`& .MuiToggleButtonGroup-lastButton, & .MuiToggleButtonGroup-middleButton`]: {
            marginTop: -1,
            borderTop: '1px solid transparent',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          },
          // 인접 selected 버튼 사이 border 제거
          [`& .grouped.selected + .grouped.selected`]: {
            borderTop: 0,
            marginTop: 0,
          },
        },
      },
      {
        props: { orientation: 'horizontal' },
        style: {
          [`& .MuiToggleButtonGroup-firstButton, & .MuiToggleButtonGroup-middleButton`]: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
          [`& .MuiToggleButtonGroup-lastButton, & .MuiToggleButtonGroup-middleButton`]: {
            marginLeft: -1,
            borderLeft: '1px solid transparent',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          },
          [`& .grouped.selected + .grouped.selected`]: {
            borderLeft: 0,
            marginLeft: 0,
          },
        },
      },
    ],
  })),
);
```

CSS 클래스 선택자 중첩으로 firstButton/lastButton/middleButton의 border-radius와
인접 selected 버튼 사이의 border를 처리. 자바스크립트 없이 순수 CSS로 처리됨.

### 2. ToggleButtonGroupButtonContext — position className 주입

```js
const getButtonPositionClassName = (index) => {
  const isFirstButton = index === 0;
  const isLastButton = index === childrenCount - 1;

  if (isFirstButton && isLastButton) return '';     // 단독 버튼
  if (isFirstButton) return classes.firstButton;    // 'MuiToggleButtonGroup-firstButton'
  if (isLastButton) return classes.lastButton;      // 'MuiToggleButtonGroup-lastButton'
  return classes.middleButton;                      // 'MuiToggleButtonGroup-middleButton'
};

const validChildren = getValidReactChildren(children);

return (
  <ToggleButtonGroupContext.Provider value={context}>
    {validChildren.map((child, index) => (
      <ToggleButtonGroupButtonContext.Provider key={index} value={getButtonPositionClassName(index)}>
        {child}
      </ToggleButtonGroupButtonContext.Provider>
    ))}
  </ToggleButtonGroupContext.Provider>
);
```

각 자식 버튼에 개별 Context.Provider를 감싸서 위치 정보(index)를 className으로 전달.
ToggleButton이 이 className을 읽어서 자신의 className에 추가.

### 3. getValidReactChildren — Fragment 필터링

```js
import { isFragment } from 'react-is';
import getValidReactChildren from '@mui/utils/getValidReactChildren';

const validChildren = getValidReactChildren(children);
const childrenCount = validChildren.length;  // position 계산에 필요

if (process.env.NODE_ENV !== 'production') {
  if (isFragment(child)) {
    console.error('MUI: ToggleButtonGroup은 Fragment를 자식으로 받지 않습니다.');
  }
}
```

Fragment를 제외한 유효한 React 자식만 필터링. `childrenCount`로 첫/마지막 버튼을 판별.

### 4. handleChange / handleExclusiveChange — multi vs exclusive 선택 로직

```js
// multi-select (exclusive=false)
const handleChange = React.useCallback((event, buttonValue) => {
  if (!onChange) return;
  const index = value && value.indexOf(buttonValue);
  let newValue;
  if (value && index >= 0) {
    newValue = value.slice();
    newValue.splice(index, 1);  // 이미 선택된 값 → 제거
  } else {
    newValue = value ? value.concat(buttonValue) : [buttonValue];  // 미선택 → 추가
  }
  onChange(event, newValue);
}, [onChange, value]);

// exclusive (단일 선택)
const handleExclusiveChange = React.useCallback((event, buttonValue) => {
  if (!onChange) return;
  onChange(event, value === buttonValue ? null : buttonValue);  // 같으면 null, 다르면 교체
}, [onChange, value]);
```

`exclusive=false` 모드는 배열 값 toggle. `exclusive=true` 모드는 단일 값 toggle(null 가능).

### 5. ToggleButtonGroupContext — 자식에게 주입되는 값

```js
const context = React.useMemo(() => ({
  className: classes.grouped,  // ToggleButton이 자신 className에 추가
  onChange: exclusive ? handleExclusiveChange : handleChange,
  value,
  size,
  fullWidth,
  color,
  disabled,
}), [...]);
```

`className: classes.grouped`가 포함되어 있어 각 ToggleButton이 grouped 클래스를 자동으로 가짐.
이 클래스가 ToggleButtonGroupRoot의 CSS 선택자에서 사용됨.
