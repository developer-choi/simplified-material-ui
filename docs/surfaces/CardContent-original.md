# CardContent 컴포넌트

> Material-UI의 CardContent 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

CardContent는 **카드 내용 영역에 패딩을 적용하는 컨테이너** 컴포넌트입니다.

### 핵심 기능

1. **Padding 적용** - 16px padding으로 카드 경계와 내용 사이 여백 생성
2. **Last-child 특별 처리** - 마지막 CardContent일 때 paddingBottom: 24px (하단 여백 증가)
3. **Component 다형성** - component prop으로 HTML 요소 타입 변경 가능

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/CardContent/CardContent.js (86줄)

CardContent
  ├─ useDefaultProps (테마에서 기본 props 가져오기)
  ├─ useUtilityClasses (CSS 클래스 이름 생성)
  │
  └─ CardContentRoot (styled 'div')
       ├─ padding: 16
       └─ :last-child → paddingBottom: 24
```

### 2. Styled Component (1개)

#### CardContentRoot (20-28줄)

```javascript
const CardContentRoot = styled('div', {
  name: 'MuiCardContent',
  slot: 'Root',
})({
  padding: 16,
  '&:last-child': {
    paddingBottom: 24,
  },
});
```

**특징**:
- `padding: 16` - 모든 방향에 16px padding
- `&:last-child` - 부모의 마지막 자식일 때
- `paddingBottom: 24` - 마지막일 때 하단 패딩을 24px로 증가

**왜 :last-child에 paddingBottom을 증가시키는가?**
- Card는 보통 CardContent → CardActions 순서로 구성
- CardActions가 없으면 CardContent가 마지막 요소
- 이 경우 카드 하단에 더 많은 여백이 필요 (시각적 균형)

### 3. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 카드 내용 |
| `component` | elementType | `'div'` | 루트 엘리먼트 타입 |
| `className` | string | - | 추가 CSS 클래스 |
| `classes` | object | - | CSS 클래스 오버라이드 |

### 4. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getCardContentUtilityClass, classes);
};
```

- 단일 root 슬롯에 대한 CSS 클래스 생성
- 테마의 classes prop과 병합

---

## 렌더링 로직

```javascript
const CardContent = React.forwardRef(function CardContent(inProps, ref) {
  // 1. 테마 기본 props
  const props = useDefaultProps({
    props: inProps,
    name: 'MuiCardContent',
  });

  // 2. props 구조 분해
  const { className, component = 'div', ...other } = props;

  // 3. ownerState
  const ownerState = { ...props, component };

  // 4. CSS 클래스 생성
  const classes = useUtilityClasses(ownerState);

  // 5. 렌더링
  return (
    <CardContentRoot
      as={component}
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

### 1. Padding Container Pattern

```css
padding: 16px;
```

- 카드 경계와 내용 사이에 여백 생성
- 텍스트가 카드 경계에 바로 붙지 않도록 함

### 2. Last-child Special Handling

```css
&:last-child {
  padding-bottom: 24px;
}
```

- CSS :last-child pseudo-class 사용
- 마지막 CardContent일 때 하단 패딩 증가
- CardActions가 없을 때 카드 하단에 더 많은 여백

### 3. Component Polymorphism

```javascript
<CardContentRoot as={component} ... />
```

- `as` prop으로 렌더링될 HTML 요소 변경
- 기본은 div, 필요시 section 등으로 변경 가능

---

## 복잡도의 이유

CardContent는 **86줄**이며, 복잡한 이유는:

1. **styled 컴포넌트** (약 9줄)
   - CardContentRoot
   - :last-child pseudo-class 처리

2. **useUtilityClasses + composeClasses** (약 8줄)
   - CSS 클래스 생성

3. **PropTypes** (약 30줄, 53-83)
   - 런타임 타입 검증

실제 핵심 로직은 **10줄 미만**입니다.

---

## 사용 예시

### 기본 사용

```javascript
<Card>
  <CardContent>
    <Typography variant="h5" component="div">
      카드 제목
    </Typography>
    <Typography variant="body2" color="text.secondary">
      카드 내용
    </Typography>
  </CardContent>
</Card>
```

### CardContent + CardActions

```javascript
<Card>
  <CardContent>
    <Typography variant="h5">제목</Typography>
    <Typography>내용</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">공유</Button>
    <Button size="small">더 보기</Button>
  </CardActions>
</Card>
```

이 경우:
- CardContent는 :last-child가 **아님**
- paddingBottom: 16 (기본값)

### CardContent만 있을 때

```javascript
<Card>
  <CardContent>
    <Typography variant="h5">제목</Typography>
    <Typography>내용</Typography>
  </CardContent>
</Card>
```

이 경우:
- CardContent가 :last-child
- paddingBottom: 24 (증가됨)

### component prop 사용

```javascript
<Card>
  <CardContent component="section">
    <Typography variant="h5">섹션 제목</Typography>
    <Typography>섹션 내용</Typography>
  </CardContent>
</Card>
```

---

## 핵심 동작 원리

### Padding 메커니즘

**일반적인 경우** (CardContent + CardActions):
```
┌─────────────────────┐
│ 16px padding (all)  │
│  ┌───────────────┐  │
│  │   Content     │  │
│  └───────────────┘  │
│ 16px (bottom)       │
├─────────────────────┤
│   CardActions       │
└─────────────────────┘
```

**CardContent만 있을 때** (:last-child):
```
┌─────────────────────┐
│ 16px padding (all)  │
│  ┌───────────────┐  │
│  │   Content     │  │
│  └───────────────┘  │
│ 24px (bottom) ★     │
└─────────────────────┘
```

하단 패딩이 24px로 증가하여 더 많은 여백 제공

### :last-child Selector

```css
.MuiCardContent-root:last-child {
  padding-bottom: 24px;
}
```

- 부모 요소의 마지막 자식일 때만 적용
- CardActions가 있으면 CardActions가 마지막이므로 미적용
- CardContent가 마지막이면 적용
