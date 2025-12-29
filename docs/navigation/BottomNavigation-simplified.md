# BottomNavigation 컴포넌트

> 모바일 하단 탐색을 위한 단순화된 컨테이너 컴포넌트

---

## 무슨 기능을 하는가?

수정된 BottomNavigation은 **모바일 앱의 하단에 위치하는 주요 탐색 메뉴를 제공하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **자식 관리** - 여러 BottomNavigationAction을 담는 컨테이너 역할
2. **선택 상태 관리** - value prop으로 현재 선택된 아이템 추적
3. **Props 자동 주입** - 자식 컴포넌트에 selected, showLabel, onChange 등을 자동으로 전달
4. **고정 레이아웃** - flex 레이아웃으로 자식들을 가로로 정렬 (56px 고정 높이)

---

## 핵심 학습 포인트

### 1. React.Children.map과 cloneElement 패턴

```javascript
React.Children.map(children, (child, childIndex) => {
  if (!React.isValidElement(child)) {
    return null;
  }

  const childValue = child.props.value === undefined ? childIndex : child.props.value;

  return React.cloneElement(child, {
    selected: childValue === value,
    showLabel: child.props.showLabel !== undefined ? child.props.showLabel : showLabels,
    value: childValue,
    onChange,
  });
});
```

**학습 가치**:
- **Composition Pattern**: 부모가 자식의 props를 제어하는 방법
- **자동 Index 할당**: value가 없으면 자동으로 index 사용
- **Props 오버라이드**: 자식의 prop이 있으면 우선, 없으면 부모의 값 사용
- **React.cloneElement**: 기존 엘리먼트를 복제하며 새로운 props 추가

### 2. 조건부 스타일 (BottomNavigationAction)

```javascript
// 패딩 계산: showLabel/selected 상태에 따라 동적 변경
const paddingTop = !showLabel && !selected ? (!label ? 0 : 14) : 6;

<button
  style={{
    padding: `${paddingTop}px 12px 8px`,
    color: selected ? '#1976d2' : 'rgba(0, 0, 0, 0.6)',
    // ...
  }}
>
```

**학습 가치**:
- **상태 기반 스타일링**: selected와 showLabel 조합으로 3가지 상태 처리
- **인라인 스타일**: CSS-in-JS 없이 직접 style 객체 사용
- **동적 값 계산**: 삼항 연산자를 중첩하여 복잡한 조건 처리

### 3. 이벤트 핸들러 병합

```javascript
const handleChange = (event) => {
  if (onChange) {
    onChange(event, value);  // 부모의 onChange 호출
  }

  if (onClick) {
    onClick(event);  // 추가 onClick 핸들러 호출
  }
};
```

**학습 가치**:
- **이벤트 체이닝**: 여러 핸들러를 순차적으로 호출
- **선택적 실행**: 핸들러가 있을 때만 호출 (null 체크)
- **값 전달**: onChange에 event와 value를 함께 전달

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// BottomNavigation: packages/mui-material/src/BottomNavigation/BottomNavigation.js (38줄, 원본 141줄)
BottomNavigation (div)
  └─> BottomNavigationAction (button)
       ├─> icon (React.ReactNode)
       └─> label (span)

// BottomNavigationAction: packages/mui-material/src/BottomNavigationAction/BottomNavigationAction.js (65줄, 원본 236줄)
```

### 2. BottomNavigation 구현

```javascript
const BottomNavigation = React.forwardRef(function BottomNavigation(
  { children, onChange, showLabels = false, value, ...other },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: 56,
        backgroundColor: '#fff',
      }}
      {...other}
    >
      {/* Children mapping with prop injection */}
    </div>
  );
});
```

**원본과의 차이**:
- ❌ `component` prop 제거 → 항상 div 사용
- ❌ `styled()` 제거 → 인라인 스타일 사용
- ❌ `memoTheme()` 제거 → 하드코딩된 값 사용
- ❌ `useDefaultProps()` 제거 → 함수 파라미터 기본값
- ❌ `useUtilityClasses()` 제거 → 클래스 이름 생성 로직 제거
- ❌ `className`, `classes`, `sx` props 제거

### 3. BottomNavigationAction 구현

```javascript
const BottomNavigationAction = React.forwardRef(function BottomNavigationAction(
  { icon, label, onChange, onClick, selected, showLabel, value, ...other },
  ref,
) {
  const paddingTop = !showLabel && !selected ? (!label ? 0 : 14) : 6;

  return (
    <button
      ref={ref}
      onClick={handleChange}
      style={{ /* inline styles */ }}
      {...other}
    >
      {icon}
      <span style={{ /* label styles */ }}>
        {label}
      </span>
    </button>
  );
});
```

**원본과의 차이**:
- ❌ `ButtonBase` 상속 제거 → 일반 button 사용
- ❌ `slots`, `slotProps` 제거 → 고정된 구조
- ❌ `styled()` 제거 → 인라인 스타일
- ❌ `variants` 배열 제거 → 직접 조건문 계산
- ❌ `transition` 애니메이션 제거 → 즉시 변경
- ❌ `className`, `classes` 제거

### 4. Props (BottomNavigation: 4개, BottomNavigationAction: 6개)

**BottomNavigation**:
| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | BottomNavigationAction 자식들 |
| `onChange` | func | - | 값 변경 콜백 (event, value) |
| `showLabels` | bool | false | 모든 라벨 표시 여부 |
| `value` | any | - | 현재 선택된 값 |

**BottomNavigationAction**:
| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `icon` | node | - | 표시할 아이콘 |
| `label` | node | - | 라벨 텍스트 |
| `showLabel` | bool | 부모 상속 | 라벨 표시 여부 오버라이드 |
| `value` | any | index | 이 아이템의 고유 값 |
| `selected` | bool | - | (내부) 선택 상태 |
| `onChange` | func | - | (내부) 변경 콜백 |

---

## 커밋 히스토리로 보는 단순화 과정

BottomNavigation은 **10개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 제거
- `572f6d14` - [BottomNavigation 단순화 1/10] Slot 시스템 제거

**무엇을**: BottomNavigationAction에서 커스텀 root/label 컴포넌트를 주입할 수 있는 slot 시스템

**왜 불필요한가**:
- **학습 목적**: 고정된 구조(button + span)로도 개념 이해 충분
- **복잡도**: useSlot() 훅 2번 호출, slotProps 병합 로직

### 2단계: Fragment 감지 로직 제거
- `3b20fbe4` - [BottomNavigation 단순화 2/10] Fragment 감지 로직 제거

**무엇을**: BottomNavigation에서 자식이 Fragment인지 검사하는 개발 모드 경고

**왜 불필요한가**:
- **학습 목적**: Fragment 감지는 에러 처리이지 핵심 기능이 아님
- **복잡도**: react-is 라이브러리 의존성

### 3단계: component prop 제거
- `3c977755` - [BottomNavigation 단순화 3/10] component prop 제거

**무엇을**: BottomNavigation의 루트 엘리먼트를 변경할 수 있는 prop

**왜 불필요한가**:
- **학습 목적**: BottomNavigation은 항상 div면 충분
- **현실**: 대부분 기본값(div) 사용

### 4단계: Transition 애니메이션 제거
- `60ac84de` - [BottomNavigation 단순화 4/10] Transition 애니메이션 제거

**무엇을**: BottomNavigationAction의 색상, 패딩, 폰트 크기, 불투명도 전환 효과

**왜 불필요한가**:
- **학습 목적**: BottomNavigation의 핵심은 "탐색 UI"이지 "애니메이션"이 아님
- **복잡도**: theme.transitions.create() 호출, transitionDelay 계산

### 5단계: BottomNavigation Theme 시스템 제거
- `16a956f7` - [BottomNavigation 단순화 5/10] useDefaultProps, useUtilityClasses 제거

**무엇을**: useDefaultProps와 useUtilityClasses, composeClasses

**왜 불필요한가**:
- **학습 목적**: 함수 파라미터 기본값으로도 충분
- **복잡도**: DefaultPropsProvider Context 구독, 클래스 이름 생성 로직

### 6단계: BottomNavigationAction Theme 시스템 제거
- `47ae8fcf` - [BottomNavigation 단순화 6/10] BottomNavigationAction useDefaultProps, useUtilityClasses 제거

**무엇을**: BottomNavigationAction의 useDefaultProps와 useUtilityClasses

**왜 불필요한가**:
- **학습 목적**: 테마 시스템은 Material-UI 전체의 주제
- **복잡도**: 동적 클래스 이름 생성 및 조합

### 7단계: BottomNavigation Styled Component 제거
- `eb56ab72` - [BottomNavigation 단순화 7/10] Styled Component 제거

**무엇을**: styled() API로 생성한 BottomNavigationRoot 컴포넌트

**왜 불필요한가**:
- **학습 목적**: 인라인 스타일로도 똑같이 동작
- **복잡도**: styled() API, memoTheme() 래퍼

### 8단계: BottomNavigationAction Styled Components 제거
- `ae7018d9` - [BottomNavigation 단순화 8/10] BottomNavigationAction Styled Components 제거

**무엇을**: styled() API로 생성한 Root(ButtonBase 기반)와 Label(span) 컴포넌트

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS는 별도 학습 주제, 코드 가독성 향상
- **복잡도**: variants 배열, overridesResolver, ButtonBase 상속

### 9단계: classes, sx, className 제거
- `39eb36dd` - [BottomNavigation 단순화 9/10] classes, sx, className 제거

**무엇을**: 스타일 커스터마이징을 위한 props들

**왜 불필요한가**:
- **학습 목적**: 고정된 스타일로도 개념 이해 충분
- **복잡도**: clsx() 유틸리티, 클래스 이름 병합 로직

### 10단계: PropTypes 및 메타데이터 제거
- `c3e6d992` - [BottomNavigation 단순화 10/10] PropTypes 및 메타데이터 제거

**무엇을**: 런타임 타입 검증 및 메타데이터

**왜 불필요한가**:
- **학습 목적**: PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님
- **복잡도**: PropTypes 정의 60줄+, JSDoc 주석

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인 (BottomNavigation)** | 141줄 | 38줄 (73% 감소) |
| **코드 라인 (BottomNavigationAction)** | 236줄 | 65줄 (72% 감소) |
| **총 코드 라인** | 377줄 | 103줄 (73% 감소) |
| **Props (BottomNavigation)** | 8개 | 4개 |
| **Props (BottomNavigationAction)** | 12개 | 6개 |
| **Slot 시스템** | ✅ | ❌ |
| **Styled Components** | ✅ | ❌ (인라인 스타일) |
| **Theme 통합** | ✅ | ❌ (하드코딩) |
| **Transition 애니메이션** | ✅ | ❌ |
| **PropTypes** | ✅ | ❌ |
| **ButtonBase 상속** | ✅ | ❌ (일반 button) |
| **className, classes, sx** | ✅ | ❌ |

---

## 학습 후 다음 단계

BottomNavigation을 이해했다면:

1. **Tab** - 상단 탐색 컴포넌트 (유사한 선택 상태 관리 패턴)
2. **Tabs** - 여러 Tab을 담는 컨테이너 (유사한 자식 관리 패턴)
3. **실전 응용** - 모바일 앱 네비게이션 구현

**예시: 기본 사용**
```javascript
import React, { useState } from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';

function MyBottomNav() {
  const [value, setValue] = useState(0);

  return (
    <BottomNavigation
      value={value}
      onChange={(event, newValue) => setValue(newValue)}
      showLabels
    >
      <BottomNavigationAction label="Home" icon={<HomeIcon />} />
      <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
      <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
    </BottomNavigation>
  );
}
```

**예시: 개별 라벨 제어**
```javascript
<BottomNavigation value={value} onChange={handleChange}>
  <BottomNavigationAction label="Home" icon={<HomeIcon />} showLabel />
  <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
  <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
</BottomNavigation>
```

**예시: 커스텀 값 사용**
```javascript
<BottomNavigation value={value} onChange={handleChange}>
  <BottomNavigationAction label="Home" icon={<HomeIcon />} value="home" />
  <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} value="favorites" />
  <BottomNavigationAction label="Profile" icon={<PersonIcon />} value="profile" />
</BottomNavigation>
```
