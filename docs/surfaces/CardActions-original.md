# CardActions 컴포넌트

> Material-UI의 CardActions 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

CardActions는 **카드 하단에 버튼(액션)을 배치하는 컨테이너** 컴포넌트입니다.

### 핵심 기능

1. **Flex 레이아웃** - 자식 요소들을 가로로 배치 (display: flex)
2. **자동 간격** - disableSpacing=false일 때 자식 요소 간 자동으로 marginLeft: 8px
3. **Padding** - 컨테이너에 8px padding 적용
4. **Alignment** - alignItems: center로 수직 중앙 정렬

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/CardActions/CardActions.js (99줄)

CardActions
  ├─ useDefaultProps (테마에서 기본 props 가져오기)
  ├─ useUtilityClasses (CSS 클래스 이름 생성)
  │
  └─ CardActionsRoot (styled 'div')
       ├─ display: flex
       ├─ alignItems: center
       ├─ padding: 8
       └─ (disableSpacing=false) → marginLeft: 8 (자식 요소 간)
```

### 2. Styled Component (1개)

#### CardActionsRoot (20-42줄)

```javascript
const CardActionsRoot = styled('div', {
  name: 'MuiCardActions',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.root, !ownerState.disableSpacing && styles.spacing];
  },
})({
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  variants: [
    {
      props: { disableSpacing: false },
      style: {
        '& > :not(style) ~ :not(style)': {
          marginLeft: 8,
        },
      },
    },
  ],
});
```

**특징**:
- `display: flex` - 자식 요소를 가로로 배치
- `alignItems: center` - 자식 요소를 수직 중앙 정렬
- `padding: 8` - 8px padding
- **variants로 조건부 스타일**:
  - `disableSpacing: false` (기본값) → CSS selector로 자식 간격 추가
  - `& > :not(style) ~ :not(style)` - 첫 번째를 제외한 모든 자식에 marginLeft: 8

### 3. CSS Selector 설명

```css
& > :not(style) ~ :not(style)
```

이 복잡한 selector는:
1. `&` - 현재 요소 (CardActionsRoot)
2. `>` - 직계 자식만
3. `:not(style)` - `<style>` 태그 제외 (emotion의 스타일 태그 무시)
4. `~` - 형제 요소
5. `:not(style)` - 형제 중 `<style>` 태그 제외

**결과**: 첫 번째 자식을 제외한 모든 자식 요소에 marginLeft: 8 적용

### 4. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 버튼 등의 액션 요소들 |
| `disableSpacing` | boolean | `false` | 자식 요소 간 간격 비활성화 |
| `className` | string | - | 추가 CSS 클래스 |
| `classes` | object | - | CSS 클래스 오버라이드 |

### 5. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, disableSpacing } = ownerState;

  const slots = {
    root: ['root', !disableSpacing && 'spacing'],
  };

  return composeClasses(slots, getCardActionsUtilityClass, classes);
};
```

- root 슬롯에 조건부로 'spacing' 클래스 추가
- disableSpacing=false일 때 spacing 클래스 적용

---

## 렌더링 로직

```javascript
const CardActions = React.forwardRef(function CardActions(inProps, ref) {
  // 1. 테마 기본 props
  const props = useDefaultProps({
    props: inProps,
    name: 'MuiCardActions',
  });

  // 2. props 구조 분해
  const { disableSpacing = false, className, ...other } = props;

  // 3. ownerState
  const ownerState = { ...props, disableSpacing };

  // 4. CSS 클래스 생성
  const classes = useUtilityClasses(ownerState);

  // 5. 렌더링
  return (
    <CardActionsRoot
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      ref={ref}
      {...other}
    />
  );
});
```

---

## 설계 패턴

### 1. Flex Container Pattern

```css
display: flex;
alignItems: center;
```

- 자식 요소를 가로로 배치
- 버튼 높이가 다를 경우 수직 중앙 정렬

### 2. CSS Selector Based Spacing

```css
& > :not(style) ~ :not(style) {
  marginLeft: 8;
}
```

- JavaScript 없이 CSS만으로 자식 간격 구현
- 첫 번째 자식은 marginLeft 없음
- 나머지 자식들은 모두 marginLeft: 8

### 3. Conditional Styling with Variants

```javascript
variants: [
  {
    props: { disableSpacing: false },
    style: {
      '& > :not(style) ~ :not(style)': {
        marginLeft: 8,
      },
    },
  },
]
```

- prop 값에 따라 조건부로 스타일 적용
- disableSpacing=true면 간격 스타일 미적용

---

## 복잡도의 이유

CardActions는 **99줄**이며, 복잡한 이유는:

1. **styled 컴포넌트** (약 23줄)
   - CardActionsRoot
   - overridesResolver
   - variants

2. **CSS selector** (약 5줄)
   - `& > :not(style) ~ :not(style)`
   - 복잡하지만 간격 구현에 효과적

3. **useUtilityClasses + composeClasses** (약 8줄)
   - 조건부 CSS 클래스 생성

4. **PropTypes** (약 30줄, 66-96)
   - 런타임 타입 검증

실제 핵심 로직은 **20줄 미만**입니다.

---

## 사용 예시

### 기본 사용

```javascript
<Card>
  <CardContent>
    <Typography>카드 내용</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">공유</Button>
    <Button size="small">더 보기</Button>
  </CardActions>
</Card>
```

### disableSpacing 사용

```javascript
<Card>
  <CardContent>
    <Typography>카드 내용</Typography>
  </CardContent>
  <CardActions disableSpacing>
    <Button size="small">공유</Button>
    <Button size="small">더 보기</Button>
  </CardActions>
</Card>
```

### 오른쪽 정렬

```javascript
<Card>
  <CardContent>
    <Typography>카드 내용</Typography>
  </CardContent>
  <CardActions style={{ justifyContent: 'flex-end' }}>
    <Button size="small">취소</Button>
    <Button size="small">확인</Button>
  </CardActions>
</Card>
```

### 중앙 정렬

```javascript
<Card>
  <CardContent>
    <Typography>카드 내용</Typography>
  </CardContent>
  <CardActions style={{ justifyContent: 'center' }}>
    <Button size="small">액션</Button>
  </CardActions>
</Card>
```

### 양쪽 정렬

```javascript
<Card>
  <CardContent>
    <Typography>카드 내용</Typography>
  </CardContent>
  <CardActions style={{ justifyContent: 'space-between' }}>
    <Button size="small">뒤로</Button>
    <Button size="small">다음</Button>
  </CardActions>
</Card>
```

---

## 핵심 동작 원리

### 자식 간격 메커니즘

**disableSpacing=false (기본)**:
```css
.MuiCardActions-root > :not(style) ~ :not(style) {
  margin-left: 8px;
}
```

**시각적 결과**:
```
[Button 1] [8px] [Button 2] [8px] [Button 3]
```

**disableSpacing=true**:
```
[Button 1][Button 2][Button 3]
```
(간격 없음)

### Flex 레이아웃

```css
display: flex;
align-items: center;
```

**효과**:
- 자식 요소들이 가로로 나열
- 버튼 높이가 다르면 수직 중앙 정렬
- flex-direction 기본값은 'row'

### Padding

```css
padding: 8px;
```

**효과**:
- CardActions 컨테이너 내부에 8px 여백
- 버튼이 카드 경계에 바로 붙지 않음
