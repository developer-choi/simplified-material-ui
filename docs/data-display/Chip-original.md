# Chip 컴포넌트

> Material-UI의 Chip 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Chip는 **작은 블록으로 복잡한 엔티티(연락처, 태그, 라벨 등)를 표시하는** 컴포넌트입니다.

> **💡 작성 주의**: Chip 자체는 단일 태그/라벨을 표시하는 역할만 합니다. 여러 Chip을 관리하는 것은 상위 컴포넌트의 책임입니다.

### 핵심 기능
1. **라벨 텍스트 표시** - label prop으로 텍스트 표시
2. **아바타/아이콘 표시** - avatar 또는 icon prop으로 앞에 시각적 요소 추가 (둘 중 하나만 가능)
3. **삭제 기능** - onDelete prop이 있으면 삭제 아이콘 표시 및 Backspace/Delete 키 지원
4. **클릭 이벤트 처리** - onClick prop이 있거나 clickable이 true면 ButtonBase 사용하여 클릭 가능
5. **다양한 스타일 변형** - size (2가지), color (7가지), variant (2가지) 조합으로 28가지 스타일

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Chip/Chip.js (680줄)
Chip (forwardRef)
  ├─ useDefaultProps (테마에서 기본 props 가져오기)
  ├─ useForkRef (chipRef와 외부 ref 병합)
  ├─ clickable 계산 (onClick 또는 clickableProp)
  ├─ component 선택 (clickable || onDelete ? ButtonBase : ComponentProp || 'div')
  ├─ ownerState 생성 (props 상태 객체)
  ├─ useUtilityClasses (CSS 클래스 이름 생성)
  ├─ moreProps (ButtonBase용 추가 props)
  │
  ├─ deleteIcon 렌더링 (onDelete가 있을 때)
  │   ├─ deleteIconProp이 있으면 React.cloneElement로 복제
  │   └─ 없으면 CancelIcon 사용
  │
  ├─ avatar 렌더링 (avatarProp이 있을 때)
  │   └─ React.cloneElement로 className 추가
  │
  ├─ icon 렌더링 (iconProp이 있을 때)
  │   └─ React.cloneElement로 className 추가
  │
  └─ useSlot('root') 및 useSlot('label')로 렌더링
      └─> RootSlot (ChipRoot - styled ButtonBase 또는 div)
           ├─> avatar 또는 icon
           ├─> LabelSlot (ChipLabel - styled span)
           │    └─> label
           └─> deleteIcon
```

### 2. Styled Components

**ChipRoot** (48-319줄)
- `styled('div')` 또는 ButtonBase 기반
- overridesResolver: 60줄 (테마 오버라이드 지원)
- memoTheme: 테마 값 메모이제이션
- variants 배열: 200줄 이상 (size, color, variant 조합)

**ChipLabel** (321-359줄)
- `styled('span')` 기반
- overflow/textOverflow 처리 (텍스트 말줄임)
- variants: size, variant별 padding 조정

### 3. 이벤트 핸들러

**handleDeleteIconClick** (396-402줄)
```javascript
const handleDeleteIconClick = (event) => {
  event.stopPropagation(); // Chip 클릭 이벤트 전파 방지
  if (onDelete) {
    onDelete(event);
  }
};
```

**handleKeyDown** (404-415줄)
- Backspace/Delete 키 감지
- event.preventDefault()로 브라우저 기본 동작 방지
- 외부 onKeyDown 핸들러 호출

**handleKeyUp** (417-428줄)
- Backspace/Delete 키에서 onDelete 호출
- 외부 onKeyUp 핸들러 호출

### 4. 조건부 렌더링 로직

**deleteIcon** (457-468줄)
```javascript
let deleteIcon = null;
if (onDelete) {
  deleteIcon =
    deleteIconProp && React.isValidElement(deleteIconProp) ? (
      React.cloneElement(deleteIconProp, {
        className: clsx(deleteIconProp.props.className, classes.deleteIcon),
        onClick: handleDeleteIconClick,
      })
    ) : (
      <CancelIcon className={classes.deleteIcon} onClick={handleDeleteIconClick} />
    );
}
```

**avatar/icon** (470-482줄)
```javascript
let avatar = null;
if (avatarProp && React.isValidElement(avatarProp)) {
  avatar = React.cloneElement(avatarProp, {
    className: clsx(classes.avatar, avatarProp.props.className),
  });
}

let icon = null;
if (iconProp && React.isValidElement(iconProp)) {
  icon = React.cloneElement(iconProp, {
    className: clsx(classes.icon, iconProp.props.className),
  });
}
```

**개발 모드 경고** (484-491줄)
- avatar와 icon이 동시에 있으면 console.error

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `label` | node | - | 칩에 표시할 텍스트 |
| `avatar` | element | - | 아바타 요소 (React element) |
| `icon` | element | - | 아이콘 요소 (React element) |
| `deleteIcon` | element | - | 커스텀 삭제 아이콘 (기본: CancelIcon) |
| `onClick` | func | - | 클릭 이벤트 핸들러 |
| `onDelete` | func | - | 삭제 이벤트 핸들러 (설정 시 삭제 아이콘 표시) |
| `onKeyDown` | func | - | 키보드 keydown 이벤트 핸들러 |
| `onKeyUp` | func | - | 키보드 keyup 이벤트 핸들러 |
| `size` | 'small' \| 'medium' | 'medium' | 칩 크기 (24px vs 32px) |
| `color` | string | 'default' | 칩 색상 (default/primary/secondary/error/info/success/warning) |
| `variant` | 'filled' \| 'outlined' | 'filled' | 칩 스타일 (배경 채움 vs 테두리만) |
| `clickable` | boolean | - | 클릭 가능 여부 (onClick이 있으면 자동 true) |
| `disabled` | boolean | false | 비활성화 상태 |
| `component` | elementType | - | 루트 요소 HTML 태그 변경 |
| `skipFocusWhenDisabled` | boolean | false | 비활성화 시 포커스 건너뛰기 |
| `tabIndex` | number | - | 탭 인덱스 |
| `slots` | object | {} | 슬롯 컴포넌트 커스터마이징 (root, label) |
| `slotProps` | object | {} | 슬롯 props 커스터마이징 |
| `className` | string | - | CSS 클래스 |
| `classes` | object | - | 유틸리티 클래스 오버라이드 |
| `sx` | object | - | 시스템 스타일 prop |

### 6. useSlot 시스템

**useSlot('root')** (498-529줄)
```javascript
const [RootSlot, rootProps] = useSlot('root', {
  elementType: ChipRoot,
  externalForwardedProps: {
    ...externalForwardedProps,
    ...other,
  },
  ownerState,
  shouldForwardComponentProp: true,
  ref: handleRef,
  className: clsx(classes.root, className),
  additionalProps: {
    disabled: clickable && disabled ? true : undefined,
    tabIndex: skipFocusWhenDisabled && disabled ? -1 : tabIndex,
    ...moreProps,
  },
  getSlotProps: (handlers) => ({
    ...handlers,
    onClick: (event) => {
      handlers.onClick?.(event);
      onClick?.(event);
    },
    onKeyDown: (event) => {
      handlers.onKeyDown?.(event);
      handleKeyDown(event);
    },
    onKeyUp: (event) => {
      handlers.onKeyUp?.(event);
      handleKeyUp(event);
    },
  }),
});
```

**useSlot('label')** (531-536줄)
```javascript
const [LabelSlot, labelProps] = useSlot('label', {
  elementType: ChipLabel,
  externalForwardedProps,
  ownerState,
  className: classes.label,
});
```

---

## 설계 패턴

1. **Slot 시스템** (Composition)
   - useSlot 훅으로 root, label 컴포넌트 커스터마이징 가능
   - slots, slotProps로 외부에서 컴포넌트 교체 가능
   - externalForwardedProps로 props 병합

2. **Styled Components** (CSS-in-JS)
   - styled() API로 ChipRoot, ChipLabel 정의
   - memoTheme으로 테마 값 메모이제이션
   - variants 배열로 조건부 스타일 (size, color, variant)
   - overridesResolver로 테마 오버라이드 지원

3. **Theme 시스템**
   - useDefaultProps로 테마에서 기본 props 가져오기
   - useUtilityClasses로 CSS 클래스 이름 생성
   - composeClasses로 클래스 병합
   - theme.palette, theme.typography, theme.transitions 활용

4. **React.cloneElement 패턴**
   - avatar, icon, deleteIcon을 React.cloneElement로 복제
   - className을 병합하여 스타일 적용
   - 외부에서 전달한 element에 추가 props 주입

5. **Component Polymorphism**
   - component prop으로 루트 요소 태그 변경 가능
   - clickable/onDelete 여부에 따라 ButtonBase 또는 div 자동 선택

---

## 복잡도의 이유

Chip은 **680줄**이며, 복잡한 이유는:

1. **Slot 시스템** (60줄)
   - useSlot 훅 2번 호출 (root, label)
   - externalForwardedProps, getSlotProps 등 복잡한 props 병합 로직
   - shouldForwardComponentProp 처리

2. **다양한 스타일 변형** (300줄+)
   - size: 2가지 (small 24px, medium 32px)
   - color: 7가지 (default, primary, secondary, error, info, success, warning)
   - variant: 2가지 (filled, outlined)
   - 각 조합마다 다른 스타일 필요 (variants 배열)
   - Object.entries(theme.palette).filter()로 동적 color 생성 (3곳)

3. **Theme 통합** (50줄)
   - useDefaultProps (테마 기본 props)
   - useUtilityClasses (28줄 - CSS 클래스 이름 생성)
   - composeClasses (클래스 병합)
   - memoTheme (테마 메모이제이션)
   - theme.palette, theme.typography, theme.transitions, theme.alpha 등 다양한 테마 값 사용

4. **조건부 렌더링 로직** (50줄)
   - deleteIcon: onDelete prop 여부 + deleteIconProp 커스터마이징
   - avatar/icon: React.cloneElement로 className 병합
   - avatar와 icon 동시 사용 경고 (개발 모드)

5. **이벤트 처리** (30줄)
   - handleDeleteIconClick: 이벤트 전파 방지
   - handleKeyDown, handleKeyUp: Backspace/Delete 키 처리
   - onClick, onKeyDown, onKeyUp 병합 (외부 핸들러 + 내부 로직)

6. **Ref 병합** (10줄)
   - useForkRef(chipRef, ref)로 내부 ref와 외부 ref 병합
   - chipRef.current로 내부 DOM 접근 가능

7. **PropTypes** (130줄)
   - 런타임 타입 검증
   - JSDoc 주석 포함

8. **동적 component 선택** (10줄)
   - clickable || onDelete ? ButtonBase : ComponentProp || 'div'
   - moreProps 객체 생성 (ButtonBase 전용 props)

9. **복잡한 스타일 계산**
   - iconColor: `React.isValidElement(iconProp) ? iconProp.props.color || color : color`
   - disabled, skipFocusWhenDisabled, tabIndex 조건부 처리
   - clickable 자동 계산: `clickableProp !== false && onClick ? true : clickableProp`

---

## 비교: Chip vs Tag

Material-UI의 Chip은 다른 라이브러리의 Tag 컴포넌트와 유사한 역할을 합니다.

| 기능 | Chip (Material-UI) | Tag (Ant Design) |
|------|-------------------|------------------|
| **스타일 변형** | size 2개, color 7개, variant 2개 | size 3개, color 12개 |
| **삭제 기능** | ✅ onDelete prop | ✅ closable prop |
| **아이콘** | ✅ avatar/icon prop | ✅ icon prop |
| **클릭 이벤트** | ✅ onClick prop | ✅ onClick prop |
| **키보드 삭제** | ✅ Backspace/Delete | ❌ |
| **커스터마이징** | ✅ Slot 시스템 | ❌ |
| **Theme 통합** | ✅ useDefaultProps, theme.palette | ✅ ConfigProvider |
| **Component 교체** | ✅ component prop | ❌ |
| **복잡도** | 680줄 | ~300줄 |

**핵심 차이점**:
- Chip은 Slot 시스템으로 더 높은 커스터마이징 제공
- Chip은 키보드 삭제 (Backspace/Delete) 지원
- Chip은 ButtonBase 통합으로 접근성 향상
- Tag는 더 단순한 구조로 빠른 학습 가능
