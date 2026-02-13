# Card 컴포넌트

> Material-UI의 Card 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Card는 **Paper 컴포넌트를 확장하여 overflow: hidden을 추가한 단순한 컨테이너** 컴포넌트입니다.

### 핵심 기능

1. **Paper 확장** - Paper의 모든 기능 상속 (elevation, variant 등)
2. **Overflow Hidden** - 카드 경계 밖으로 콘텐츠가 삐져나가지 않도록 숨김
3. **Raised 모드** - `raised={true}` 시 elevation을 8로 자동 설정

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Card/Card.js (91줄)

Card (forwardRef)
  ├─ useDefaultProps (테마에서 기본 props 가져오기)
  ├─ useUtilityClasses (CSS 클래스 이름 생성)
  │
  └─ CardRoot (styled Paper)
       ├─ elevation={raised ? 8 : undefined}
       └─ children
```

### 2. Styled Components

**CardRoot** (22-27줄)
- `styled(Paper)` 기반 - Paper를 확장
- `overflow: 'hidden'` 스타일만 추가
- name: 'MuiCard', slot: 'Root'

```javascript
const CardRoot = styled(Paper, {
  name: 'MuiCard',
  slot: 'Root',
})({
  overflow: 'hidden',
});
```

### 3. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `raised` | boolean | `false` | true 시 elevation={8} 적용 |
| `children` | node | - | 카드 내용 |
| `className` | string | - | 추가 CSS 클래스 |
| `classes` | object | - | 테마 클래스 오버라이드 |
| `sx` | object | - | 시스템 스타일 오버라이드 |

**Paper로부터 상속받는 Props**:
- `elevation` (0-24) - 그림자 깊이 (raised가 false일 때만 직접 지정 가능)
- `variant` ('elevation' | 'outlined') - 스타일 변형
- `square` (boolean) - 모서리 둥글기 제거

### 4. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getCardUtilityClass, classes);
};
```

- 단일 'root' 슬롯만 사용
- `composeClasses`로 테마 클래스와 병합

### 5. Raised Prop 로직

```javascript
elevation={raised ? 8 : undefined}
```

- `raised={true}` → elevation 8 적용 (뚜렷한 그림자)
- `raised={false}` → elevation 미지정 (Paper의 기본값 1 사용)
- `raised`와 `elevation`을 동시에 지정하면 `elevation`이 우선

### 6. PropTypes 검증

**chainPropTypes로 raised 검증**:
```javascript
raised: chainPropTypes(PropTypes.bool, (props) => {
  if (props.raised && props.variant === 'outlined') {
    return new Error('MUI: Combining `raised={true}` with `variant="outlined"` has no effect.');
  }
  return null;
}),
```

- `raised={true}` + `variant="outlined"` 조합 시 경고
- outlined 변형은 테두리만 있고 그림자가 없으므로 raised가 무의미

---

## 렌더링 로직

```javascript
const Card = React.forwardRef(function Card(inProps, ref) {
  // 1. 테마에서 기본 props 가져오기
  const props = useDefaultProps({
    props: inProps,
    name: 'MuiCard',
  });

  // 2. props 구조 분해
  const { className, raised = false, ...other } = props;

  // 3. ownerState 생성
  const ownerState = { ...props, raised };

  // 4. CSS 클래스 생성
  const classes = useUtilityClasses(ownerState);

  // 5. 렌더링
  return (
    <CardRoot
      className={clsx(classes.root, className)}
      elevation={raised ? 8 : undefined}
      ref={ref}
      ownerState={ownerState}
      {...other}
    />
  );
});
```

---

## 설계 패턴

1. **Component Extension Pattern**
   - Paper를 `styled()` 기반으로 확장
   - Paper의 모든 props를 그대로 전달

2. **Minimal Override**
   - `overflow: hidden` 스타일 하나만 추가
   - 나머지는 Paper에 위임

3. **Convenience Prop**
   - `raised` prop으로 일반적인 사용 패턴 간소화
   - `raised={true}` = `elevation={8}`의 shortcut

---

## 복잡도의 이유

Card는 **91줄**이며, 단순한 래퍼임에도 복잡한 이유는:

1. **useDefaultProps** (4줄)
   - 테마 시스템 통합

2. **useUtilityClasses + composeClasses** (10줄)
   - 단일 'root' 슬롯만 사용하는데 추상화 레이어 추가

3. **styled 시스템** (6줄)
   - `overflow: hidden` 하나 적용하는데 styled() API 사용
   - overridesResolver 불필요 (Paper에서 이미 처리)

4. **ownerState** (2줄)
   - styled 컴포넌트에 props 전달용
   - Card에서는 사용하지 않음

5. **PropTypes** (37줄, 52-88)
   - raised prop 검증 로직
   - JSDoc 주석 포함

6. **clsx** (1줄)
   - className 병합

실제 핵심 로직은 **10줄 미만**입니다.

---

## 비교: Card vs Paper

| 항목 | Paper | Card |
|------|-------|------|
| **기본 역할** | 표면 컨테이너 | Paper + overflow hidden |
| **Elevation** | 0-24 자유 설정 | raised prop으로 1/8 선택 |
| **스타일 추가** | - | overflow: hidden |
| **코드 라인** | 202줄 | 91줄 |
| **복잡도** | 중간 | 낮음 |

**핵심 차이**:
- Card는 Paper의 얇은 래퍼
- `overflow: hidden`으로 카드 이미지나 콘텐츠가 경계 밖으로 나가지 않도록 보장
- `raised` prop은 편의 기능

---

## 사용 예시

### 기본 사용
```javascript
<Card>
  <CardContent>Hello World</CardContent>
</Card>
```

### Raised 카드
```javascript
<Card raised>
  <CardContent>Elevated Card</CardContent>
</Card>
```

### Outlined 카드
```javascript
<Card variant="outlined">
  <CardContent>Outlined Card</CardContent>
</Card>
```
