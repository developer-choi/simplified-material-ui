# Switch (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';

const Switch = React.forwardRef(function Switch(props, ref) {
  const {
    checked: checkedProp,
    className,
    defaultChecked = false,
    disabled = false,
    edge = false,
    onChange,
    size = 'medium',
    style,
    ...other
  } = props;

  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isChecked = checkedProp !== undefined ? checkedProp : internalChecked;

  const handleChange = (event) => {
    if (checkedProp === undefined) setInternalChecked(event.target.checked);
    onChange?.(event);
  };

  const isSmall = size === 'small';
  const thumbSize = isSmall ? 16 : 20;
  const switchPadding = isSmall ? 4 : 9;

  const thumbColor = disabled ? '#f5f5f5' : isChecked ? '#1976d2' : '#ffffff';
  const trackColor = isChecked && !disabled ? '#1976d2' : '#000000';
  const trackOpacity = disabled ? 0.12 : isChecked ? 0.5 : 0.38;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        width: isSmall ? 40 : 58,
        height: isSmall ? 24 : 38,
        overflow: 'hidden',
        padding: isSmall ? 7 : 12,
        boxSizing: 'border-box',
        position: 'relative',
        flexShrink: 0,
        zIndex: 0,
        verticalAlign: 'middle',
        ...(edge === 'start' && { marginLeft: -8 }),
        ...(edge === 'end' && { marginRight: -8 }),
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          color: thumbColor,
          padding: switchPadding,
          display: 'inline-flex',
          transform: isChecked ? `translateX(${isSmall ? 16 : 20}px)` : 'none',
          transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <input
          type="checkbox"
          role="switch"
          ref={ref}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          style={{
            cursor: 'inherit',
            position: 'absolute',
            opacity: 0,
            width: '300%',
            height: '100%',
            top: 0,
            left: '-100%',
            margin: 0,
            padding: 0,
          }}
          {...other}
        />
        <span
          style={{
            width: thumbSize,
            height: thumbSize,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
          }}
        />
      </span>
      <span
        style={{
          height: '100%',
          width: '100%',
          borderRadius: isSmall ? 5 : 7,
          zIndex: -1,
          backgroundColor: trackColor,
          opacity: trackOpacity,
          transition: 'opacity 150ms, background-color 150ms',
        }}
      />
    </span>
  );
});

export default Switch;
```

**443줄 → 110줄 (−75%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `SwitchRoot` styled('span') | `<span>` + inline style로 대체 |
| `SwitchSwitchBase` styled(SwitchBase) | `<input type="checkbox">` 직접 사용 |
| `SwitchTrack` styled('span') | inline style로 대체 |
| `SwitchThumb` styled('span') | inline style로 대체 |
| `SwitchBase` import | input으로 교체 |
| `styled`, `memoTheme`, `createSimplePaletteValueFilter` | styled 제거 |
| `useSlot` × 3 (root, thumb, track) | Slot 시스템 제거 |
| `slots`, `slotProps` props | Slot 시스템 제거 |
| `color` prop (테마 팔레트) | primary(#1976d2) 하드코딩으로 단순화 |
| ripple (SwitchBase 포함) | ButtonBase 전용 |
| `useUtilityClasses`, `composeClasses`, `getSwitchUtilityClass` | 클래스 시스템 제거 |
| `useDefaultProps`, `PropTypes`, `ownerState` | 테마/타입 시스템 제거 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `checked` / `defaultChecked` / `onChange` | 핵심 상태 제어 |
| `disabled` | 비활성화 |
| `size` prop ('medium' \| 'small') | 크기 변형 — 하드코딩 값으로 분기 |
| `edge` prop | 음수 마진 정렬 |
| controlled/uncontrolled 패턴 | checked 추적 → 시각적 상태 반영 |
| `role="switch"` | 접근성 |

## 핵심 학습 포인트

### 1. CSS 클래스 기반 상태 → React state 기반 상태

```js
// 원본: CSS 클래스로 checked 상태 표현
// SwitchBase가 checked이면 `.Mui-checked` 클래스 추가
// styled에서 그 클래스를 선택자로 참조:
[`&.${switchClasses.checked}`]: { transform: 'translateX(20px)' }
[`&.${switchClasses.checked} + .${switchClasses.track}`]: { opacity: 0.5 }

// 간소화: React state로 직접 읽어 인라인 스타일 결정
const isChecked = checkedProp !== undefined ? checkedProp : internalChecked;
transform: isChecked ? `translateX(20px)` : 'none'
opacity: isChecked ? 0.5 : 0.38
```

CSS 클래스를 통한 간접 상태 표현 → React state를 인라인 스타일에 직접 연결.

### 2. controlled/uncontrolled 패턴

```js
const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
const isChecked = checkedProp !== undefined ? checkedProp : internalChecked;

const handleChange = (event) => {
  if (checkedProp === undefined) setInternalChecked(event.target.checked);
  onChange?.(event);
};
```

- `checked` prop이 있으면 → controlled (외부 상태 사용)
- `checked` prop이 없으면 → uncontrolled (내부 useState 사용)
- `onChange`는 항상 호출 (외부에서 controlled로 전환 가능하도록)

### 3. 하드코딩 치수 근거

| 항목 | medium | small |
|------|--------|-------|
| root width | 58 (34 + 12×2) | 40 |
| root height | 38 (14 + 12×2) | 24 |
| root padding | 12 | 7 |
| thumb size | 20×20 | 16×16 |
| track borderRadius | 7 (14÷2) | 5 (10÷2) |
| checked translateX | 20px | 16px |
| switchBase padding | 9 | 4 |

root padding이 switchBase padding과 다름. root는 thumb가 트랙 경계를 벗어나지 않도록
overflow:hidden과 함께 클리핑 영역을 정의.

### 4. input이 thumb보다 3배 넓은 이유

```js
// input style
width: '300%',    // thumb span 너비의 300% → 클릭 영역 확장
left: '-100%',    // 왼쪽으로 100% 이동 → thumb 중앙 기준으로 좌우 대칭
opacity: 0,       // 화면에서 숨김 (클릭만 받음)
```

`<input type="checkbox">`가 실제 thumb 영역보다 왼쪽/오른쪽으로 확장되어
스와이프 제스처나 넓은 클릭 영역을 지원.

### 5. thumb 색 = CSS color 속성 상속

```js
// switchBase (thumb 컨테이너)의 color가 thumb에 상속됨
color: thumbColor,    // switchBase에 설정

// thumb 자체
backgroundColor: 'currentColor'  // → thumbColor 상속
```

`currentColor`를 통해 부모의 `color` CSS 속성을 `backgroundColor`로 사용.
상태(checked, disabled)에 따라 부모 color만 바꾸면 thumb 색이 자동으로 변경.

### 6. 시각 상태 값

| 상태 | thumb 색 | track 색 | track opacity |
|------|---------|---------|--------------|
| 기본 (unchecked) | `#ffffff` | `#000000` | 0.38 |
| checked | `#1976d2` | `#1976d2` | 0.5 |
| disabled | `#f5f5f5` | `#000000` | 0.12 |
