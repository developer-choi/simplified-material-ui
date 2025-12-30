# AvatarGroup 컴포넌트

> Material-UI의 AvatarGroup 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

AvatarGroup은 **여러 Avatar를 겹쳐서 표시하고, 지정된 개수를 초과하는 경우 "+N" 형식으로 surplus를 표시하는** 컴포넌트입니다.

### 핵심 기능
1. **Avatar 스택 레이아웃** - 여러 Avatar를 row-reverse flexbox로 겹쳐서 표시
2. **Max 제한** - `max` prop으로 최대 표시 개수를 제한하고, 나머지는 surplus로 표시
3. **Surplus 표시** - 숨겨진 Avatar 개수를 "+N" 형식으로 표시 (커스터마이징 가능)
4. **Spacing 제어** - Avatar 간 겹침 간격을 preset (small, medium) 또는 픽셀 값으로 조절
5. **Variant 전달** - 부모의 variant prop을 자식 Avatar에 전달 (개별 override 가능)
6. **Total prop 지원** - children 개수와 다른 총 개수를 전달하여 가상화/페이지네이션 지원

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/AvatarGroup/AvatarGroup.js (268줄)

AvatarGroup (React.forwardRef)
  └─> AvatarGroupRoot (styled div)
       ├─> SurplusSlot (Avatar - useSlot으로 생성)
       │    └─> "+N" 텍스트 또는 renderSurplus(extraAvatars) 결과
       └─> children (Avatar[])
            └─> React.cloneElement로 variant, className 주입된 Avatar들
```

### 2. Styled Component 구조

```javascript
// Lines 31-50
AvatarGroupRoot = styled('div', {
  name: 'MuiAvatarGroup',
  slot: 'Root',
  overridesResolver: (props, styles) => {...}
})(
  memoTheme(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row-reverse',  // 역순 배치
    [`& .${avatarClasses.root}`]: {
      border: `2px solid ${theme.palette.background.default}`,
      marginLeft: 'var(--AvatarGroup-spacing, -8px)',  // CSS 변수 사용
      '&:last-child': { marginLeft: 0 }
    }
  }))
)
```

**특징**:
- `memoTheme` 래퍼로 테마 의존성 메모이제이션
- CSS 변수 `--AvatarGroup-spacing`으로 동적 spacing 제어
- `overridesResolver`로 theme.components.MuiAvatarGroup.styleOverrides 지원

### 3. Clamping 알고리즘

```javascript
// Lines 72, 101-108
let clampedMax = max < 2 ? 2 : max;              // 최소값 2로 고정

if (totalAvatars === clampedMax) {
  clampedMax += 1;                                // totalAvatars === clampedMax일 때 +1
}

clampedMax = Math.min(totalAvatars + 1, clampedMax);  // 상한 제한

const maxAvatars = Math.min(children.length, clampedMax - 1);  // 실제 표시 개수
const extraAvatars = Math.max(
  totalAvatars - clampedMax,
  totalAvatars - maxAvatars,
  0
);  // surplus 개수 계산
```

**알고리즘 목적**:
- `max < 2`인 경우 2로 보정 (최소 1개 Avatar + 1개 surplus 표시 공간)
- `totalAvatars === clampedMax`인 경우 surplus 표시를 위해 +1 조정
- `total` prop이 `children.length`보다 큰 경우를 지원 (가상화 시나리오)

**예시**:
- `max=5`, `children.length=10` → 4개 Avatar + "+6" surplus 표시
- `max=5`, `children.length=3` → 3개 Avatar만 표시 (surplus 없음)
- `max=5`, `children.length=5`, `total=10` → 4개 Avatar + "+6" surplus 표시

### 4. Spacing 계산

```javascript
// Lines 111-119
let marginValue;

if (ownerState.spacing && SPACINGS[ownerState.spacing] !== undefined) {
  marginValue = SPACINGS[ownerState.spacing];  // 'small' → -16, 'medium' → -8
} else if (ownerState.spacing === 0) {
  marginValue = 0;                              // 겹침 없음
} else {
  marginValue = -ownerState.spacing || SPACINGS.medium;  // 커스텀 픽셀 값 (음수 변환)
}

// Line 148: CSS 변수로 전달
style={{ '--AvatarGroup-spacing': `${marginValue}px`, ...other.style }}
```

**SPACINGS 상수** (Lines 15-18):
```javascript
const SPACINGS = {
  small: -16,   // 16px 겹침
  medium: -8,   // 8px 겹침 (기본값)
};
```

**Fallback 순서**:
1. `SPACINGS[spacing]` (preset 값)
2. `spacing === 0` (명시적 0)
3. `-spacing` (커스텀 숫자 값, 음수 변환)
4. `SPACINGS.medium` (최종 기본값)

### 5. Slot 시스템

```javascript
// Lines 121-138
const externalForwardedProps = {
  slots,
  slotProps: {
    surplus: slotProps.additionalAvatar ?? componentsProps?.additionalAvatar,
    ...componentsProps,   // 폐기 예정 API
    ...slotProps,         // 새 API
  },
};

const [SurplusSlot, surplusProps] = useSlot('surplus', {
  elementType: Avatar,           // 기본 surplus 컴포넌트
  externalForwardedProps,
  className: classes.avatar,
  ownerState,
  additionalProps: { variant },  // variant 전달
});
```

**Slot 커스터마이징 예시**:
```jsx
<AvatarGroup
  slots={{ surplus: CustomSurplusAvatar }}
  slotProps={{ surplus: { className: 'custom-surplus' } }}
>
  {avatars}
</AvatarGroup>
```

### 6. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 표시할 Avatar 요소들 |
| `max` | number | 5 | surplus 표시 전 최대 Avatar 개수 (최소 2) |
| `spacing` | 'small' \| 'medium' \| number | 'medium' | Avatar 겹침 간격 (-16px \| -8px \| 커스텀) |
| `variant` | 'circular' \| 'rounded' \| 'square' | 'circular' | Avatar 모양 (자식에게 전달) |
| `total` | number | children.length | 총 Avatar 개수 (surplus 계산용) |
| `renderSurplus` | (surplus: number) => ReactNode | - | 커스텀 surplus 렌더러 (기본: `+${surplus}`) |
| `component` | ElementType | 'div' | 루트 엘리먼트 타입 |
| `slots` | { surplus?: ElementType } | {} | surplus 컴포넌트 커스터마이징 |
| `slotProps` | object | {} | Slot별 props 전달 |
| `componentsProps` | object | {} | **폐기 예정** - slotProps 대신 사용 |
| `classes` | object | {} | Utility class override |
| `sx` | SxProps | - | System props |

### 7. Utility Classes 시스템

```javascript
// Lines 20-29
const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    avatar: ['avatar'],
  };

  return composeClasses(slots, getAvatarGroupUtilityClass, classes);
};
```

**생성되는 클래스**:
- `.MuiAvatarGroup-root` - 루트 컨테이너
- `.MuiAvatarGroup-avatar` - 각 Avatar (surplus 포함)

**Override 예시**:
```jsx
<AvatarGroup classes={{ root: 'custom-root', avatar: 'custom-avatar' }}>
```

### 8. Children 처리

```javascript
// Lines 84-97
const children = React.Children.toArray(childrenProp).filter((child) => {
  if (process.env.NODE_ENV !== 'production') {
    if (isFragment(child)) {
      console.error(
        "MUI: The AvatarGroup component doesn't accept a Fragment as a child."
      );
    }
  }

  return React.isValidElement(child);
});
```

**Fragment 감지** (Lines 86-93):
- `react-is`의 `isFragment`로 Fragment 체크
- 개발 모드에서만 경고 출력
- `React.isValidElement`로 유효한 React 엘리먼트만 필터링

**Clone & Prop 주입** (Lines 156-161):
```javascript
children
  .slice(0, maxAvatars)  // max 개수만큼만 표시
  .reverse()             // row-reverse 레이아웃에 맞춰 역순
  .map((child) => {
    return React.cloneElement(child, {
      className: clsx(child.props.className, classes.avatar),
      variant: child.props.variant || variant,  // variant 전달 (override 가능)
    });
  })
```

---

## 설계 패턴

### 1. **Composition 패턴**
- 다수의 Avatar를 조합하여 하나의 그룹으로 표시
- `React.Children.toArray` + `React.cloneElement`로 자식 컴포넌트 제어

### 2. **Slot 패턴**
- `useSlot` 훅으로 surplus Avatar 컴포넌트를 커스터마이징 가능하게 설계
- `slots`, `slotProps`로 세밀한 제어 제공

### 3. **CSS-in-JS with Theme**
- `styled` + `memoTheme`로 테마 기반 스타일링
- CSS 변수 `--AvatarGroup-spacing`으로 동적 spacing 제어

### 4. **Props Forwarding**
- 부모의 `variant` prop을 자식 Avatar에 전달 (자식의 명시적 설정 우선)
- `ownerState` 패턴으로 스타일에 props 전달

### 5. **Clamping & Edge Case 처리**
- `max < 2` → 2로 보정
- `totalAvatars === clampedMax` → +1 조정
- 복잡한 surplus 계산 로직으로 모든 케이스 커버

---

## 복잡도의 이유

AvatarGroup은 **268줄**이며, 복잡한 이유는:

### 1. **PropTypes 정의** (Lines 166-266, 100줄 - 37%)
- TypeScript 타입에서 자동 생성된 PropTypes
- `chainPropTypes`로 커스텀 검증 (`max >= 2`)
- 11개 props에 대한 상세한 타입 정의

### 2. **Styled Component 인프라** (Lines 31-50, 20줄)
- `styled` + `memoTheme` 래퍼
- `overridesResolver`로 theme override 지원
- CSS 변수와 중첩 선택자 사용

### 3. **Slot 시스템** (Lines 121-138, 18줄)
- `useSlot` 훅으로 surplus Avatar 커스터마이징
- `slotProps` + 폐기된 `componentsProps` 병합 로직
- `externalForwardedProps` 객체 구성

### 4. **Utility Classes 생성** (Lines 20-29, 10줄)
- `composeClasses` + `getAvatarGroupUtilityClass`
- BEM 스타일 클래스 네이밍 시스템

### 5. **복잡한 Clamping 로직** (Lines 72, 101-108, ~10줄)
- 3단계 clamping (최소값, totalAvatars 조정, 상한값)
- `maxAvatars`, `extraAvatars` 계산
- Edge case 처리 (total > children.length)

### 6. **Spacing 계산 로직** (Lines 111-119, 9줄)
- Preset + 커스텀 값 + fallback 처리
- CSS 변수로 동적 전달

### 7. **Fragment 감지** (Lines 85-94, 10줄)
- `react-is` 라이브러리 의존성
- 개발 모드 경고 출력

### 8. **useDefaultProps + Theme 통합** (Lines 53-56, 4줄)
- `DefaultPropsProvider`에서 기본값 주입
- 테마 기반 prop 기본값 지원

### 9. **폐기된 API 지원** (Lines 62, 124-127)
- `componentsProps` backward compatibility
- `slotProps.additionalAvatar` fallback

### 10. **Children 처리** (Lines 84-97, 153-161)
- Filter + Fragment 체크
- Clone + Prop injection
- Slice + Reverse 변환

---

## 복잡도 요약

| 항목 | 라인 수 | 비율 |
|------|---------|------|
| PropTypes | 100 | 37% |
| Styled Component | 20 | 7% |
| Slot System | 18 | 7% |
| Utility Classes | 10 | 4% |
| Clamping Logic | 10 | 4% |
| Spacing Logic | 9 | 3% |
| Fragment Detection | 10 | 4% |
| 기타 (imports, 핵심 로직) | 91 | 34% |
| **총계** | **268** | **100%** |

**간소화 대상**:
- PropTypes (100줄) - TypeScript로 대체 가능
- Styled Component (20줄) - 인라인 스타일로 대체 가능
- Slot System (18줄) - 학습용으로 불필요
- Utility Classes (10줄) - 간단한 className으로 대체 가능
- Fragment Detection (10줄) - 개발 경고, 핵심 기능 아님
- Theme/useDefaultProps - 하드코딩으로 대체 가능
- Deprecated API - 제거 가능

**예상 간소화 결과**: ~95줄 (65% 감소)
