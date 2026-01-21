# ButtonBase 컴포넌트

> Material-UI의 ButtonBase 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

ButtonBase는 **클릭 가능한 요소의 공통 동작(Ripple, 포커스, 키보드 접근성)을 제공하는 기반 컴포넌트**입니다.

### 핵심 기능
1. **Ripple 효과** - 클릭/터치 시 물결 애니메이션으로 시각적 피드백 제공
2. **포커스 관리** - 키보드 포커스(focusVisible) 상태 감지 및 관리
3. **키보드 접근성** - 비네이티브 요소에서 Enter/Space 키로 클릭 에뮬레이션
4. **다형성** - component prop으로 button, a, div 등 다양한 요소로 렌더링
5. **스타일 리셋** - 브라우저 기본 버튼 스타일 제거

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/ButtonBase/ButtonBase.js (506줄)
ButtonBase (React.forwardRef)
  └─> ButtonBaseRoot (styled button)
       ├─> children (버튼 내용)
       └─> TouchRipple (enableTouchRipple일 때만)
            └─> Ripple[] (다중 ripple 요소)
```

### 2. 하위 컴포넌트가 담당하는 기능

- **TouchRipple** - 클릭/터치 시 물결 애니메이션 렌더링
- **Ripple** - 개별 물결 요소 (TransitionGroup으로 관리)

### 3. Ripple 시스템

```javascript
// useLazyRipple: Ripple 지연 초기화로 성능 최적화
const ripple = useLazyRipple();
const handleRippleRef = useForkRef(ripple.ref, touchRippleRef);

// enableTouchRipple: Ripple 렌더링 조건
const enableTouchRipple = ripple.shouldMount && !disableRipple && !disabled;

// useRippleHandler: 이벤트에 ripple 연결
function useRippleHandler(ripple, rippleAction, eventCallback, skipRippleAction = false) {
  return useEventCallback((event) => {
    if (eventCallback) eventCallback(event);
    if (!skipRippleAction) ripple[rippleAction](event);
    return true;
  });
}

// 6개 이벤트에 ripple 연결
const handleMouseDown = useRippleHandler(ripple, 'start', onMouseDown, disableTouchRipple);
const handleMouseUp = useRippleHandler(ripple, 'stop', onMouseUp, disableTouchRipple);
const handleMouseLeave = useRippleHandler(ripple, 'stop', onMouseLeave, disableTouchRipple);
const handleTouchStart = useRippleHandler(ripple, 'start', onTouchStart, disableTouchRipple);
const handleTouchEnd = useRippleHandler(ripple, 'stop', onTouchEnd, disableTouchRipple);
const handleTouchMove = useRippleHandler(ripple, 'stop', onTouchMove, disableTouchRipple);
```

### 4. 포커스 관리

```javascript
const [focusVisible, setFocusVisible] = React.useState(false);

// 키보드 포커스 감지 (마우스 클릭과 구분)
const handleFocus = useEventCallback((event) => {
  if (isFocusVisible(event.target)) {
    setFocusVisible(true);
    if (onFocusVisible) onFocusVisible(event);
  }
  if (onFocus) onFocus(event);
});

// blur 시 focusVisible 해제
const handleBlur = useRippleHandler(ripple, 'stop', (event) => {
  if (!isFocusVisible(event.target)) {
    setFocusVisible(false);
  }
  if (onBlur) onBlur(event);
}, false);

// focusRipple: 포커스 시 ripple 펄세이션
React.useEffect(() => {
  if (focusVisible && focusRipple && !disableRipple) {
    ripple.pulsate();
  }
}, [disableRipple, focusRipple, focusVisible, ripple]);
```

### 5. 키보드 접근성

```javascript
// 비네이티브 버튼 판별
const isNonNativeButton = () => {
  const button = buttonRef.current;
  return component && component !== 'button' && !(button.tagName === 'A' && button.href);
};

// handleKeyDown: Enter 키로 클릭
const handleKeyDown = useEventCallback((event) => {
  // focusRipple: Space 키 시 ripple 시작
  if (focusRipple && !event.repeat && focusVisible && event.key === ' ') {
    ripple.stop(event, () => ripple.start(event));
  }

  // 비네이티브: Space 기본 동작 방지 (스크롤 방지)
  if (event.target === event.currentTarget && isNonNativeButton() && event.key === ' ') {
    event.preventDefault();
  }

  // 비네이티브: Enter 키로 onClick 호출
  if (event.target === event.currentTarget && isNonNativeButton() && event.key === 'Enter' && !disabled) {
    event.preventDefault();
    if (onClick) onClick(event);
  }
});

// handleKeyUp: Space 키로 클릭
const handleKeyUp = useEventCallback((event) => {
  // focusRipple: Space 키 시 ripple 펄세이션
  if (focusRipple && event.key === ' ' && focusVisible && !event.defaultPrevented) {
    ripple.stop(event, () => ripple.pulsate(event));
  }

  // 비네이티브: Space 키로 onClick 호출
  if (onClick && event.target === event.currentTarget && isNonNativeButton() && event.key === ' ' && !event.defaultPrevented) {
    onClick(event);
  }
});
```

### 6. 다형성 (component prop)

```javascript
let ComponentProp = component;

// href/to가 있으면 LinkComponent로 변환
if (ComponentProp === 'button' && (other.href || other.to)) {
  ComponentProp = LinkComponent;
}

// button vs 다른 요소 속성 분기
const buttonProps = {};
if (ComponentProp === 'button') {
  buttonProps.type = type === undefined ? 'button' : type;
  buttonProps.disabled = disabled;
} else {
  if (!other.href && !other.to) {
    buttonProps.role = 'button';  // ARIA role
  }
  if (disabled) {
    buttonProps['aria-disabled'] = disabled;
  }
}
```

### 7. 스타일 리셋 (ButtonBaseRoot)

```javascript
export const ButtonBaseRoot = styled('button', {
  name: 'MuiButtonBase',
  slot: 'Root',
})({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  boxSizing: 'border-box',
  WebkitTapHighlightColor: 'transparent',  // 모바일 탭 하이라이트 제거
  backgroundColor: 'transparent',
  outline: 0,
  border: 0,
  margin: 0,
  borderRadius: 0,
  padding: 0,
  cursor: 'pointer',
  userSelect: 'none',
  verticalAlign: 'middle',
  MozAppearance: 'none',
  WebkitAppearance: 'none',
  textDecoration: 'none',
  color: 'inherit',
  '&::-moz-focus-inner': {
    borderStyle: 'none',  // Firefox 점선 제거
  },
  [`&.${buttonBaseClasses.disabled}`]: {
    pointerEvents: 'none',
    cursor: 'default',
  },
});
```

### 8. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `action` | Ref | - | imperative handle (focusVisible 강제 호출) |
| `centerRipple` | boolean | false | Ripple 중앙 시작 |
| `children` | ReactNode | - | 버튼 내용 |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `component` | elementType | 'button' | 렌더링할 요소 |
| `disabled` | boolean | false | 비활성화 |
| `disableRipple` | boolean | false | Ripple 완전 비활성화 |
| `disableTouchRipple` | boolean | false | 터치 Ripple만 비활성화 |
| `focusRipple` | boolean | false | 포커스 시 Ripple 펄세이션 |
| `focusVisibleClassName` | string | - | 키보드 포커스 시 클래스 |
| `LinkComponent` | elementType | 'a' | href 시 사용할 링크 컴포넌트 |
| `onFocusVisible` | function | - | 키보드 포커스 시 콜백 |
| `tabIndex` | number | 0 | 탭 순서 |
| `TouchRippleProps` | object | - | TouchRipple에 전달할 props |
| `touchRippleRef` | Ref | - | TouchRipple 인스턴스 ref |
| `type` | string | 'button' | button 요소의 type 속성 |

### 9. action prop (imperative handle)

```javascript
React.useImperativeHandle(
  action,
  () => ({
    focusVisible: () => {
      setFocusVisible(true);
      buttonRef.current.focus();
    },
  }),
  [],
);
```

---

## 설계 패턴

1. **Composition 패턴**
   - ButtonBase는 TouchRipple을 내부에 조합
   - Button, IconButton, Fab 등이 ButtonBase를 조합

2. **Lazy Loading 패턴**
   - useLazyRipple로 Ripple 컴포넌트 지연 렌더링
   - 첫 상호작용 시에만 TouchRipple 마운트

3. **다형성 (Polymorphism)**
   - component prop으로 렌더링 요소 변경
   - LinkComponent로 라우터 통합

4. **Controlled/Uncontrolled 혼합**
   - focusVisible 상태 내부 관리
   - action ref로 외부 제어 가능

---

## 복잡도의 이유

ButtonBase는 **506줄**이며, 복잡한 이유는:

1. **Ripple 시스템** (약 100줄)
   - 5개의 Ripple 관련 props
   - useLazyRipple 훅
   - useRippleHandler 함수
   - 6개 이벤트 핸들러

2. **키보드 접근성** (약 60줄)
   - 비네이티브 요소 감지
   - Enter/Space 키 처리
   - focusRipple 통합

3. **다형성** (약 40줄)
   - component prop 처리
   - LinkComponent 자동 변환
   - button vs 다른 요소 속성 분기

4. **Theme 시스템** (약 50줄)
   - useDefaultProps
   - useUtilityClasses
   - styled component

5. **PropTypes** (약 170줄)
   - 런타임 타입 검증

---

## 의존성 트리

```
ButtonBase.js
├── React / PropTypes / clsx
├── @mui/utils
│   ├── refType
│   ├── elementTypeAcceptingRef
│   ├── composeClasses
│   └── isFocusVisible
├── ../zero-styled (styled)
├── ../DefaultPropsProvider (useDefaultProps)
├── ../utils
│   ├── useForkRef
│   └── useEventCallback
├── ../useLazyRipple
│   └── TouchRipple.js
│        ├── Ripple.js
│        └── react-transition-group
└── ./buttonBaseClasses
```
