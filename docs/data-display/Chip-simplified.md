# Chip 컴포넌트

> Chip을 최소한의 기능만 남기고 단순화 - 인라인 스타일로 전환

---

## 무슨 기능을 하는가?

단순화된 Chip은 **작은 블록으로 정보(태그, 라벨)를 표시하고 삭제할 수 있는 단순한 컴포넌트**입니다.

### 핵심 기능 (남은 것)

1. **라벨 텍스트 표시**
   - label prop으로 텍스트 표시
   - 텍스트 오버플로우 시 말줄임(...) 처리

2. **아바타/아이콘 표시** (선택)
   - avatar 또는 icon prop으로 앞에 시각적 요소 추가
   - React.cloneElement로 스타일 병합
   - 둘 중 하나만 사용 가능 (동시 사용 시 console.error)

3. **삭제 기능** (선택)
   - onDelete prop이 있으면 CancelIcon 자동 표시
   - 클릭 시 이벤트 전파 차단 (stopPropagation)
   - Backspace/Delete 키로도 삭제 가능

4. **클릭 이벤트 처리** (선택)
   - onClick prop이 있으면 자동으로 clickable
   - clickable 또는 onDelete 시 ButtonBase 사용

5. **기본 스타일** (고정)
   - 크기: medium (32px 높이) 고정
   - 색상: primary (#1976d2 배경, #fff 텍스트) 고정
   - 모양: filled (배경 채움) 고정
   - 삭제 아이콘: CancelIcon 고정

---

## 핵심 학습 포인트

### 1. 동적 Component 선택

```javascript
const clickable = !!onClick;
const Component = clickable || onDelete ? ButtonBase : 'div';
```

**학습 가치**:
- 조건부 컴포넌트 타입 결정
- ButtonBase로 접근성 향상 (포커스, 키보드 이벤트)
- 인터랙티브 여부에 따른 적절한 요소 선택

### 2. React.cloneElement 패턴

```javascript
if (avatarProp && React.isValidElement(avatarProp)) {
  const avatarStyle = {
    marginLeft: 5,
    marginRight: -6,
    width: 24,
    height: 24,
    color: '#fff',
    fontSize: '0.75rem',
  };
  avatar = React.cloneElement(avatarProp, {
    style: { ...avatarStyle, ...avatarProp.props.style },
  });
}
```

**학습 가치**:
- 외부에서 전달받은 React element에 props 추가
- 스타일 병합 (기본 스타일 + 사용자 스타일)
- React.isValidElement로 안전성 검증

### 3. 이벤트 전파 제어

```javascript
const handleDeleteIconClick = (event) => {
  event.stopPropagation(); // Chip 클릭 이벤트 전파 방지
  if (onDelete) {
    onDelete(event);
  }
};
```

**학습 가치**:
- 중첩된 클릭 이벤트 제어
- 삭제 아이콘 클릭 시 Chip onClick 호출 방지
- 이벤트 버블링 차단

### 4. 키보드 삭제 처리 (2단계)

```javascript
// 1단계: keyDown에서 preventDefault (브라우저 기본 동작 방지)
const handleKeyDown = (event) => {
  if (event.currentTarget === event.target && isDeleteKeyboardEvent(event)) {
    event.preventDefault(); // 브라우저가 뒤로가기 등을 실행하지 않도록
  }
};

// 2단계: keyUp에서 실제 삭제
const handleKeyUp = (event) => {
  if (event.currentTarget === event.target) {
    if (onDelete && isDeleteKeyboardEvent(event)) {
      onDelete(event);
    }
  }
};
```

**학습 가치**:
- keyDown vs keyUp 분리 이유
- event.currentTarget === event.target (자식 이벤트 무시)
- 키보드 접근성 제공

### 5. 인라인 스타일 병합

```javascript
const rootStyle = {
  maxWidth: '100%',
  fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: '0.8125rem',
  // ...
  cursor: clickable ? 'pointer' : 'unset',
  userSelect: clickable ? 'none' : 'auto',
  ...style, // 사용자 스타일 병합
};
```

**학습 가치**:
- 조건부 스타일 적용 (clickable)
- 객체 spread로 스타일 오버라이드 허용
- CSS-in-JS 없이도 동적 스타일 가능

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Chip/Chip.js (158줄, 원본 680줄)
Chip (forwardRef)
  ├─ isDeleteKeyboardEvent (6-8줄) - Backspace/Delete 키 감지
  ├─ handleDeleteIconClick (22-28줄) - 삭제 아이콘 클릭
  ├─ handleKeyDown (30-37줄) - 키보드 preventDefault
  ├─ handleKeyUp (39-46줄) - 키보드 삭제
  ├─ clickable 계산 (48줄)
  ├─ Component 선택 (49줄) - ButtonBase 또는 div
  │
  ├─ deleteIcon 렌더링 (51-61줄)
  │   └─ onDelete 있을 때만 CancelIcon
  │
  ├─ avatar 렌더링 (63-76줄)
  │   └─ React.cloneElement로 스타일 병합
  │
  ├─ icon 렌더링 (78-88줄)
  │   └─ React.cloneElement로 스타일 병합
  │
  ├─ 개발 모드 경고 (90-97줄)
  │   └─ avatar와 icon 동시 사용 에러
  │
  ├─ rootStyle, labelStyle (99-130줄) - 인라인 스타일
  ├─ componentProps 생성 (132-147줄)
  │
  └─ 렌더링 (149-155줄)
      └─> Component (ButtonBase 또는 div)
           ├─> avatar 또는 icon
           ├─> span (labelStyle)
           │    └─> label
           └─> deleteIcon
```

### 2. 조건부 렌더링 로직

**deleteIcon** (51-61줄)
```javascript
let deleteIcon = null;
if (onDelete) {
  const deleteIconStyle = {
    WebkitTapHighlightColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 22,
    cursor: 'pointer',
    margin: '0 5px 0 -6px',
  };
  deleteIcon = <CancelIcon onClick={handleDeleteIconClick} style={deleteIconStyle} />;
}
```

> **💡 원본과의 차이**:
> - ❌ `deleteIcon` prop 제거 → 항상 CancelIcon 사용
> - ❌ React.cloneElement 제거 (커스텀 아이콘 불가)

**avatar/icon** (63-88줄)
```javascript
let avatar = null;
if (avatarProp && React.isValidElement(avatarProp)) {
  const avatarStyle = {
    marginLeft: 5,
    marginRight: -6,
    width: 24,
    height: 24,
    color: '#fff',
    fontSize: '0.75rem',
  };
  avatar = React.cloneElement(avatarProp, {
    style: { ...avatarStyle, ...avatarProp.props.style },
  });
}

// icon도 동일한 패턴
```

> **💡 원본과의 차이**:
> - ❌ className 병합 제거 → style만 병합
> - ✅ avatar와 icon 모두 유지 (둘 중 하나만 사용)

### 3. ButtonBase 통합

```javascript
const componentProps = {
  ref,
  className,
  style: rootStyle,
  onClick,
  onKeyDown: handleKeyDown,
  onKeyUp: handleKeyUp,
  ...other,
};

if (Component === ButtonBase) {
  componentProps.component = 'div';
  if (onDelete) {
    componentProps.disableRipple = true; // 삭제 시 ripple 제거
  }
}
```

> **💡 원본과의 차이**:
> - ❌ `disabled`, `tabIndex`, `skipFocusWhenDisabled` 제거
> - ✅ onClick, onDelete 여부로만 ButtonBase 결정

### 4. Props (7개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `label` | node | - | 칩에 표시할 텍스트 (필수) |
| `onClick` | func | - | 클릭 이벤트 핸들러 (옵션) |
| `onDelete` | func | - | 삭제 이벤트 핸들러 (옵션, 설정 시 삭제 아이콘 표시) |
| `avatar` | element | - | 아바타 요소 (옵션, icon과 동시 사용 불가) |
| `icon` | element | - | 아이콘 요소 (옵션, avatar와 동시 사용 불가) |
| `className` | string | - | CSS 클래스 (옵션) |
| `style` | object | - | 인라인 스타일 오버라이드 (옵션) |

---

## 커밋 히스토리로 보는 단순화 과정

Chip은 **15개의 커밋**을 통해 단순화되었습니다.

### 1단계: 커스터마이징 시스템 제거 (Commit 1-2)

- `6fa2a20987` - [Chip 단순화 1/15] Slot 시스템 제거
  - useSlot() 훅 2번 제거 (root, label)
  - slots, slotProps prop 제거
  - externalForwardedProps, getSlotProps 제거
  - **이유**: Slot 시스템은 고급 커스터마이징 도구로, 학습 목적에서는 고정된 구조가 더 명확함

- `271732f85e` - [Chip 단순화 2/15] component prop 제거
  - component prop 제거
  - clickable/onDelete 여부로만 ButtonBase/div 결정
  - **이유**: Chip의 핵심은 "태그 표시"이지 "루트 태그 변경"이 아님

### 2단계: 스타일 변형 제거 (Commit 3-5)

- `767b1671d4` - [Chip 단순화 3/15] size prop 제거 (medium 고정)
  - size: small/medium → medium (32px) 고정
  - variants 배열의 size 처리 제거
  - **이유**: 하나의 크기만 있어도 Chip 개념 이해 충분

- `069ebf6aa5` - [Chip 단순화 4/15] variant prop 제거 (filled 고정)
  - variant: filled/outlined → filled 고정
  - outlined 스타일 블록 (34줄) 제거
  - **이유**: filled가 기본이고 더 많이 사용됨

- `385cd84e34` - [Chip 단순화 5/15] color prop 제거 (primary 고정)
  - color: 7가지 → primary (#1976d2) 고정
  - Object.entries(theme.palette).filter() 로직 제거
  - 100줄 이상의 color 관련 variants 제거
  - **이유**: 7가지 색상은 학습에 과함, 하나의 색상으로도 충분

### 3단계: 커스터마이징 Props 제거 (Commit 6-9)

- `36c7684978` - [Chip 단순화 6/15] deleteIcon prop 제거
  - deleteIcon prop 제거
  - 항상 CancelIcon만 사용
  - React.cloneElement 제거
  - **이유**: Chip의 핵심은 "삭제 기능"이지 "삭제 아이콘 커스터마이징"이 아님

- `289feeae67` - [Chip 단순화 7/15] clickable prop 제거 (자동 계산)
  - clickable prop 제거
  - `const clickable = !!onClick;`로 자동 계산
  - **이유**: onClick이 있으면 자동으로 clickable이어야 함

- `95c91b50c1` - [Chip 단순화 8/15] disabled 관련 props 제거
  - disabled, skipFocusWhenDisabled, tabIndex props 제거
  - disabled 관련 조건부 로직 제거
  - **이유**: 활성 상태만 있어도 충분, disabled는 고급 기능

- `abeb1d7fbe` - [Chip 단순화 9/15] onKeyDown, onKeyUp props 제거
  - 외부 onKeyDown, onKeyUp 핸들러 제거
  - 내부 handleKeyDown, handleKeyUp은 유지 (Backspace/Delete 삭제)
  - **이유**: Chip의 핵심 키보드 동작은 Backspace/Delete 삭제만 있으면 됨

### 4단계: React 고급 기능 제거 (Commit 10)

- `ada652a5b8` - [Chip 단순화 10/15] useForkRef 제거
  - useForkRef 제거
  - ref 직접 전달
  - chipRef.current (내부 ref) 제거
  - **이유**: ref 병합은 React의 고급 주제, 단순한 ref 하나로도 충분

### 5단계: Theme 시스템 제거 (Commit 11-13)

- `94f5337ba6` - [Chip 단순화 11/15] useDefaultProps 제거
  - useDefaultProps 훅 제거
  - 테마에서 기본 props 가져오기 제거
  - **이유**: 테마 시스템은 복잡한 주제, 파라미터 기본값이 더 명확

- `94ccc76ca6` - [Chip 단순화 12/15] useUtilityClasses, composeClasses 제거
  - useUtilityClasses 함수 (28줄) 제거
  - composeClasses, getChipUtilityClass, capitalize 제거
  - classes 객체 사용 (className={classes.root} 등) 제거
  - **이유**: 클래스 이름 생성은 스타일 시스템용, 인라인 스타일에서는 불필요

- `7ed0dcefde` - [Chip 단순화 13/15] memoTheme 제거 및 스타일 하드코딩
  - memoTheme 래퍼 제거
  - theme.palette → 하드코딩된 색상 (#1976d2, #fff)
  - theme.typography → 하드코딩된 폰트
  - theme.transitions → 애니메이션 제거
  - **이유**: 테마 시스템은 복잡, 하드코딩된 값으로도 Chip 이해 가능

### 6단계: Styled Components 제거 (Commit 14)

- `b321b55645` - [Chip 단순화 14/15] Styled Components 제거
  - ChipRoot, ChipLabel styled components 제거 (117줄)
  - overridesResolver, variants 배열 (200줄 이상) 제거
  - 인라인 style 객체로 대체
  - 일반 div, span으로 변경
  - **이유**: CSS-in-JS는 별도 학습 주제, 인라인 스타일로도 똑같이 동작

### 7단계: PropTypes 제거 (Commit 15)

- `22671e26e1` - [Chip 단순화 15/15] PropTypes 및 메타데이터 제거
  - PropTypes import 및 정의 (130줄) 제거
  - Chip.propTypes 전체 제거
  - unsupportedProp 제거
  - JSDoc 주석 제거
  - **이유**: PropTypes는 타입 검증 도구로, TypeScript 사용 시 불필요

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 680줄 | 158줄 (77% 감소) |
| **Props 개수** | 18개 | 7개 |
| **size 변형** | 2가지 (small, medium) | ❌ medium 고정 |
| **color 변형** | 7가지 | ❌ primary 고정 |
| **variant 변형** | 2가지 (filled, outlined) | ❌ filled 고정 |
| **Styled Components** | ✅ ChipRoot, ChipLabel | ❌ 인라인 스타일 |
| **Slot 시스템** | ✅ useSlot | ❌ |
| **Theme 통합** | ✅ useDefaultProps, useUtilityClasses | ❌ |
| **deleteIcon 커스터마이징** | ✅ | ❌ CancelIcon 고정 |
| **disabled 상태** | ✅ | ❌ |
| **clickable prop** | ✅ | ❌ 자동 계산 |
| **ref 병합** | ✅ useForkRef | ❌ 직접 전달 |
| **PropTypes** | ✅ | ❌ |
| **핵심 기능** | ✅ label, onClick, onDelete, avatar/icon, 키보드 삭제 | ✅ 유지 |

---

## 학습 후 다음 단계

Chip을 이해했다면:

1. **AvatarGroup** - 여러 Avatar를 겹쳐서 표시하는 컨테이너 컴포넌트
2. **Badge** - 아이콘이나 아바타에 뱃지를 추가하는 컴포넌트
3. **실전 응용** - 태그 입력 필드 만들기 (여러 Chip 관리)

### 예시: 기본 사용

```javascript
import Chip from './Chip';
import Avatar from './Avatar';
import HomeIcon from './HomeIcon';

// 기본 Chip
<Chip label="React" />

// 클릭 가능한 Chip
<Chip label="JavaScript" onClick={() => console.log('clicked')} />

// 삭제 가능한 Chip
<Chip label="TypeScript" onDelete={() => console.log('deleted')} />

// Avatar가 있는 Chip
<Chip
  label="John Doe"
  avatar={<Avatar src="/john.jpg" alt="John" />}
  onDelete={() => console.log('deleted')}
/>

// Icon이 있는 Chip
<Chip
  label="Home"
  icon={<HomeIcon />}
  onClick={() => console.log('clicked')}
/>
```

### 예시: 태그 입력 필드

```javascript
function TagInput() {
  const [tags, setTags] = React.useState(['React', 'JavaScript', 'CSS']);
  const [input, setInput] = React.useState('');

  const handleDelete = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleAdd = () => {
    if (input && !tags.includes(input)) {
      setTags([...tags, input]);
      setInput('');
    }
  };

  return (
    <div>
      {tags.map(tag => (
        <Chip
          key={tag}
          label={tag}
          onDelete={() => handleDelete(tag)}
          style={{ margin: 4 }}
        />
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
      />
    </div>
  );
}
```

### 예시: 커스터마이징 (style prop)

```javascript
// 색상 커스터마이징
<Chip
  label="Success"
  style={{ backgroundColor: '#4caf50' }}
/>

<Chip
  label="Error"
  style={{ backgroundColor: '#f44336' }}
/>

// 크기 커스터마이징
<Chip
  label="Small"
  style={{ height: 24, fontSize: '0.75rem' }}
/>

<Chip
  label="Large"
  style={{ height: 48, fontSize: '1rem', borderRadius: 24 }}
/>
```
