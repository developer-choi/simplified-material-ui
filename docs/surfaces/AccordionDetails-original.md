# AccordionDetails 컴포넌트

> Material-UI의 AccordionDetails 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

AccordionDetails는 **Accordion의 확장 가능한 내용 영역을 제공하는 컨테이너** 컴포넌트입니다.

> **💡 작성 주의**: AccordionDetails 자체는 padding을 적용하는 간단한 컨테이너 역할만 담당합니다. 실제 내용은 children으로 전달됩니다.

### 핵심 기능
1. **Padding 적용** - 내용 영역에 일관된 여백 제공 (theme.spacing(1, 2, 2) = 8px 16px 16px)
2. **컨테이너 역할** - Accordion 내용을 감싸는 div 역할

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/AccordionDetails/AccordionDetails.js (74줄)
AccordionDetails (forwardRef)
  └─> AccordionDetailsRoot (styled div)
       └─> children (사용자 제공 내용)
```

### 2. 주요 Styled Component

**AccordionDetailsRoot** (라인 21-28)
- div 기반 styled component
- memoTheme()로 테마 spacing 사용
- padding만 적용하는 매우 단순한 스타일

```javascript
const AccordionDetailsRoot = styled('div', {
  name: 'MuiAccordionDetails',
  slot: 'Root',
})(
  memoTheme(({ theme }) => ({
    padding: theme.spacing(1, 2, 2),
  })),
);
```

### 3. memoTheme

**memoTheme** (라인 7, 25)
- 테마 객체를 메모이제이션하여 불필요한 재렌더링 방지
- theme.spacing(1, 2, 2) = 8px 16px 16px (기본 spacing unit이 8px일 때)
- 테마가 변경되지 않으면 동일한 스타일 객체 재사용

### 4. useUtilityClasses

**useUtilityClasses** (라인 11-19)
- 상태별 클래스명 자동 생성
- AccordionDetails는 동적 상태가 없어서 'root' 클래스만 생성

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getAccordionDetailsUtilityClass, classes);
};
```

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 내용 영역에 표시할 내용 |
| `className` | string | - | CSS 클래스명 |
| `classes` | object | - | 클래스명 오버라이드 (테마 커스터마이징용) |
| `sx` | object\|func\|array | - | sx prop (테마 기반 스타일) |

### 6. 렌더링 구조

**JSX 구조** (라인 36-43)

```javascript
<AccordionDetailsRoot
  className={clsx(classes.root, className)}
  ref={ref}
  ownerState={ownerState}
  {...other}
/>
```

---

## 설계 패턴

1. **Styled Component System**
   - styled() API로 div 컴포넌트 생성
   - memoTheme()로 테마 기반 스타일 메모이제이션
   - name: 'MuiAccordionDetails'로 테마 오버라이드 지원

2. **Theme Integration**
   - useDefaultProps로 테마 기본값 병합
   - theme.spacing()으로 일관된 간격 시스템 사용
   - memoTheme()로 테마 변경 감지 및 최적화

3. **Utility Classes**
   - useUtilityClasses로 클래스명 생성
   - composeClasses로 클래스 병합
   - getAccordionDetailsUtilityClass로 클래스명 변환

4. **ForwardRef Pattern**
   - React.forwardRef로 ref 전달
   - DOM 노드 직접 접근 가능

---

## 복잡도의 이유

AccordionDetails는 **74줄**이며, 복잡한 이유는:

1. **테마 시스템 통합**
   - useDefaultProps로 테마 기본값 병합 (라인 31)
   - memoTheme()로 테마 spacing 사용 (라인 25-27)
   - theme.spacing(1, 2, 2)로 동적 간격 계산
   - name: 'MuiAccordionDetails'로 테마에서 설정 가져오기

2. **Styled Component 시스템**
   - styled() API로 컴포넌트 생성 (라인 21-28)
   - memoTheme()로 스타일 메모이제이션
   - ownerState로 props를 스타일에 전달

3. **Utility Classes**
   - useUtilityClasses 함수 (라인 11-19)
   - composeClasses로 클래스 병합
   - getAccordionDetailsUtilityClass로 클래스명 변환
   - 클래스명 자동 생성 시스템 (테마 오버라이드용)

4. **PropTypes 검증**
   - PropTypes 25줄 (라인 46-71)
   - JSDoc 주석 포함
   - 실제 코드(49줄)보다 메타데이터 비중이 높음

5. **단순한 기능, 복잡한 구조**
   - **실제 기능**: padding 적용 (CSS 1줄이면 충분)
   - **실제 코드**: 테마 시스템, styled component, utility classes로 74줄
   - 핵심 로직은 49줄, 나머지 25줄은 PropTypes

---

## 비교: AccordionDetails vs 일반 div

| 기능 | AccordionDetails | `<div style={{...}}>` |
|------|------------------|-----------------------|
| **padding 적용** | 자동 적용 (theme.spacing) | 수동 CSS 필요 |
| **테마 통합** | theme.spacing()으로 일관성 | 수동으로 값 관리 |
| **테마 오버라이드** | useDefaultProps로 가능 | 불가능 |
| **스타일 메모이제이션** | memoTheme()로 자동 | 수동 최적화 필요 |
| **클래스명 자동 생성** | useUtilityClasses로 자동 | 수동 관리 필요 |
| **코드 복잡도** | 74줄 (재사용 가능) | 간단하지만 반복 |
| **학습 곡선** | styled(), memoTheme 이해 필요 | CSS만 알면 됨 |
| **동적 테마** | 테마 변경 시 자동 업데이트 | 수동 업데이트 필요 |
