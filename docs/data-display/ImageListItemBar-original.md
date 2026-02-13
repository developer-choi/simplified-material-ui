# ImageListItemBar 컴포넌트

> Material-UI의 ImageListItemBar 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

ImageListItemBar는 **ImageListItem 위에 오버레이되는 타이틀 바** 컴포넌트입니다.

### 핵심 기능

1. **위치 제어** - position: 'top', 'bottom' (기본), 'below'
2. **타이틀 표시** - title, subtitle
3. **액션 아이콘** - actionIcon (IconButton 등)
4. **액션 위치** - actionPosition: 'left', 'right' (기본)
5. **테마 값 사용** - fontFamily, fontSize, color

---

## 내부 구조

### Styled Components (5개)

1. **ImageListItemBarRoot** - 루트, position별 스타일
2. **ImageListItemBarTitleWrap** - 타이틀 래퍼, padding 조정
3. **ImageListItemBarTitle** - 타이틀, ellipsis
4. **ImageListItemBarSubtitle** - 서브타이틀, ellipsis
5. **ImageListItemBarActionIcon** - 액션 아이콘, order 제어

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `position` | 'top' \| 'bottom' \| 'below' | `'bottom'` | 타이틀 바 위치 |
| `title` | node | - | 타이틀 |
| `subtitle` | node | - | 서브타이틀 |
| `actionIcon` | node | - | 액션 아이콘 |
| `actionPosition` | 'left' \| 'right' | `'right'` | 액션 아이콘 위치 |

### memoTheme 사용

- `theme.typography.fontFamily` - 폰트
- `theme.typography.pxToRem(16)` - 타이틀 fontSize
- `theme.typography.pxToRem(12)` - 서브타이틀 fontSize
- `theme.palette.common.white` - 텍스트 color

---

## 설계 패턴

### Position-based Layout

- **top**: `position: absolute; top: 0`
- **bottom**: `position: absolute; bottom: 0`
- **below**: `position: relative; background: transparent`

### Flexbox Layout

- root: `display: flex; alignItems: center`
- titleWrap: `flexGrow: 1`
- actionIcon: `order: -1` (left일 때)

---

## 복잡도의 이유

279줄이며, 복잡한 이유는:
- 5개의 styled 컴포넌트
- memoTheme로 테마 값 참조
- useUtilityClasses + composeClasses
- capitalize 유틸 사용
- PropTypes 48줄
