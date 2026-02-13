# Fab 컴포넌트

> Fab 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Fab(Floating Action Button)는 **화면에 떠있는 원형 버튼을 표시하는** 컴포넌트입니다.

### 핵심 기능
1. **원형 버튼** - borderRadius: 50%로 원형 모양
2. **Elevation** - box-shadow로 떠있는 효과
3. **Ripple 효과** - ButtonBase를 확장하여 터치 피드백 제공
4. **두 가지 variant** - circular(원형), extended(텍스트 포함 둥근 사각형)
5. **세 가지 크기** - small(40px), medium(48px), large(56px)
6. **8가지 색상** - default + 7가지 테마 색상

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Fab/Fab.js (302줄)

Fab (forwardRef)
  └─> FabRoot (styled(ButtonBase))
       └─> children
```

### 2. ButtonBase 확장

```javascript
const FabRoot = styled(ButtonBase, {
  name: 'MuiFab',
  slot: 'Root',
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  overridesResolver: (props, styles) => {
    // ...
  },
})(/* 스타일 함수들 */);
```

**ButtonBase의 역할**:
- Ripple 효과 제공
- focusRipple, disableFocusRipple props 처리
- focusVisibleClassName 처리
- disabled 상태 처리
- component prop (다형성)

### 3. 3개의 memoTheme 스타일 함수

#### 1번째: 기본 스타일 + variants (size, variant, color='inherit')

```javascript
memoTheme(({ theme }) => ({
  ...theme.typography.button,
  minHeight: 36,
  transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color'], {
    duration: theme.transitions.duration.short,
  }),
  borderRadius: '50%',
  padding: 0,
  minWidth: 0,
  width: 56,
  height: 56,
  zIndex: (theme.vars || theme).zIndex.fab,
  boxShadow: (theme.vars || theme).shadows[6],
  '&:active': {
    boxShadow: (theme.vars || theme).shadows[12],
  },
  color: theme.vars
    ? theme.vars.palette.grey[900]
    : theme.palette.getContrastText?.(theme.palette.grey[300]),
  backgroundColor: (theme.vars || theme).palette.grey[300],
  '&:hover': {
    backgroundColor: (theme.vars || theme).palette.grey.A100,
    '@media (hover: none)': {
      backgroundColor: (theme.vars || theme).palette.grey[300],
    },
    textDecoration: 'none',
  },
  [`&.${fabClasses.focusVisible}`]: {
    boxShadow: (theme.vars || theme).shadows[6],
  },
  variants: [
    { props: { size: 'small' }, style: { width: 40, height: 40 } },
    { props: { size: 'medium' }, style: { width: 48, height: 48 } },
    { props: { variant: 'extended' }, style: { /* ... */ } },
    { props: { variant: 'extended', size: 'small' }, style: { /* ... */ } },
    { props: { variant: 'extended', size: 'medium' }, style: { /* ... */ } },
    { props: { color: 'inherit' }, style: { color: 'inherit' } },
  ],
}))
```

**학습 포인트**:
- **variants 배열**: props 조건에 따라 다른 스타일 적용
- **theme.typography.button**: 버튼 기본 typography 상속
- **theme.transitions.create()**: 애니메이션 transition 생성
- **theme.shadows[6]**: elevation 6 box-shadow
- **theme.zIndex.fab**: 1050 (다른 요소 위에 표시)

#### 2번째: color별 동적 스타일 생성

```javascript
memoTheme(({ theme }) => ({
  variants: [
    ...Object.entries(theme.palette)
      .filter(createSimplePaletteValueFilter(['dark', 'contrastText']))
      .map(([color]) => ({
        props: { color },
        style: {
          color: (theme.vars || theme).palette[color].contrastText,
          backgroundColor: (theme.vars || theme).palette[color].main,
          '&:hover': {
            backgroundColor: (theme.vars || theme).palette[color].dark,
            '@media (hover: none)': {
              backgroundColor: (theme.vars || theme).palette[color].main,
            },
          },
        },
      })),
  ],
}))
```

**학습 포인트**:
- **Object.entries(theme.palette)**: 테마 색상 순회
- **createSimplePaletteValueFilter()**: 유효한 색상만 필터링
- **palette[color].main, .dark, .contrastText**: 색상 값 접근

#### 3번째: disabled 상태

```javascript
memoTheme(({ theme }) => ({
  [`&.${fabClasses.disabled}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    boxShadow: (theme.vars || theme).shadows[0],
    backgroundColor: (theme.vars || theme).palette.action.disabledBackground,
  },
}))
```

### 4. variant별 스타일

**circular (기본)**:
- borderRadius: '50%'
- width = height (40, 48, 56)
- padding: 0

**extended (텍스트 포함)**:
- borderRadius: 반원형 (height / 2)
- width: 'auto' (콘텐츠에 따라)
- padding: '0 16px' (좌우 여백)
- minWidth: 48

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `variant` | 'circular' \| 'extended' | 'circular' | 버튼 모양 |
| `size` | 'small' \| 'medium' \| 'large' | 'large' | 버튼 크기 |
| `color` | 8가지 | 'default' | 색상 |
| `disabled` | boolean | false | 비활성화 상태 |
| `disableFocusRipple` | boolean | false | 포커스 Ripple 제거 |
| `component` | elementType | 'button' | 루트 요소 타입 |
| `href` | string | - | 링크 URL (a 요소로 변경) |

---

## 설계 패턴

1. **ButtonBase Extension Pattern**
   - ButtonBase를 확장하여 Ripple, focus 상태 자동 처리
   - styled(ButtonBase)로 스타일만 추가

2. **Variants Array Pattern**
   - props 조건에 따라 동적 스타일 적용
   - size, variant, color 조합 가능

3. **Dynamic Color Generation**
   - theme.palette 순회로 모든 테마 색상 지원
   - createSimplePaletteValueFilter로 유효한 색상만 필터링

4. **Material Design Elevation**
   - box-shadow로 떠있는 효과
   - :active에서 box-shadow 증가 (elevation 6 → 12)

---

## 복잡도의 이유

Fab는 **302줄**이며, 복잡한 이유는:

1. **ButtonBase 확장 (약 20줄)**
   - ButtonBase import 및 styled(ButtonBase)
   - Ripple 관련 props 처리

2. **3개의 memoTheme 스타일 함수 (약 130줄)**
   - 기본 스타일 + variants (size, variant)
   - color별 동적 스타일 생성
   - disabled 상태

3. **variants 배열 (약 50줄)**
   - size별 3개
   - variant별 3개 (extended + size 조합)
   - color='inherit' 1개

4. **Theme 시스템 (약 30줄)**
   - theme.transitions.create()
   - theme.shadows[], theme.zIndex.fab
   - theme.palette 접근

5. **useUtilityClasses (약 15줄)**
   - color, variant, size별 조건부 className

6. **PropTypes (약 90줄)**
   - 타입 검증

---

## 비교: 일반 button vs Fab

| 기능 | 일반 button | Fab |
|------|------------|-----|
| **원형 모양** | borderRadius: 50% | ✅ 자동 |
| **Elevation** | box-shadow 직접 작성 | ✅ theme.shadows |
| **Ripple 효과** | 없음 | ✅ ButtonBase |
| **색상** | 하드코딩 | ✅ theme.palette |
| **크기** | width/height 직접 설정 | ✅ size prop |
| **번들 크기** | 0 KB | ~10 KB |

**Fab의 장점**:
- Ripple 효과 자동 제공
- Theme 시스템 통합
- size, variant, color props로 간편 커스터마이징

**Fab의 단점**:
- ButtonBase 의존성
- styled 시스템 복잡도
- variants 배열 관리
- 번들 크기 증가
