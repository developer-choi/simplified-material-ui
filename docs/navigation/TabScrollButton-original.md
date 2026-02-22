# TabScrollButton (Original)

## 역할

`Tabs` 컴포넌트에서 탭 목록이 넘칠 때 좌/우(또는 상/하) 스크롤 버튼. `Tabs`가 내부적으로 렌더링.

---

## 구조

```
TabScrollButton (ButtonBase[component="div", role=null, tabIndex=null])
  └─ {direction === 'left' ? <StartButtonIcon> : <EndButtonIcon>}
     (KeyboardArrowLeft / KeyboardArrowRight)
```

---

## 주요 props

| prop | 역할 |
|------|------|
| `direction` | 'left'/'right' → 표시할 화살표 방향 |
| `orientation` | 'horizontal'/'vertical' → vertical 시 치수 변경 + 아이콘 회전 |
| `disabled` | `opacity: 0` (완전 투명, 공간은 유지) |

---

## 복잡도 원인

```js
// 1. CSS 변수로 SVG 회전 처리
// styled에서:
'& svg': { transform: 'var(--TabScrollButton-svgRotate)' }

// 렌더 시 runtime으로 주입:
style={{
  '--TabScrollButton-svgRotate': `rotate(${isRtl ? -90 : 90}deg)`,
}}
// RTL 여부에 따라 방향을 반전

// 2. ButtonBase[component="div", role=null, tabIndex=null]
// → 클릭 가능하지만 non-interactive (Tabs가 클릭 처리)

// 3. slots/slotProps로 아이콘 교체 가능
const StartButtonIcon = slots.StartScrollButtonIcon ?? KeyboardArrowLeft;
const endButtonIconProps = useSlotProps({ elementType: EndButtonIcon, ... });

// 4. RTL: useRtl() 훅으로 텍스트 방향 감지
const isRtl = useRtl();
```

---

## disabled 처리

```js
[`&.${tabScrollButtonClasses.disabled}`]: {
  opacity: 0,
}
// → active시 opacity: 0.8, disabled시 opacity: 0
// 공간은 유지하면서 완전히 보이지 않게 함
```
