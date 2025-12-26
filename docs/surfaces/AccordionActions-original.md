# AccordionActions 컴포넌트

> Material-UI의 AccordionActions 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

AccordionActions는 **Accordion 하단에 액션 버튼들(확인, 취소 등)을 배치하는 컨테이너** 컴포넌트입니다.

> **💡 작성 주의**: AccordionActions 자체는 flexbox 레이아웃 컨테이너 역할만 담당합니다. 버튼 컴포넌트(Button 등)는 children으로 전달됩니다.

### 핵심 기능
1. **Flexbox 레이아웃** - 버튼들을 우측 정렬 (justifyContent: flex-end)
2. **버튼 간 간격** - 버튼 사이에 8px 마진 적용
3. **간격 제거 옵션** - disableSpacing prop으로 간격 제거 가능

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/AccordionActions/AccordionActions.js (95줄)
AccordionActions (forwardRef)
  └─> AccordionActionsRoot (styled div)
       └─> children (Button 등 - 사용자 제공)
```

### 2. 주요 Styled Component

**AccordionActionsRoot** (라인 20-43)
- div 기반 styled component
- flexbox 레이아웃으로 버튼 우측 정렬
- variants 배열로 조건부 간격 스타일 정의

```javascript
const AccordionActionsRoot = styled('div', {
  name: 'MuiAccordionActions',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [styles.root, !ownerState.disableSpacing && styles.spacing];
  },
})({
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  justifyContent: 'flex-end',
  variants: [
    {
      props: (props) => !props.disableSpacing,
      style: {
        '& > :not(style) ~ :not(style)': {
          marginLeft: 8,
        },
      },
    },
  ],
});
```

### 3. useUtilityClasses

**useUtilityClasses** (라인 10-18)
- 상태별 클래스명 자동 생성
- disableSpacing 상태에 따라 'spacing' 클래스 추가/제거

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, disableSpacing } = ownerState;

  const slots = {
    root: ['root', !disableSpacing && 'spacing'],
  };

  return composeClasses(slots, getAccordionActionsUtilityClass, classes);
};
```

### 4. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 액션 버튼들 |
| `className` | string | - | CSS 클래스명 |
| `disableSpacing` | boolean | false | 버튼 간 간격 제거 |
| `classes` | object | - | 클래스명 오버라이드 (테마 커스터마이징용) |
| `sx` | object\|func\|array | - | sx prop (테마 기반 스타일) |

### 5. 렌더링 구조

**JSX 구조** (라인 52-59)

```javascript
<AccordionActionsRoot
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
   - overridesResolver로 테마 오버라이드 지원
   - variants 배열로 조건부 스타일 정의 (disableSpacing)

2. **Utility Classes**
   - useUtilityClasses로 상태별 클래스명 생성
   - composeClasses로 클래스 병합
   - getAccordionActionsUtilityClass로 클래스명 변환

3. **Theme Integration**
   - useDefaultProps로 테마 기본값 병합
   - name: 'MuiAccordionActions'로 테마 오버라이드 지원
   - ownerState로 props를 스타일에 전달

4. **ForwardRef Pattern**
   - React.forwardRef로 ref 전달
   - DOM 노드 직접 접근 가능

---

## 복잡도의 이유

AccordionActions는 **95줄**이며, 복잡한 이유는:

1. **테마 시스템 통합**
   - useDefaultProps로 테마 기본값 병합 (라인 46)
   - name: 'MuiAccordionActions'로 테마에서 설정 가져오기
   - 실제 로직보다 테마 통합 코드가 더 많음

2. **Styled Component 시스템**
   - styled() API로 컴포넌트 생성 (라인 20-43)
   - overridesResolver로 테마 오버라이드 지원
   - variants 배열로 조건부 스타일 정의 (disableSpacing)
   - ownerState로 props를 스타일에 전달

3. **Utility Classes**
   - useUtilityClasses 함수 (라인 10-18)
   - composeClasses로 클래스 병합
   - getAccordionActionsUtilityClass로 클래스명 변환
   - 클래스명 자동 생성 시스템 (테마 오버라이드용)

4. **PropTypes 검증**
   - PropTypes 30줄 (라인 62-92)
   - JSDoc 주석 포함
   - 실제 코드(35줄)보다 PropTypes가 더 많음

5. **단순한 기능, 복잡한 구조**
   - **실제 기능**: flexbox로 버튼 우측 정렬 + 간격 (CSS 5줄이면 충분)
   - **실제 코드**: 테마 시스템, styled component, utility classes로 95줄
   - 핵심 로직은 35줄, 나머지 60줄은 테마/검증/메타데이터

---

## 비교: AccordionActions vs 일반 div

| 기능 | AccordionActions | `<div style={{...}}>` |
|------|------------------|-----------------------|
| **flexbox 레이아웃** | 자동 적용 | 수동 CSS 필요 |
| **버튼 간 간격** | 자동 적용 (8px) | 수동 CSS 필요 |
| **테마 통합** | useDefaultProps로 자동 | 수동 구현 필요 |
| **간격 제거** | disableSpacing prop | CSS 수정 필요 |
| **클래스명 자동 생성** | useUtilityClasses로 자동 | 수동 관리 필요 |
| **테마 오버라이드** | overridesResolver로 가능 | 불가능 |
| **코드 복잡도** | 95줄 (재사용 가능) | 간단하지만 반복 |
| **학습 곡선** | styled(), useUtilityClasses 이해 필요 | CSS만 알면 됨 |
