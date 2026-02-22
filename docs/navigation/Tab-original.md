# Tab (Original)

## 핵심 역할

탭 네비게이션의 개별 탭 버튼 컴포넌트. 단독으로는 역할이 제한적이며, 부모 `Tabs`가
`cloneElement`로 `selected`, `indicator`, `textColor`, `fullWidth`, `selectionFollowsFocus`를 주입한다.
`iconPosition`, `icon`, `label`, `textColor`, `wrapped`, `fullWidth` prop으로 시각적 변형을 제공한다.

## 복잡도 요소

### 1. Tabs 부모가 주입하는 내부 API props

```js
const Tab = React.forwardRef(function Tab(inProps, ref) {
  const {
    // ...
    // eslint-disable-next-line react/prop-types  ← PropTypes에 없는 내부 props
    fullWidth,
    // eslint-disable-next-line react/prop-types
    indicator,
    // eslint-disable-next-line react/prop-types
    selected,
    // eslint-disable-next-line react/prop-types
    selectionFollowsFocus,
    // eslint-disable-next-line react/prop-types
    textColor = 'inherit',
  } = props;
```

이 props들은 공개 API가 아니라 Tabs 부모가 내부적으로 주입하는 값.
PropTypes에 없으나 실제로는 항상 존재 (Tabs가 cloneElement로 전달).

### 2. TabRoot styled(ButtonBase) + memoTheme + 다중 variant

```js
const TabRoot = styled(ButtonBase, ...)(
  memoTheme(({ theme }) => ({
    ...theme.typography.button,  // 전체 타이포그래피 스타일 스프레드
    maxWidth: 360, minWidth: 90,
    position: 'relative', minHeight: 48,
    flexShrink: 0,
    padding: '12px 16px',
    overflow: 'hidden', whiteSpace: 'normal',
    textAlign: 'center', lineHeight: 1.25,
    variants: [
      // icon+label 동시: flexDirection(top/bottom=column, start/end=row)
      { props: ({ ownerState }) => ownerState.label && (iconPosition === 'top' || 'bottom'), style: { flexDirection: 'column' } },
      { props: ({ ownerState }) => ownerState.label && iconPosition !== 'top' && !== 'bottom', style: { flexDirection: 'row' } },
      // icon+label 동시: minHeight 72, padding 축소
      { props: ({ ownerState }) => ownerState.icon && ownerState.label, style: { minHeight: 72, paddingTop: 9, paddingBottom: 9 } },
      // iconPosition별 icon 마진
      { props: (ownerState, { iconPosition }) => ownerState.icon && ownerState.label && iconPosition === 'top',
        style: { [`& > .${tabClasses.icon}`]: { marginBottom: 6 } } },
      { props: ...'bottom', style: { [`& > .${tabClasses.icon}`]: { marginTop: 6 } } },
      { props: ...'start',  style: { [`& > .${tabClasses.icon}`]: { marginRight: theme.spacing(1) } } },
      { props: ...'end',    style: { [`& > .${tabClasses.icon}`]: { marginLeft: theme.spacing(1) } } },
      // textColor variants
      { props: { textColor: 'inherit' }, style: { color: 'inherit', opacity: 0.6, '&.selected': { opacity: 1 }, '&.disabled': { opacity: disabledOpacity } } },
      { props: { textColor: 'primary' }, style: { color: text.secondary, '&.selected': { color: primary.main }, '&.disabled': { color: text.disabled } } },
      { props: { textColor: 'secondary' }, style: { color: text.secondary, '&.selected': { color: secondary.main }, '&.disabled': { color: text.disabled } } },
      // fullWidth
      { props: ({ ownerState }) => ownerState.fullWidth, style: { flexShrink: 1, flexGrow: 1, flexBasis: 0, maxWidth: 'none' } },
      // wrapped
      { props: ({ ownerState }) => ownerState.wrapped, style: { fontSize: theme.typography.pxToRem(12) } },
    ],
  })),
);
```

ownerState 기반 variant 함수가 8개 이상. theme.spacing(1), pxToRem 등 테마 유틸 사용.

### 3. icon에 className 주입 (cloneElement)

```js
const icon =
  iconProp && label && React.isValidElement(iconProp)
    ? React.cloneElement(iconProp, {
        className: clsx(classes.icon, iconProp.props.className),
      })
    : iconProp;
```

icon에 `MuiTab-icon` 클래스를 주입해서 CSS 선택자로 마진 적용:
```css
& > .MuiTab-icon { marginBottom: 6px }  /* iconPosition=top */
```

클래스 시스템과 CSS 선택자가 없으면 이 마진을 적용할 수 없음.

### 4. handleClick — selected 아닐 때만 onChange 호출

```js
const handleClick = (event) => {
  if (!selected && onChange) {
    onChange(event, value);  // 이미 선택된 탭 클릭 시 onChange 미호출
  }
  if (onClick) onClick(event);
};
```

이미 선택된 탭을 클릭해도 onChange가 호출되지 않음. 탭의 특성상 이미 활성화된 탭 재선택은 무의미.

### 5. selectionFollowsFocus — 키보드 접근성

```js
const handleFocus = (event) => {
  if (selectionFollowsFocus && !selected && onChange) {
    onChange(event, value);  // 포커스만으로 탭 선택
  }
  if (onFocus) onFocus(event);
};
```

ARIA 탭 패턴에서 키보드로 탭 간 이동 시 포커스와 함께 자동 선택.
`selectionFollowsFocus`는 Tabs 부모에서 주입.

### 6. indicator prop

```jsx
<TabRoot ...>
  {icon / label}
  {indicator}  {/* Tabs 부모가 주입하는 선택 표시선 (animated underline) */}
</TabRoot>
```

`indicator`는 Tabs가 `cloneElement`로 주입하는 선택 표시선 요소.
탭 하단의 슬라이딩 애니메이션 밑줄이 이 prop으로 전달됨.
