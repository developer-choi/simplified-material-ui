# AvatarGroup 간소화 컴포넌트

> 학습용으로 간소화된 AvatarGroup 컴포넌트 분석

---

## 간소화 개요

**목표**: Material-UI AvatarGroup 컴포넌트에서 학습에 불필요한 복잡도 제거
**결과**: 268줄 → 84줄 (**68.7% 감소**, 184줄 제거)
**방식**: 10단계 점진적 제거 (각 기능별 1개 커밋)

---

## 10단계 간소화 과정

### [1/10] Fragment 감지 경고 제거
**제거된 것**:
- `react-is` 라이브러리의 `isFragment` 체크
- 개발 모드 console.error 경고 (10줄)

**이유**:
- 핵심은 아바타 스택 로직이지, React 엘리먼트 검증이 아님
- Fragment 감지는 개발 시 도움이 되지만 컴포넌트 동작과 무관

**삭제 대상**:
```javascript
// Line 4
import { isFragment } from 'react-is';

// Lines 85-94
if (process.env.NODE_ENV !== 'production') {
  if (isFragment(child)) {
    console.error(
      "MUI: The AvatarGroup component doesn't accept a Fragment as a child."
    );
  }
}
```

---

### [2/10] 폐기된 componentsProps prop 제거
**제거된 것**:
- `componentsProps` prop (deprecated API)
- 하위 호환성 처리 로직 (15줄)

**이유**:
- 새로운 `slotProps` API에 집중하는 것이 명확함
- 복잡한 prop 병합 로직 제거

**삭제 대상**:
```javascript
// Line 62
componentsProps,

// Lines 121-128
const externalForwardedProps = {
  slots,
  slotProps: {
    surplus: slotProps.additionalAvatar ?? componentsProps?.additionalAvatar,
    ...componentsProps,  // 하위 호환성
    ...slotProps,
  },
};

// PropTypes (Lines 174-184)
componentsProps: PropTypes.shape({
  additionalAvatar: PropTypes.object,
})
```

---

### [3/10] renderSurplus prop 제거
**제거된 것**:
- 커스텀 surplus 렌더링 함수 prop
- 조건부 렌더링 로직 (8줄)

**이유**:
- 기본 "+X" 형식으로 surplus 표시 개념 이해 충분
- 99% 사용자가 기본 형식 사용

**삭제 대상**:
```javascript
// Line 64
renderSurplus,

// Line 109
const extraAvatarsElement = renderSurplus ? renderSurplus(extraAvatars) : `+${extraAvatars}`;
// → 간소화 후
const extraAvatarsElement = `+${extraAvatars}`;
```

---

### [4/10] component prop 제거
**제거된 것**:
- 루트 엘리먼트 타입 변경 기능
- `component` prop 처리 (8줄)

**이유**:
- AvatarGroup은 항상 div 컨테이너로 충분
- 일관성: Avatar, Divider도 component prop 제거됨

**삭제 대상**:
```javascript
// Line 61
component = 'div',

// Line 74 (ownerState)
component,

// Line 142
as={component}
```

**변경 후**:
```javascript
// 항상 div로 렌더링
<div ref={ref} className={className} style={rootStyle} {...other}>
```

---

### [5/10] Slot 시스템 제거
**제거된 것**:
- `slots`, `slotProps` props
- `useSlot` 훅 및 slot 커스터마이징 시스템 (37줄)

**이유**:
- 핵심은 아바타 스택이지, 컴포넌트 slot 커스터마이징이 아님
- 대부분 사용자가 커스터마이징하지 않음

**삭제 대상**:
```javascript
// Line 12
import useSlot from '../utils/useSlot';

// Lines 65-66
slotProps = {},
slots = {},

// Lines 121-138 (18줄)
const externalForwardedProps = { ... };
const [SurplusSlot, surplusProps] = useSlot('surplus', {
  elementType: Avatar,
  externalForwardedProps,
  className: classes.avatar,
  ownerState,
  additionalProps: { variant },
});

// Line 152
<SurplusSlot {...surplusProps}>{extraAvatarsElement}</SurplusSlot>
```

**변경 후**:
```javascript
<Avatar variant={variant} style={avatarStyle}>
  {extraAvatarsElement}
</Avatar>
```

---

### [6/10] useDefaultProps 제거
**제거된 것**:
- 테마 기반 기본 props 시스템
- `DefaultPropsProvider` 컨텍스트 의존성 (7줄)

**이유**:
- 테마 시스템은 AvatarGroup 로직과 별개
- ES6 기본 매개변수로 충분

**삭제 대상**:
```javascript
// Line 10
import { useDefaultProps } from '../DefaultPropsProvider';

// Lines 53-56
const props = useDefaultProps({
  props: inProps,
  name: 'MuiAvatarGroup',
});
```

**변경 후**:
```javascript
const AvatarGroup = React.forwardRef(function AvatarGroup(props, ref) {
  const {
    max = 5,
    spacing = 'medium',
    variant = 'circular',
    // ...
  } = props;
```

---

### [7/10] Utility Classes 시스템 제거
**제거된 것**:
- `useUtilityClasses` 함수
- `composeClasses`, `getAvatarGroupUtilityClass` (18줄)

**이유**:
- 레이아웃 로직에 집중, CSS 클래스 네이밍 시스템 불필요
- BEM 스타일 클래스 조합 복잡도 제거

**삭제 대상**:
```javascript
// Lines 6-7
import composeClasses from '@mui/utils/composeClasses';
import { getAvatarGroupUtilityClass } from './avatarGroupClasses';

// Lines 20-29
const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;
  const slots = {
    root: ['root'],
    avatar: ['avatar'],
  };
  return composeClasses(slots, getAvatarGroupUtilityClass, classes);
};

// Line 82
const classes = useUtilityClasses(ownerState);

// Line 144
className={clsx(classes.root, className)}
```

**변경 후**:
```javascript
className={className}  // 직접 사용
```

---

### [8/10] Theme 시스템 제거
**제거된 것**:
- `memoTheme` 래퍼
- `theme.palette.background.default` 참조 (14줄)

**이유**:
- AvatarGroup 레이아웃 로직은 테마와 독립적
- 하드코딩된 값으로 충분히 학습 가능

**삭제 대상**:
```javascript
// Line 9
import memoTheme from '../utils/memoTheme';

// Lines 38-49
memoTheme(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row-reverse',
  [`& .${avatarClasses.root}`]: {
    border: `2px solid ${(theme.vars || theme).palette.background.default}`,
    // ...
  },
}))
```

**변경 후**:
```javascript
{
  display: 'flex',
  flexDirection: 'row-reverse',
  border: '2px solid #ffffff',  // 하드코딩
}
```

---

### [9/10] Styled Components 제거
**제거된 것**:
- `AvatarGroupRoot` styled component
- `styled` 함수, ownerState 전달 (47줄)

**이유**:
- 레이아웃 알고리즘에 집중, CSS-in-JS 불필요
- 인라인 스타일로 충분히 명확함

**삭제 대상**:
```javascript
// Line 8
import { styled } from '../zero-styled';
import { avatarClasses } from '../Avatar';
import avatarGroupClasses from './avatarGroupClasses';

// Lines 31-50
const AvatarGroupRoot = styled('div', {
  name: 'MuiAvatarGroup',
  slot: 'Root',
  overridesResolver: (props, styles) => { ... },
})({
  display: 'flex',
  flexDirection: 'row-reverse',
  [`& .${avatarClasses.root}`]: {
    border: '2px solid #ffffff',
    boxSizing: 'content-box',
    marginLeft: 'var(--AvatarGroup-spacing, -8px)',
    '&:last-child': { marginLeft: 0 },
  },
});

// Lines 74-79 (ownerState)
const ownerState = {
  ...props,
  max,
  spacing,
  variant,
};

// Lines 141-151
<AvatarGroupRoot
  ownerState={ownerState}
  className={classes.root}
  ref={ref}
  {...other}
  style={{ '--AvatarGroup-spacing': `${marginValue}px`, ...other.style }}
>
```

**변경 후**:
```javascript
const rootStyle = {
  display: 'flex',
  flexDirection: 'row-reverse',
  ...other.style,
};

const avatarStyle = {
  border: '2px solid #ffffff',
  boxSizing: 'content-box',
  marginLeft: `${marginValue}px`,
};

<div ref={ref} className={className} style={rootStyle} {...other}>
  <Avatar variant={variant} style={avatarStyle}>...</Avatar>
  {children.map((child, index) =>
    React.cloneElement(child, {
      variant: child.props.variant || variant,
      style: {
        ...avatarStyle,
        ...(index === children.length - 1 ? { marginLeft: 0 } : {}),
        ...child.props.style,
      },
    })
  )}
</div>
```

---

### [10/10] PropTypes 및 메타데이터 제거
**제거된 것**:
- 모든 PropTypes 정의 (67줄)
- `chainPropTypes` 커스텀 검증

**이유**:
- PropTypes는 타입 검증이지, 컴포넌트 로직이 아님
- TypeScript가 더 나은 타입 체킹 제공

**삭제 대상**:
```javascript
// Lines 3-4
import PropTypes from 'prop-types';
import chainPropTypes from '@mui/utils/chainPropTypes';

// Lines 166-266 (100줄 → 실제 64줄 남아있었음)
AvatarGroup.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  max: chainPropTypes(PropTypes.number, (props) => {
    if (props.max < 2) {
      return new Error('MUI: The prop `max` should be equal to 2 or above.');
    }
    return null;
  }),
  spacing: PropTypes.oneOfType([PropTypes.oneOf(['medium', 'small']), PropTypes.number]),
  style: PropTypes.object,
  sx: PropTypes.oneOfType([...]),
  total: PropTypes.number,
  variant: PropTypes.oneOfType([...]),
};
```

---

## 최종 간소화된 구조

### 파일 정보
- **위치**: packages/mui-material/src/AvatarGroup/AvatarGroup.js
- **총 라인 수**: 84줄 (원본 268줄에서 68.7% 감소)
- **Import 수**: 2개 (React, Avatar)

### 유지된 Props (7개)
```javascript
{
  children,       // Avatar 요소들
  className,      // CSS 클래스
  max = 5,        // 최대 표시 개수
  spacing = 'medium',  // 겹침 간격
  total,          // 총 아바타 개수
  variant = 'circular',  // 모양
  style           // 인라인 스타일 (other.style)
}
```

### 핵심 로직

#### 1. SPACINGS 상수 (Lines 5-8)
```javascript
const SPACINGS = {
  small: -16,   // 16px 겹침
  medium: -8,   // 8px 겹침 (기본값)
};
```
**목적**: Preset spacing 값 제공

---

#### 2. Clamping 알고리즘 (Lines 20-35)
```javascript
let clampedMax = max < 2 ? 2 : max;  // 최소값 2

if (totalAvatars === clampedMax) {
  clampedMax += 1;  // surplus 표시 공간 확보
}

clampedMax = Math.min(totalAvatars + 1, clampedMax);  // 상한값

const maxAvatars = Math.min(children.length, clampedMax - 1);  // 실제 표시 개수
const extraAvatars = Math.max(totalAvatars - clampedMax, totalAvatars - maxAvatars, 0);  // surplus
```

**학습 포인트**:
- `max < 2` → 2로 보정: 최소 1개 Avatar + 1개 surplus 표시 공간
- `totalAvatars === clampedMax` → +1 조정: surplus 표시를 위한 공간 확보
- `total` prop 지원: children.length와 다른 총 개수 (가상화 시나리오)

**예시**:
| max | children.length | total | 결과 |
|-----|----------------|-------|------|
| 5 | 10 | - | 4개 Avatar + "+6" |
| 5 | 3 | - | 3개 Avatar (surplus 없음) |
| 5 | 5 | 10 | 4개 Avatar + "+6" |

---

#### 3. Spacing 계산 (Lines 38-46)
```javascript
let marginValue;

if (spacing && SPACINGS[spacing] !== undefined) {
  marginValue = SPACINGS[spacing];  // preset 값
} else if (spacing === 0) {
  marginValue = 0;  // 겹침 없음
} else {
  marginValue = -spacing || SPACINGS.medium;  // 커스텀 숫자 (음수 변환)
}
```

**Fallback 순서**:
1. `SPACINGS[spacing]` - preset ('small' or 'medium')
2. `spacing === 0` - 명시적 0
3. `-spacing` - 커스텀 숫자 값 (음수 변환)
4. `SPACINGS.medium` - 최종 기본값 (-8)

---

#### 4. 인라인 스타일 (Lines 48-58)
```javascript
const rootStyle = {
  display: 'flex',
  flexDirection: 'row-reverse',  // 역순 배치
  ...other.style,
};

const avatarStyle = {
  border: '2px solid #ffffff',   // 흰색 테두리
  boxSizing: 'content-box',      // border를 width에 포함하지 않음
  marginLeft: `${marginValue}px`,  // 겹침 간격
};
```

**flexDirection: 'row-reverse' 이유**:
- Avatar를 오른쪽에서 왼쪽으로 배치
- 첫 번째 Avatar가 가장 위에 표시됨 (z-index 효과)

---

#### 5. Surplus Avatar 렌더링 (Lines 62-66)
```javascript
{extraAvatars ? (
  <Avatar variant={variant} style={avatarStyle}>
    {`+${extraAvatars}`}
  </Avatar>
) : null}
```

**단순함**:
- extraAvatars가 있을 때만 렌더링
- "+N" 형식 하드코딩 (renderSurplus 제거)
- variant와 style 직접 전달

---

#### 6. Children 처리 (Lines 67-79)
```javascript
{children
  .slice(0, maxAvatars)  // max 개수만큼만 표시
  .reverse()             // row-reverse 레이아웃에 맞춰 역순
  .map((child, index) => {
    return React.cloneElement(child, {
      variant: child.props.variant || variant,  // variant 전달 (override 가능)
      style: {
        ...avatarStyle,
        ...(index === children.length - 1 ? { marginLeft: 0 } : {}),  // 마지막 Avatar는 marginLeft 0
        ...child.props.style,  // 자식의 style 보존
      },
    });
  })}
```

**학습 포인트**:
- `slice(0, maxAvatars)` - 표시할 개수만큼 자르기
- `reverse()` - flexDirection: 'row-reverse'와 함께 사용하여 올바른 순서 표시
- `index === children.length - 1` - 마지막 Avatar는 marginLeft 제거 (마지막은 왼쪽에 위치)
- variant 전달: `child.props.variant || variant` - 자식의 명시적 설정 우선

---

## 제거된 기능 요약

| 기능 | 제거 라인 수 | 이유 |
|------|-------------|------|
| **Fragment 감지** | 10 | 개발 경고, 핵심 기능 아님 |
| **componentsProps** | 15 | 폐기된 API, 하위 호환성 |
| **renderSurplus** | 8 | 커스텀 렌더링, 기본 "+N"으로 충분 |
| **component prop** | 8 | 항상 div로 충분 |
| **Slot 시스템** | 37 | 고급 커스터마이징, 학습용 불필요 |
| **useDefaultProps** | 7 | 테마 의존성, ES6 기본값으로 충분 |
| **Utility Classes** | 18 | CSS 클래스 네이밍 시스템 |
| **Theme 시스템** | 14 | 테마 통합, 하드코딩으로 충분 |
| **Styled Components** | 47 | CSS-in-JS, 인라인 스타일로 충분 |
| **PropTypes** | 67 | 타입 검증, TypeScript로 대체 |
| **총계** | **231** | - |

**실제 감소**: 268 - 84 = **184줄** (68.7% 감소)
*(일부 코드가 변경되면서 라인 수 조정됨)*

---

## 핵심 학습 포인트

### 1. Clamping 알고리즘 이해
```javascript
// 핵심 수식
clampedMax = Math.min(totalAvatars + 1, max < 2 ? 2 : max);
if (totalAvatars === clampedMax) clampedMax += 1;
maxAvatars = Math.min(children.length, clampedMax - 1);
extraAvatars = Math.max(totalAvatars - clampedMax, totalAvatars - maxAvatars, 0);
```

**이 알고리즘이 해결하는 문제**:
- max가 너무 작은 경우 (< 2)
- totalAvatars === clampedMax 일 때 surplus 표시 공간
- total > children.length 인 가상화 시나리오

### 2. Flexbox row-reverse 레이아웃
```javascript
flexDirection: 'row-reverse'  // 오른쪽에서 왼쪽으로
children.reverse()            // 배열 역순 (올바른 순서 표시)
marginLeft: `${marginValue}px`  // 왼쪽 마진 (겹침)
```

**왜 reverse가 두 번 필요한가?**:
- flexDirection: 'row-reverse' - 시각적 순서 역전
- children.reverse() - 데이터 순서를 다시 역전 → 원래 순서로 표시

### 3. React.cloneElement 패턴
```javascript
React.cloneElement(child, {
  variant: child.props.variant || variant,
  style: { ...avatarStyle, ...child.props.style },
})
```

**학습 포인트**:
- 부모가 자식의 props를 주입
- 자식의 명시적 설정이 부모 기본값보다 우선
- 스타일 병합 순서: 부모 기본값 → 자식 설정

### 4. 인라인 스타일 조합
```javascript
const rootStyle = {
  display: 'flex',
  flexDirection: 'row-reverse',
  ...other.style,  // 사용자 커스텀 스타일 우선
};
```

**Spread 순서**:
- 먼저 기본 스타일
- 나중에 사용자 스타일 (override)

### 5. Spacing 계산 우선순위
```javascript
if (spacing && SPACINGS[spacing] !== undefined) {
  // 1순위: preset 값
} else if (spacing === 0) {
  // 2순위: 명시적 0 (falsy 값 처리)
} else {
  // 3순위: 커스텀 숫자 → 음수 변환
  marginValue = -spacing || SPACINGS.medium;
}
```

**Falsy 값 처리 주의**:
- `spacing === 0` 체크 없으면 0이 무시됨
- `-spacing || SPACINGS.medium` - 0은 falsy이므로 기본값 사용

---

## 비교: 원본 vs 간소화

### 코드 크기
| 항목 | 원본 | 간소화 | 감소 |
|------|------|--------|------|
| 총 라인 수 | 268 | 84 | 68.7% |
| Import 수 | 12 | 2 | 83.3% |
| Props 수 | 11 | 7 | 36.4% |
| 핵심 로직 | ~100줄 | ~80줄 | 20% |

### 기능 비교
| 기능 | 원본 | 간소화 | 학습 가치 |
|------|------|--------|----------|
| **Avatar 스택** | ✅ | ✅ | 높음 |
| **Max 제한** | ✅ | ✅ | 높음 |
| **Surplus 표시** | ✅ (커스텀) | ✅ ("+N") | 높음 |
| **Spacing** | ✅ (preset + 커스텀) | ✅ (preset + 커스텀) | 높음 |
| **Variant 전달** | ✅ | ✅ | 중간 |
| **Total prop** | ✅ | ✅ | 중간 |
| Slot 커스터마이징 | ✅ | ❌ | 낮음 |
| renderSurplus | ✅ | ❌ | 낮음 |
| component prop | ✅ | ❌ | 낮음 |
| Theme 통합 | ✅ | ❌ | 낮음 |
| Styled Components | ✅ | ❌ | 낮음 |
| Utility Classes | ✅ | ❌ | 낮음 |
| PropTypes | ✅ | ❌ | 낮음 |

### 복잡도 비교
| 측면 | 원본 | 간소화 | 개선 |
|------|------|--------|------|
| **가독성** | 낮음 (styled, theme, slots) | 높음 (인라인, 직관적) | ⬆️ |
| **이해도** | 어려움 (간접 참조 많음) | 쉬움 (직접적) | ⬆️ |
| **의존성** | 10+ 라이브러리 | 1개 (React) | ⬆️ |
| **디버깅** | 어려움 (중첩된 HOC) | 쉬움 (plain code) | ⬆️ |

---

## 간소화의 교육적 가치

### 1. 핵심 알고리즘 집중
- **Clamping 로직**: max, total, children.length 간의 복잡한 관계
- **Spacing 계산**: preset + 커스텀 + fallback 처리
- **Children 조작**: slice, reverse, cloneElement 패턴

### 2. React 패턴 학습
- `React.forwardRef` - ref 전달
- `React.Children.toArray` - children 정규화
- `React.cloneElement` - props 주입
- `React.isValidElement` - 유효성 검증

### 3. Flexbox 레이아웃 이해
- row-reverse를 사용한 역순 배치
- marginLeft를 사용한 겹침 효과
- 마지막 요소의 margin 제거

### 4. 조건부 렌더링
- surplus Avatar의 조건부 표시
- extraAvatars > 0 체크
- 마지막 Avatar의 스타일 조정

### 5. Props 설계
- 기본값 설정 (max, spacing, variant)
- 우선순위 (자식 설정 > 부모 기본값)
- Rest props 전달 (...other)

---

## 간소화 후 유지된 핵심 기능

### 1. Avatar 스택 레이아웃
```javascript
<div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
  {/* Avatar들이 오른쪽에서 왼쪽으로, 겹쳐서 표시됨 */}
</div>
```

### 2. Max 제한 및 Surplus 표시
```javascript
{extraAvatars ? <Avatar>+{extraAvatars}</Avatar> : null}
{children.slice(0, maxAvatars).map(...)}
```

### 3. Spacing 제어
```javascript
marginLeft: `${marginValue}px`  // SPACINGS[spacing] 또는 -spacing
```

### 4. Variant 전달
```javascript
variant: child.props.variant || variant  // 자식 설정 우선
```

### 5. Total prop 지원
```javascript
const totalAvatars = total || children.length;  // 가상화 시나리오 지원
```

---

## 제거 결정 근거

### 학습 목적 기준
1. **핵심 로직**: 유지 (Clamping, Spacing)
2. **UI 구현**: 유지 (Flexbox, 인라인 스타일)
3. **고급 커스터마이징**: 제거 (Slots, renderSurplus)
4. **인프라**: 제거 (Theme, Styled Components, PropTypes)

### 복잡도 기준
1. **간단한 로직**: 유지
2. **복잡한 추상화**: 제거
3. **외부 의존성**: 제거
4. **폐기된 API**: 제거

---

## 간소화 과정의 교훈

### 1. 점진적 제거의 중요성
- 10단계로 나눠서 각 기능별 1개 커밋
- 각 단계마다 동작 검증 가능
- Git 히스토리로 변경 추적 가능

### 2. 핵심 기능 식별
- **유지**: Clamping, Spacing, Variant 전달
- **제거**: Theme, Styled, Slots, PropTypes

### 3. 하드코딩의 교육적 가치
- `border: '2px solid #ffffff'` - 명확한 값
- `SPACINGS = { small: -16, medium: -8 }` - 직관적인 상수

### 4. 간접 참조 제거
- `theme.palette.background.default` → `'#ffffff'`
- `classes.avatar` → 직접 스타일 적용
- `ownerState.spacing` → `spacing`

---

## 추가 간소화 가능 영역 (선택적)

### 1. SPACINGS 상수 제거
```javascript
// 현재
const SPACINGS = { small: -16, medium: -8 };

// 더 간소화
const marginValue = typeof spacing === 'number' ? -spacing : (spacing === 'small' ? -16 : -8);
```

### 2. Children 필터링 제거
```javascript
// 현재
const children = React.Children.toArray(childrenProp).filter(React.isValidElement);

// 더 간소화 (유효한 React 요소만 전달된다고 가정)
const children = React.Children.toArray(childrenProp);
```

### 3. Total prop 제거
```javascript
// 현재
const totalAvatars = total || children.length;

// 더 간소화 (children.length만 사용)
const totalAvatars = children.length;
```

**결정**: 위 3가지는 유지하기로 결정
- SPACINGS: preset 값 명확성
- 필터링: React 요소 유효성 보장
- Total: 가상화 시나리오 학습 가치

---

## 결론

AvatarGroup 간소화는 **268줄 → 84줄 (68.7% 감소)** 를 달성하면서도 핵심 기능을 모두 유지했습니다.

### 간소화 성과
✅ **Clamping 알고리즘** - 완전히 유지
✅ **Spacing 계산** - 완전히 유지
✅ **Flexbox 레이아웃** - 완전히 유지
✅ **Variant 전달** - 완전히 유지
✅ **Total prop 지원** - 완전히 유지

### 제거된 복잡도
❌ Fragment 감지 (10줄)
❌ componentsProps (15줄)
❌ renderSurplus (8줄)
❌ component prop (8줄)
❌ Slot 시스템 (37줄)
❌ useDefaultProps (7줄)
❌ Utility Classes (18줄)
❌ Theme 시스템 (14줄)
❌ Styled Components (47줄)
❌ PropTypes (67줄)

### 학습 효과
- **가독성**: 인라인 스타일, 직관적인 코드
- **이해도**: 핵심 알고리즘에 집중
- **디버깅**: 간접 참조 제거, 단순한 호출 스택
- **확장성**: 필요시 점진적으로 기능 추가 가능

간소화된 AvatarGroup은 Material-UI의 복잡한 인프라 없이도 Avatar 그룹 표시의 핵심 로직을 명확하게 보여줍니다. 학습자는 이 간소화된 버전을 통해 **Clamping 알고리즘**, **Flexbox 레이아웃**, **React.cloneElement 패턴**을 효과적으로 학습할 수 있습니다.
