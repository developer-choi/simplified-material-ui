# ButtonBase 컴포넌트

> 클릭 가능한 요소의 공통 동작(Ripple, 포커스, 키보드 접근성)을 제공하는 단순화된 기반 컴포넌트

---

## 무슨 기능을 하는가?

수정된 ButtonBase는 **버튼의 동작(behavior)을 담당하는 기반 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **Ripple 효과** - 클릭/터치 시 물결 애니메이션으로 시각적 피드백 제공 (항상 활성화)
2. **포커스 관리** - 키보드 포커스(focusVisible) 상태 감지 및 관리
3. **키보드 접근성** - 비네이티브 요소(div, span 등)에서 Enter/Space 키로 클릭 에뮬레이션
4. **다형성** - component prop으로 button, a, div 등 다양한 요소로 렌더링
5. **링크 자동 변환** - href가 있으면 자동으로 LinkComponent로 변환

---

## 핵심 학습 포인트

### 1. Ripple 지연 초기화 (Lazy Loading)

```javascript
const ripple = useLazyRipple();
const enableTouchRipple = ripple.shouldMount && !disabled;

// 렌더링
{enableTouchRipple ? <TouchRipple ref={ripple.ref} /> : null}
```

**학습 가치**:
- 첫 상호작용 전까지 TouchRipple 컴포넌트를 렌더링하지 않아 초기 로드 성능 최적화
- `shouldMount`가 true가 되는 시점: 첫 마우스다운/터치 이벤트 발생 시

### 2. 키보드 포커스 감지 (Focus Visible)

```javascript
const [focusVisible, setFocusVisible] = React.useState(false);

const handleFocus = useEventCallback((event) => {
  if (isFocusVisible(event.target)) {
    setFocusVisible(true);
    if (onFocusVisible) onFocusVisible(event);
  }
  if (onFocus) onFocus(event);
});
```

**학습 가치**:
- 마우스 클릭 포커스와 키보드 포커스를 구분
- `:focus-visible` CSS 폴리필 역할
- 키보드 사용자에게만 포커스 링 표시 가능

### 3. 비네이티브 버튼 접근성

```javascript
const isNonNativeButton = () => {
  const button = buttonRef.current;
  return component && component !== 'button' && !(button.tagName === 'A' && button.href);
};

// Enter 키로 클릭
if (isNonNativeButton() && event.key === 'Enter' && !disabled) {
  event.preventDefault();
  if (onClick) onClick(event);
}

// Space 키로 클릭
if (isNonNativeButton() && event.key === ' ' && !event.defaultPrevented) {
  onClick(event);
}
```

**학습 가치**:
- `<div>`, `<span>` 등 비네이티브 요소도 버튼처럼 동작하게 함
- Enter: keyDown에서 처리 (즉시 실행)
- Space: keyUp에서 처리 (브라우저 기본 동작과 일관성)

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/ButtonBase/ButtonBase.js (230줄, 원본 506줄)
ButtonBase (React.forwardRef)
  └─> ComponentProp (button | a | 커스텀)
       ├─> children (버튼 내용)
       └─> TouchRipple (enableTouchRipple일 때만)
            └─> Ripple[] (다중 ripple 요소)
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `buttonRef` | DOM 요소 참조, isNonNativeButton 판별에 사용 |
| `focusVisible` | 키보드 포커스 상태 (마우스 포커스와 구분) |
| `ripple` | useLazyRipple 반환값, Ripple 시작/중지 제어 |
| `enableTouchRipple` | Ripple 렌더링 여부 (`shouldMount && !disabled`) |

### 3. 함수 역할

#### useRippleHandler()
- **역할**: 이벤트 핸들러에 Ripple 동작 연결
- **호출 시점**: 마우스/터치 이벤트 발생 시
- **핵심 로직**:
```javascript
function useRippleHandler(ripple, rippleAction, eventCallback) {
  return useEventCallback((event) => {
    if (eventCallback) eventCallback(event);  // 사용자 콜백 먼저 실행
    ripple[rippleAction](event);              // Ripple start/stop
    return true;
  });
}
```

#### isNonNativeButton()
- **역할**: 현재 요소가 네이티브 버튼/링크가 아닌지 판별
- **호출 시점**: 키보드 이벤트 처리 시
- **판별 기준**: `component !== 'button'` AND `!(A 태그 && href 있음)`

#### handleFocus()
- **역할**: 포커스 시 키보드 포커스 여부 판별
- **호출 시점**: focus 이벤트 발생 시
- **핵심 동작**: `isFocusVisible` 체크 후 `focusVisible` 상태 업데이트

#### handleKeyDown() / handleKeyUp()
- **역할**: 비네이티브 요소의 키보드 접근성 제공
- **호출 시점**: 키보드 입력 시
- **핵심 동작**: Enter(keyDown), Space(keyUp)에서 onClick 호출

### 4. 동작 흐름

#### Ripple 렌더링 흐름
```
첫 렌더링 → shouldMount=false → TouchRipple 미렌더링
    ↓
첫 마우스다운/터치 → shouldMount=true
    ↓
리렌더링 → TouchRipple 렌더링 → Ripple 시작
```

#### 키보드 클릭 흐름
```
KeyDown(Enter) → isNonNativeButton? → YES → preventDefault → onClick 호출
                      ↓ NO
                 네이티브 동작

KeyDown(Space) → isNonNativeButton? → YES → preventDefault (스크롤 방지)
                      ↓
KeyUp(Space) → isNonNativeButton? → YES → onClick 호출
```

### 5. 다형성 처리

```javascript
let ComponentProp = component;

// href/to가 있으면 LinkComponent로 자동 변환
if (ComponentProp === 'button' && (other.href || other.to)) {
  ComponentProp = LinkComponent;
}

// button vs 다른 요소 속성 분기
if (ComponentProp === 'button') {
  buttonProps.type = type === undefined && !hasFormAttributes ? 'button' : type;
  buttonProps.disabled = disabled;
} else {
  if (!other.href && !other.to) buttonProps.role = 'button';  // ARIA
  if (disabled) buttonProps['aria-disabled'] = disabled;
}
```

### 6. 원본과의 차이

- ❌ `centerRipple`, `disableTouchRipple`, `focusRipple` 제거 → Ripple 항상 기본 동작
- ❌ `disableRipple` 제거 → Ripple 항상 활성화
- ❌ `action` prop 제거 → 외부에서 focusVisible 강제 호출 불가
- ❌ `useDefaultProps` 제거 → 테마 기본값 미적용
- ❌ `useUtilityClasses` 제거 → 자동 클래스(MuiButtonBase-root) 미생성
- ❌ `styled` 제거 → 인라인 스타일로 대체
- ❌ `PropTypes` 제거 → 런타임 타입 검증 없음

### 7. Props (10개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 버튼 내용 |
| `className` | string | - | CSS 클래스 |
| `component` | elementType | 'button' | 렌더링할 요소 |
| `disabled` | boolean | false | 비활성화 |
| `focusVisibleClassName` | string | - | 키보드 포커스 시 클래스 |
| `LinkComponent` | elementType | 'a' | href 시 사용할 링크 컴포넌트 |
| `onClick` | function | - | 클릭 콜백 |
| `onFocusVisible` | function | - | 키보드 포커스 시 콜백 |
| `tabIndex` | number | 0 | 탭 순서 |
| `type` | string | 'button' | button 요소의 type |

---

## 커밋 히스토리로 보는 단순화 과정

ButtonBase는 **8개의 커밋**을 통해 단순화되었습니다.

### 1단계: Ripple 커스터마이징 제거
- `b6828aea` - [ButtonBase 단순화 1/8] Ripple 커스터마이징 props 제거
- centerRipple, disableTouchRipple, focusRipple, TouchRippleProps, touchRippleRef 제거
- **불필요한 이유**: Ripple의 핵심은 "클릭 피드백"이지 위치/동작 조정이 아님

### 2단계: disableRipple 제거
- `231015bd` - [ButtonBase 단순화 2/8] disableRipple prop 제거
- Ripple on/off 옵션 제거, 항상 활성화
- **불필요한 이유**: Material Design 핵심 피드백 요소, 항상 있어야 ButtonBase 역할 이해 가능

### 3단계: action prop 제거
- `3d229176` - [ButtonBase 단순화 3/8] action prop 제거
- useImperativeHandle로 외부 focusVisible 제어 기능 제거
- **불필요한 이유**: useImperativeHandle은 React 고급 주제, 대부분 사용하지 않는 기능

### 4단계: useDefaultProps 제거
- `ad2e7f5b` - [ButtonBase 단순화 4/8] useDefaultProps 제거
- 테마 기반 기본값 시스템 제거
- **불필요한 이유**: 함수 파라미터 기본값이 더 직관적

### 5단계: useUtilityClasses 제거
- `47abf09f` - [ButtonBase 단순화 5/8] useUtilityClasses 제거
- composeClasses, getButtonBaseUtilityClass 제거
- **불필요한 이유**: 자동 생성 클래스는 테마 커스터마이징용, 수동 클래스가 더 명확

### 6단계: styled 시스템 제거
- `61b6ac5f` - [ButtonBase 단순화 6/8] styled 시스템 제거
- styled component를 인라인 스타일(buttonBaseStyles)로 전환
- **불필요한 이유**: styled API는 별도 학습 주제, 인라인 스타일이 어떤 스타일인지 바로 보임

### 7단계: 이벤트 핸들러 정리
- `fcb79a24` - [ButtonBase 단순화 7/8] 이벤트 핸들러 정리
- focusRipple 관련 불필요 로직 제거, handleMouseLeave 단순화
- **불필요한 이유**: Ripple 커스터마이징 제거 후 남은 잔여 코드

### 8단계: PropTypes 제거
- `31e8fca4` - [ButtonBase 단순화 8/8] PropTypes 제거
- PropTypes import 및 정의 전체 제거 (약 110줄)
- **불필요한 이유**: 런타임 타입 검증이지 컴포넌트 로직이 아님, TypeScript가 대체

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 506줄 | 230줄 (55% 감소) |
| **Props 개수** | 20개 | 10개 |
| **Ripple 커스터마이징** | 5개 props | ❌ 항상 기본 동작 |
| **disableRipple** | ✅ | ❌ 항상 활성화 |
| **action (imperative)** | ✅ | ❌ |
| **Theme 통합** | ✅ useDefaultProps | ❌ 직접 기본값 |
| **자동 클래스** | ✅ MuiButtonBase-* | ❌ 수동 클래스만 |
| **스타일 시스템** | styled | 인라인 스타일 |
| **PropTypes** | ✅ 110줄 | ❌ |

---

## 학습 후 다음 단계

ButtonBase를 이해했다면:

1. **TouchRipple/Ripple** - Ripple 애니메이션이 실제로 어떻게 구현되는지
2. **Button** - ButtonBase를 확장해서 외관(variant, color, size)을 추가하는 방법
3. **IconButton, Fab** - 같은 ButtonBase 기반이지만 다른 외관

**예시: 기본 사용**
```javascript
<ButtonBase onClick={() => console.log('clicked')}>
  Click me
</ButtonBase>
```

**예시: 다형성 활용**
```javascript
// div로 렌더링하지만 버튼처럼 동작
<ButtonBase component="div" onClick={handleClick}>
  Div Button
</ButtonBase>

// 링크로 렌더링
<ButtonBase href="https://example.com">
  Link Button
</ButtonBase>
```

**예시: 커스텀 버튼**
```javascript
// ButtonBase를 기반으로 커스텀 버튼 구현
function MyButton({ children, ...props }) {
  return (
    <ButtonBase
      style={{ padding: '10px 20px', backgroundColor: '#1976d2', color: 'white' }}
      {...props}
    >
      {children}
    </ButtonBase>
  );
}
```
