# SpeedDialIcon 컴포넌트

> SpeedDialIcon 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

SpeedDialIcon은 **SpeedDial의 메인 FAB 버튼 안에 표시되는 아이콘으로, open 상태에 따라 45도 회전 애니메이션을 제공하는** 컴포넌트입니다.

### 핵심 기능
1. **아이콘 회전 애니메이션** - open 시 45도 회전 (+ → ×), close 시 원위치
2. **커스텀 아이콘 지원** - `icon` prop으로 기본 AddIcon(+) 대신 다른 아이콘 사용 가능
3. **openIcon 전환** - `openIcon` prop으로 open 상태일 때 완전히 다른 아이콘으로 교체 (opacity 전환)

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/SpeedDialIcon/SpeedDialIcon.js (155줄)
packages/mui-material/src/SpeedDialIcon/speedDialIconClasses.ts (35줄)
```

### 렌더링 구조

```
SpeedDialIcon (forwardRef)
  └─> SpeedDialIconRoot (styled span)
       ├─> openIconProp (optional, opacity 전환)
       └─> iconProp 또는 AddIcon (기본, 회전 애니메이션)
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | - | SpeedDial이 열린 상태인지 여부 |
| `icon` | ReactNode | `<AddIcon />` | 표시할 아이콘 |
| `openIcon` | ReactNode | - | open 상태에서 보여줄 별도 아이콘 |
| `className` | string | - | 추가 CSS 클래스 |
| `classes` | object | - | 유틸리티 클래스 오버라이드 |
| `sx` | SxProps | - | 시스템 스타일 prop |

### 핵심 로직 발췌

```javascript
// 아이콘 회전 + openIcon 교체 로직 (styled variants)
variants: [
  // open일 때: 기본 아이콘 45도 회전
  {
    props: ({ ownerState }) => ownerState.open,
    style: {
      [`& .${speedDialIconClasses.icon}`]: {
        transform: 'rotate(45deg)',
      },
    },
  },
  // open이고 openIcon 있을 때: 기본 아이콘 숨김
  {
    props: ({ ownerState }) => ownerState.open && ownerState.openIcon,
    style: {
      [`& .${speedDialIconClasses.icon}`]: {
        opacity: 0,
      },
    },
  },
  // open일 때: openIcon 표시 (rotate 0deg, opacity 1)
  {
    props: ({ ownerState }) => ownerState.open,
    style: {
      [`& .${speedDialIconClasses.openIcon}`]: {
        transform: 'rotate(0deg)',
        opacity: 1,
      },
    },
  },
],
```

```javascript
// formatIcon: 아이콘에 className 주입
function formatIcon(icon, newClassName) {
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, { className: newClassName });
  }
  return icon;
}

// 렌더링: openIcon은 선택적, icon은 기본 AddIcon
{openIconProp ? formatIcon(openIconProp, classes.openIcon) : null}
{iconProp ? formatIcon(iconProp, classes.icon) : <AddIcon className={classes.icon} />}
```

---

## 복잡도의 이유

SpeedDialIcon은 **155줄**이며, 복잡한 이유는:

1. **Styled 시스템** - `styled('span', { name, slot, overridesResolver })` 패턴으로 SpeedDialIconRoot 정의, variants 배열로 조건부 스타일링
2. **유틸리티 클래스** - 6개 클래스(root, icon, iconOpen, iconWithOpenIconOpen, openIcon, openIconOpen) × useUtilityClasses + composeClasses 조합
3. **Theme 의존** - memoTheme 래퍼, theme.transitions.create()로 transition 문자열 생성, useDefaultProps
4. **openIcon 이중 렌더링** - icon과 openIcon 두 요소를 동시 렌더링하고 opacity/transform으로 전환하는 구조

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **openIcon prop** - 두 아이콘의 opacity 전환은 고급 커스터마이징, 기본 회전만으로 충분
- **useUtilityClasses + classes prop** - MUI 내부 인프라, 학습 무관
- **Theme 시스템** - useDefaultProps, memoTheme, theme.transitions → 하드코딩 가능
- **styled 컴포넌트** - styled API → inline styles로 대체
- **PropTypes** - 런타임 타입 검증 메타데이터

> 상세한 간소화 결과는 `SpeedDialIcon-simplified.md` 참고
