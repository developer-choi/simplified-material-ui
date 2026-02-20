# StepIcon 컴포넌트 (원본)

> Material-UI v5의 StepIcon 컴포넌트 분석 — 161줄

---

## 무슨 기능을 하는가?

StepIcon은 **Stepper의 각 스텝에 표시되는 아이콘**입니다.
숫자(기본), 완료 체크, 오류 경고 세 가지 상태를 시각적으로 구분합니다.

### 주요 기능

1. **상태별 아이콘 분기 렌더링**
   - `completed=true` → CheckCircle 아이콘 (원형 체크)
   - `error=true` → Warning 아이콘 (경고 삼각형)
   - 기본 → 원(circle) + 숫자(text) SVG

2. **커스텀 아이콘 pass-through**
   - `icon`이 number/string이 아닌 경우 (node) → 그대로 반환
   - StepLabel이 icon prop으로 커스텀 아이콘을 넣을 수 있음

3. **상태별 색상 (테마 연동)**
   - 기본: `theme.palette.text.disabled` (회색)
   - active / completed: `theme.palette.primary.main` (파란색)
   - error: `theme.palette.error.main` (빨간색)

4. **Context 없음**
   - StepperContext, StepContext 미사용
   - 모든 상태(active, completed, error, icon)를 props로 직접 받음
   - StepLabel이 Context에서 읽어 StepIcon에 내려줌

---

## 내부 구조

### 1. 컴포넌트 구조

```
StepIcon (161줄)
 ├─ useUtilityClasses (CSS 클래스 생성)
 ├─ StepIconRoot (styled SvgIcon)
 │   ├─ error=true → <StepIconRoot as={Warning} />
 │   ├─ completed=true → <StepIconRoot as={CheckCircle} />
 │   └─ 기본 → <StepIconRoot><circle /><StepIconText>{icon}</StepIconText></StepIconRoot>
 └─ icon이 node → {icon} (pass-through)
```

### 2. Styled Components (2개)

#### StepIconRoot (25-45줄) — styled(SvgIcon)

```javascript
const StepIconRoot = styled(SvgIcon, {
  name: 'MuiStepIcon',
  slot: 'Root',
})(
  memoTheme(({ theme }) => ({
    display: 'block',
    transition: theme.transitions.create('color', {
      duration: theme.transitions.duration.shortest,
    }),
    color: (theme.vars || theme).palette.text.disabled,
    [`&.${stepIconClasses.completed}`]: {
      color: (theme.vars || theme).palette.primary.main,
    },
    [`&.${stepIconClasses.active}`]: {
      color: (theme.vars || theme).palette.primary.main,
    },
    [`&.${stepIconClasses.error}`]: {
      color: (theme.vars || theme).palette.error.main,
    },
  })),
);
```

- SvgIcon을 베이스로 확장
- CSS 클래스(`.MuiStepIcon-active` 등)로 색상 전환
- color transition 애니메이션 포함

#### StepIconText (47-56줄) — styled('text')

```javascript
const StepIconText = styled('text', {
  name: 'MuiStepIcon',
  slot: 'Text',
})(
  memoTheme(({ theme }) => ({
    fill: (theme.vars || theme).palette.primary.contrastText,
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.fontFamily,
  })),
);
```

- SVG `<text>` 요소를 styled로 감싼 것
- 숫자 텍스트의 색상(fill), 크기, 폰트 테마에서 가져옴

### 3. 분기 렌더링 로직 (72-116줄)

```javascript
// icon이 숫자 or 문자열일 때만 아이콘 그리기
if (typeof icon === 'number' || typeof icon === 'string') {
  const className = clsx(classNameProp, classes.root);

  if (error) {
    return <StepIconRoot as={Warning} className={className} ref={ref} ownerState={ownerState} {...other} />;
  }

  if (completed) {
    return <StepIconRoot as={CheckCircle} className={className} ref={ref} ownerState={ownerState} {...other} />;
  }

  // 기본: 원 + 숫자
  return (
    <StepIconRoot className={className} ref={ref} ownerState={ownerState} {...other}>
      <circle cx="12" cy="12" r="12" />
      <StepIconText x="12" y="12" textAnchor="middle" dominantBaseline="central" ownerState={ownerState}>
        {icon}
      </StepIconText>
    </StepIconRoot>
  );
}

// icon이 node면 그대로 반환 (커스텀 아이콘)
return icon;
```

**주의**: error가 completed보다 먼저 체크됨 → error 우선순위가 높음

---

## 주요 Props

| prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `active` | bool | false | 현재 활성 스텝 여부 (색상에만 영향) |
| `completed` | bool | false | 완료 여부 → CheckCircle 렌더 |
| `error` | bool | false | 오류 여부 → Warning 렌더 (최우선) |
| `icon` | node | - | number/string이면 SVG로 그림, node면 pass-through |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `className` | string | - | 추가 클래스 |
| `sx` | object | - | MUI sx prop |

---

## 설계 패턴

### 1. `as` prop으로 SvgIcon 재사용

```javascript
// Warning/CheckCircle 모두 StepIconRoot(styled SvgIcon)를 베이스로 사용
<StepIconRoot as={Warning} ... />   // Warning SVG로 교체
<StepIconRoot as={CheckCircle} ... /> // CheckCircle SVG로 교체
<StepIconRoot ...>                  // 기본 SvgIcon (원 + 숫자)
  <circle /><text />
</StepIconRoot>
```

**패턴 의도**: 세 상태가 동일한 스타일(크기, 색상, transition)을 공유하면서도 다른 SVG를 렌더

### 2. CSS 클래스 기반 상태 색상

```javascript
// styled 내부에서 클래스로 색상 구분
[`&.${stepIconClasses.active}`]: { color: theme.palette.primary.main },
[`&.${stepIconClasses.error}`]: { color: theme.palette.error.main },
```

클래스: `MuiStepIcon-root`, `MuiStepIcon-active`, `MuiStepIcon-completed`, `MuiStepIcon-error`, `MuiStepIcon-text`

### 3. icon 타입 체크로 커스텀 아이콘 분기

```javascript
if (typeof icon === 'number' || typeof icon === 'string') {
  // ... SVG 렌더링
}
return icon; // node면 그대로
```

StepLabel은 `icon={index + 1}` (숫자)를 기본값으로 넘기고,
사용자가 `<StepLabel icon={<MyIcon />}>`로 오버라이드할 수 있음

---

## 복잡도의 이유

### 1. Styled Components + memoTheme (32줄)

```javascript
// StepIconRoot: SvgIcon styled 정의 (21줄)
// StepIconText: text styled 정의 (11줄)
const StepIconRoot = styled(SvgIcon, { name: ..., slot: ... })(memoTheme(...));
const StepIconText = styled('text', { name: ..., slot: ... })(memoTheme(...));
```

- `memoTheme`: 테마 기반 스타일 메모이제이션
- `styled(SvgIcon)`: 상속 구조 (SvgIcon → Warning/CheckCircle 교체)
- CSS 클래스 기반 상태 색상

### 2. useUtilityClasses / composeClasses (10줄)

```javascript
const useUtilityClasses = (ownerState) => {
  const slots = {
    root: ['root', active && 'active', completed && 'completed', error && 'error'],
    text: ['text'],
  };
  return composeClasses(slots, getStepIconUtilityClass, classes);
};
```

### 3. ownerState 전달 (5줄)

```javascript
const ownerState = { ...props, active, completed, error };
// StepIconRoot와 StepIconText 모두에 ownerState 전달
```

### 4. PropTypes (42줄)

6개 props의 타입 검증 + JSDoc 주석

### 5. color transition 애니메이션

```javascript
transition: theme.transitions.create('color', {
  duration: theme.transitions.duration.shortest,
}),
```
