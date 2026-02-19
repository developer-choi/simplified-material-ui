# SpeedDialIcon 컴포넌트

> open 상태에 따라 아이콘을 45도 회전시키는 SpeedDial 전용 아이콘 래퍼

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "상세 학습 가이드"입니다.**

라이브러리 코드는 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

> **원본 구조 파악**: 원본 코드의 빠른 이해는 `SpeedDialIcon-original.md` 참고

---

## 무슨 기능을 하는가?

수정된 SpeedDialIcon은 **open prop에 따라 아이콘을 45도 회전(+ → ×)시키는 애니메이션을 제공하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **아이콘 회전 애니메이션** - `open=true`이면 45도 회전 (+ 모양이 × 모양으로), `open=false`이면 원위치
2. **커스텀 아이콘 지원** - `icon` prop으로 기본 AddIcon(+) 대신 다른 아이콘 사용 가능

---

## 핵심 학습 포인트

이 컴포넌트에서 배울 수 있는 **핵심 개념과 패턴**을 코드와 함께 설명합니다.

### 1. React.cloneElement로 기존 엘리먼트에 props 주입

```javascript
const iconElement = iconProp
  ? React.isValidElement(iconProp)
    ? React.cloneElement(iconProp, { style: { ...iconStyle, ...iconProp.props.style } })
    : iconProp
  : <AddIcon style={iconStyle} />;
```

**학습 가치**:
- `React.cloneElement`는 이미 생성된 React 엘리먼트를 복제하면서 새로운 props를 추가/덮어쓸 수 있음
- 부모 컴포넌트가 자식의 구체적인 타입을 모르면서도 스타일이나 props를 주입할 수 있는 패턴
- `React.isValidElement` 체크로 유효한 React 엘리먼트만 clone하고, 문자열 등은 그대로 반환

### 2. CSS transition으로 선언적 애니메이션

```javascript
const iconStyle = {
  transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
};
```

**학습 가치**:
- JavaScript에서 명령형으로 애니메이션하지 않고, CSS transition + 상태 변경만으로 부드러운 애니메이션 구현
- `cubic-bezier(0.4, 0, 0.2, 1)`은 Material Design의 표준 이징 커브 (빠르게 시작, 천천히 끝남)
- React의 리렌더링 → style 변경 → 브라우저가 자동으로 transition 적용하는 흐름

### 3. muiName 정적 속성

```javascript
SpeedDialIcon.muiName = 'SpeedDialIcon';
```

**학습 가치**:
- MUI 내부에서 `isMuiElement(icon, ['SpeedDialIcon'])`으로 컴포넌트 타입을 식별하는 데 사용
- 부모 컴포넌트(SpeedDial)가 children의 타입을 런타임에 확인하여 특별한 처리를 할 수 있게 해주는 패턴
- `displayName`과 달리 프로덕션에서도 유지되므로, 빌드 후에도 안정적으로 타입 식별 가능

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/SpeedDialIcon/SpeedDialIcon.js (29줄, 원본 155줄)

SpeedDialIcon (forwardRef)
  └─> <span>  ← 아이콘 래퍼 (height: 24)
       └─> iconElement  ← AddIcon(기본) 또는 커스텀 아이콘 (회전 스타일 적용)
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `iconStyle` | 변수 | open 상태에 따른 회전 transform + transition CSS 객체 |
| `iconElement` | 변수 | 최종 렌더링할 아이콘 엘리먼트 (커스텀 or 기본 AddIcon) |

### 3. 함수 역할

이 컴포넌트는 별도의 함수가 없으며, 렌더링 로직이 인라인으로 작성되어 있습니다.

아이콘 결정 로직은 삼항 연산자 체인으로 처리됩니다:

```javascript
const iconElement = iconProp
  ? React.isValidElement(iconProp)        // 1. icon prop이 있는가?
    ? React.cloneElement(iconProp, {...})  //    → React 엘리먼트면 style 주입
    : iconProp                             //    → 아니면 그대로 사용
  : <AddIcon style={iconStyle} />;         // 2. 없으면 기본 AddIcon
```

### 4. 동작 흐름

#### 아이콘 회전 플로우차트

```
SpeedDial이 open 상태 변경
        ↓
SpeedDialIcon에 open prop 전달
        ↓
┌─────────────────────────────────┐
│ open === true ?                 │──→ YES → transform: 'rotate(45deg)'  (+ → ×)
└─────────────────────────────────┘
        ↓ NO
transform: 'rotate(0deg)'  (× → +)
        ↓
CSS transition이 자동으로 200ms 애니메이션 적용
```

#### 시나리오 예시

**시나리오 1: SpeedDial 열기**
```
사용자 FAB 클릭 → SpeedDial open=true → SpeedDialIcon open=true
→ iconStyle.transform = 'rotate(45deg)' → 아이콘이 200ms에 걸쳐 45도 회전
```

**시나리오 2: 커스텀 아이콘 사용**
```
<SpeedDialIcon icon={<EditIcon />} open={true} />
→ React.isValidElement(<EditIcon />) === true
→ React.cloneElement(EditIcon, { style: { transition, transform: 'rotate(45deg)' } })
→ EditIcon이 45도 회전된 채로 렌더링
```

### 5. 핵심 패턴/플래그

#### muiName 패턴

- **비유**: "명찰"
- **역할**: 부모(SpeedDial)가 children 중에서 SpeedDialIcon을 식별하기 위한 정적 속성

**왜 필요한가?**

```javascript
// SpeedDial.js에서의 사용
if (React.isValidElement(icon) && isMuiElement(icon, ['SpeedDialIcon'])) {
  React.cloneElement(icon, { open });  // SpeedDialIcon에만 open prop 주입
}
```

SpeedDial은 `icon` prop으로 받은 엘리먼트가 SpeedDialIcon인지 확인하고, 맞으면 `open` prop을 자동으로 전달합니다. 이 식별이 없으면 SpeedDial이 아이콘에 open 상태를 전달할 수 없습니다.

### 6. 주요 변경 사항 (원본 대비)

```javascript
// 원본: styled 컴포넌트 + memoTheme + variants로 조건부 스타일링
const SpeedDialIconRoot = styled('span', {
  name: 'MuiSpeedDialIcon',
  slot: 'Root',
  overridesResolver: (props, styles) => { ... },
})(
  memoTheme(({ theme }) => ({
    height: 24,
    [`& .${speedDialIconClasses.icon}`]: {
      transition: theme.transitions.create(['transform', 'opacity'], { ... }),
    },
    variants: [{ props: ..., style: ... }],
  })),
);

// 단순화: inline style + 직접 조건부 transform
const iconStyle = {
  transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
};
return (
  <span style={{ height: 24 }}>{iconElement}</span>
);
```

**원본과의 차이**:
- ❌ `openIcon` prop 제거 → 항상 같은 아이콘이 회전만 함
- ❌ `classes` prop 제거 → 클래스 기반 커스터마이징 불가
- ❌ `sx` prop 제거 → 시스템 스타일 불가
- ❌ styled 컴포넌트 제거 → inline styles로 대체
- ❌ Theme 시스템 제거 → transition 값 하드코딩
- ❌ PropTypes 제거 → TypeScript로 대체 가능
- ✅ `icon` prop 유지 → 커스텀 아이콘 전달 가능
- ✅ `open` 상태에 따른 회전 애니메이션 유지 → 핵심 기능
- ✅ `muiName` 유지 → 부모(SpeedDial)와의 연동 필수

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | - | SpeedDial의 열림 상태. true면 아이콘 45도 회전 |
| `icon` | ReactNode | `<AddIcon />` | 표시할 아이콘. 생략 시 기본 + 아이콘 |
| `className` | string | - | 루트 span에 적용할 추가 CSS 클래스 |

**제거된 Props**:
- ❌ `openIcon` - open 상태의 별도 아이콘 커스터마이징은 학습 범위 외
- ❌ `classes` - MUI 유틸리티 클래스 커스터마이징 시스템 제거
- ❌ `sx` - styled 시스템 제거로 함께 제거

---

## 커밋 히스토리로 보는 단순화 과정

SpeedDialIcon은 **5개의 커밋**을 통해 단순화되었습니다.

### 1단계: openIcon prop 제거

- `e7479f6707` - [SpeedDialIcon 단순화 1/5] openIcon prop 제거

**삭제된 코드**:
```javascript
// openIcon 관련 스타일 (opacity/transform 전환)
[`& .${speedDialIconClasses.openIcon}`]: {
  position: 'absolute',
  transition: theme.transitions.create(['transform', 'opacity'], { ... }),
  opacity: 0,
  transform: 'rotate(-45deg)',
},
// openIcon이 있고 open일 때 기본 아이콘 숨기기
{ props: ({ ownerState }) => ownerState.open && ownerState.openIcon,
  style: { [`& .${speedDialIconClasses.icon}`]: { opacity: 0 } } },
```

**왜 불필요한가**:
- **학습 목적**: 두 아이콘 간 opacity 크로스페이드는 고급 커스터마이징이며, 핵심인 회전 애니메이션 학습에 불필요
- **복잡도**: 3개 클래스(iconWithOpenIconOpen, openIcon, openIconOpen) + 2개 variant 제거

### 2단계: useUtilityClasses 및 classes prop 제거

- `9689711a07` - [SpeedDialIcon 단순화 2/5] useUtilityClasses 및 classes prop 제거

**삭제된 코드**:
```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, open } = ownerState;
  const slots = { root: ['root'], icon: ['icon', open && 'iconOpen'] };
  return composeClasses(slots, getSpeedDialIconUtilityClass, classes);
};
```

**왜 불필요한가**:
- **학습 목적**: MUI 내부 클래스 생성 인프라는 컴포넌트 동작과 무관
- **복잡도**: composeClasses, getSpeedDialIconUtilityClass import + 함수 정의 제거

### 3단계: Theme 시스템 제거

- `e351d54bd8` - [SpeedDialIcon 단순화 3/5] Theme 시스템 제거

**삭제된 코드**:
```javascript
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
// ...
memoTheme(({ theme }) => ({
  transition: theme.transitions.create(['transform', 'opacity'], {
    duration: theme.transitions.duration.short,
  }),
}))
```

**왜 불필요한가**:
- **학습 목적**: theme.transitions.create()는 CSS transition 문자열을 만드는 유틸리티일 뿐
- **복잡도**: 하드코딩 `'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)'`로 동일한 결과

### 4단계: styled 컴포넌트 → inline styles

- `34f85214f2` - [SpeedDialIcon 단순화 4/5] styled 컴포넌트 → inline styles

**삭제된 코드**:
```javascript
const SpeedDialIconRoot = styled('span', {
  name: 'MuiSpeedDialIcon',
  slot: 'Root',
})({
  height: 24,
  [`& .${speedDialIconClasses.icon}`]: { ... },
  variants: [{ props: ..., style: ... }],
});
```

**왜 불필요한가**:
- **학습 목적**: styled API, variants 배열, ownerState는 MUI 스타일링 시스템 학습이지 컴포넌트 로직이 아님
- **복잡도**: 27줄의 styled 정의 → `<span style={{ height: 24 }}>` 한 줄로 대체

### 5단계: PropTypes 제거

- `483f7a3ea1` - [SpeedDialIcon 단순화 5/5] PropTypes 제거

**삭제된 코드**:
```javascript
SpeedDialIcon.propTypes = {
  classes: PropTypes.object,
  className: PropTypes.string,
  icon: PropTypes.node,
  open: PropTypes.bool,
  sx: PropTypes.oneOfType([...]),
};
```

**왜 불필요한가**:
- **학습 목적**: 런타임 타입 검증 메타데이터로 컴포넌트 동작과 무관
- **복잡도**: 18줄의 PropTypes 블록 제거

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 155줄 | 29줄 (81% 감소) |
| **Props 개수** | 6개 | 3개 |
| **openIcon 전환** | ✅ | ❌ |
| **classes 커스터마이징** | ✅ | ❌ |
| **Theme 연동** | ✅ | ❌ |
| **styled 컴포넌트** | ✅ | ❌ (inline styles) |
| **아이콘 회전 애니메이션** | ✅ | ✅ |
| **커스텀 icon** | ✅ | ✅ |

---

## 학습 후 다음 단계

SpeedDialIcon을 이해했다면:

1. **SpeedDialAction** - SpeedDial의 개별 액션 버튼. Tooltip 연동과 순차 애니메이션(transitionDelay) 학습
2. **SpeedDial** - 오케스트레이터 컴포넌트. children(SpeedDialAction)에 props를 cloneElement로 주입하는 패턴, 키보드 네비게이션 학습
3. **실전 응용** - forwardRef + cloneElement 패턴으로 자식 컴포넌트에 자동으로 props를 주입하는 래퍼 컴포넌트 만들기

**예시: 기본 사용**
```javascript
<SpeedDial ariaLabel="actions" icon={<SpeedDialIcon />}>
  <SpeedDialAction icon={<SaveIcon />} tooltipTitle="Save" />
</SpeedDial>
```

**예시: 커스텀 아이콘**
```javascript
<SpeedDial ariaLabel="actions" icon={<SpeedDialIcon icon={<EditIcon />} />}>
  <SpeedDialAction icon={<SaveIcon />} tooltipTitle="Save" />
</SpeedDial>
```
