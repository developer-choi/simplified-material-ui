# ImageListItemBar 컴포넌트

> ImageListItem 위에 오버레이되는 단순화된 타이틀 바

---

## 무슨 기능을 하는가?

단순화된 ImageListItemBar는 **ImageListItem 위에 오버레이되는 타이틀 바**입니다.

### 핵심 기능 (남은 것)
1. **위치 제어** - position: 'top', 'bottom', 'below'
2. **타이틀 표시** - title, subtitle
3. **액션 아이콘** - actionIcon (IconButton 등)
4. **액션 위치** - actionPosition: 'left', 'right'
5. **인라인 스타일** - 5개 스타일 객체

---

## 핵심 학습 포인트

### 1. Position-based Conditional Styles
```javascript
const rootStyle = {
  position: position === 'below' ? 'relative' : 'absolute',
  background: position === 'below' ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
  top: position === 'top' ? 0 : undefined,
  bottom: position === 'bottom' ? 0 : undefined,
};
```

### 2. Flexbox Layout
```javascript
display: 'flex',
alignItems: 'center',
flexGrow: 1,
order: actionPosition === 'left' ? -1 : undefined,
```

### 3. Text Ellipsis
```javascript
textOverflow: 'ellipsis',
overflow: 'hidden',
whiteSpace: 'nowrap',
```

---

## 주요 변경 사항

- ❌ styled 시스템 (5개) → ✅ 인라인 스타일 (5개 객체)
- ❌ memoTheme → ✅ 고정 값 ('Roboto...', '16px', '#fff')
- ❌ PropTypes 48줄 → ✅ 제거
- ✅ position, actionPosition 로직 유지
- ✅ 73줄 (279줄 → 74% 감소)

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 279줄 | 73줄 (74% 감소) |
| **Styled 컴포넌트** | 5개 | ❌ |
| **테마 값** | theme.typography.* | 고정 값 |
| **PropTypes** | 48줄 | ❌ |
