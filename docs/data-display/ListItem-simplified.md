# ListItem 컴포넌트

> List 내의 개별 목록 아이템을 렌더링하는 단순화된 컴포넌트

---

## 무슨 기능을 하는가?

수정된 ListItem은 **목록 아이템을 렌더링하고 Context로 상태를 공유하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **목록 아이템 렌더링** - `<li>` 요소로 개별 아이템 표시
2. **Context 소비/제공** - 부모 List의 dense 상태 받고, 자식에게 전달
3. **dense 모드** - 컴팩트한 패딩
4. **secondaryAction** - 오른쪽 액션 요소

> **제거된 기능**: deprecated v4 API (hasSecondaryAction 감지, ContainerComponent, ContainerProps), slots/slotProps 시스템

---

## 핵심 학습 포인트

### 1. Context 소비 및 제공 (핵심 패턴)

```javascript
// 부모 List의 Context 소비
const context = React.useContext(ListContext);

// 자식에게 전달할 Context 생성
const childContext = React.useMemo(
  () => ({
    dense: dense || context.dense || false,
    alignItems,
    disableGutters,
  }),
  [alignItems, context.dense, dense, disableGutters],
);

return (
  <ListContext.Provider value={childContext}>
    {/* children */}
  </ListContext.Provider>
);
```

**학습 가치**:
- `useContext`: 부모 컴포넌트의 상태 소비
- `useMemo`: 자식에게 전달할 값 최적화
- `dense || context.dense`: 자신의 prop이 우선, 없으면 부모 값 사용
- Provider로 감싸서 자식들도 같은 값 접근 가능

### 2. Dense 상태 병합 로직

```javascript
const childContext = React.useMemo(
  () => ({
    dense: dense || context.dense || false,  // 우선순위: 자신 > 부모 > false
    alignItems,
    disableGutters,
  }),
  [alignItems, context.dense, dense, disableGutters],
);

const isDense = childContext.dense;
```

**학습 가치**:
- ListItem 자체 dense prop이 있으면 우선
- 없으면 부모 List의 dense 값 상속
- 둘 다 없으면 false

### 3. 조건부 패딩 계산

```javascript
const computedStyle = {
  ...baseStyle,
  // 패딩 (disablePadding이 false일 때)
  ...(!disablePadding && {
    paddingTop: isDense ? 4 : 8,
    paddingBottom: isDense ? 4 : 8,
  }),
  // 좌우 패딩 (disablePadding과 disableGutters가 둘 다 false일 때)
  ...(!disablePadding && !disableGutters && {
    paddingLeft: 16,
    paddingRight: 16,
  }),
  // secondaryAction이 있으면 오른쪽 여백 추가
  ...(secondaryAction && {
    paddingRight: 48,
  }),
  ...
};
```

**학습 가치**:
- `isDense ? 4 : 8`: dense 모드면 더 작은 패딩
- 여러 조건의 조합으로 최종 스타일 결정
- secondaryAction은 절대 위치라서 48px 여백 필요

### 4. secondaryAction 렌더링

```javascript
{children}
{secondaryAction && (
  <ListItemSecondaryAction>{secondaryAction}</ListItemSecondaryAction>
)}
```

**학습 가치**:
- children 뒤에 secondaryAction 렌더링
- ListItemSecondaryAction 컴포넌트로 감싸서 절대 위치 처리
- secondaryAction이 있으면 paddingRight: 48로 공간 확보

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/ListItem/ListItem.js (100줄, 원본 437줄)
ListItem (React.forwardRef)
  └─> ListContext.Provider
       └─> Component (기본: li)
            ├─> children
            └─> ListItemSecondaryAction (secondaryAction 있을 때)
                 └─> secondaryAction
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `context` | 부모 List의 Context 값 |
| `childContext` | 자식에게 전달할 Context (useMemo) |
| `isDense` | 최종 dense 상태 |
| `computedStyle` | 최종 합성된 스타일 |

### 3. Props (10개)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `alignItems` | 'center' \| 'flex-start' | 'center' | 정렬 |
| `children` | ReactNode | - | 자식 요소 |
| `className` | string | - | 외부 클래스 |
| `component` | elementType | 'li' | 루트 요소 타입 |
| `dense` | bool | false | 조밀 모드 |
| `disableGutters` | bool | false | 좌우 패딩 제거 |
| `disablePadding` | bool | false | 모든 패딩 제거 |
| `divider` | bool | false | 하단 구분선 |
| `secondaryAction` | ReactNode | - | 오른쪽 액션 |
| `style` | object | - | 인라인 스타일 |

---

## 커밋 히스토리로 보는 단순화 과정

ListItem은 **4개의 커밋**을 통해 단순화되었습니다.

### 1단계: useUtilityClasses 제거
- `cbd4a93d` - [ListItem 단순화 1/4] useUtilityClasses 제거
- **왜 불필요한가**: 자동 CSS 클래스 생성은 테마 커스터마이징용.

### 2단계: useDefaultProps 제거
- `3e2f4bf1` - [ListItem 단순화 2/4] useDefaultProps 제거
- **왜 불필요한가**: 테마 기반 기본값 시스템은 학습 범위 외.

### 3단계: styled 시스템 및 deprecated API 제거
- `4c02d236` - [ListItem 단순화 3/4] styled 시스템 및 deprecated API 제거
- **왜 불필요한가**:
  - styled-components: 별도 학습 주제
  - deprecated v4 API: hasSecondaryAction 감지, ContainerComponent 등
  - slots/slotProps: 복잡한 커스터마이징 시스템

### 4단계: PropTypes 제거
- `32bc0a5f` - [ListItem 단순화 4/4] PropTypes 제거
- **왜 불필요한가**: 런타임 타입 검증으로 컴포넌트 로직과 무관.

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 437줄 | 100줄 (77% 감소) |
| **Props 개수** | 14개 | 10개 |
| **styled 컴포넌트** | ListItemRoot, ListItemContainer | Component + 인라인 스타일 |
| **deprecated API** | hasSecondaryAction, ContainerComponent 등 | 제거됨 |
| **slots 시스템** | slots, slotProps, useSlot | 제거됨 |
| **PropTypes** | 136줄 | 제거됨 |
| **Context** | 유지 | 유지 |

---

## 학습 후 다음 단계

ListItem을 이해했다면:

1. **ListItemButton** - 클릭 가능한 목록 아이템
2. **ListItemText** - 목록 아이템 텍스트
3. **ListItemIcon** - 목록 아이템 아이콘
4. **ListItemSecondaryAction** - 오른쪽 액션 영역

**예시: 기본 사용**
```javascript
import List from './List';
import ListItem from './ListItem';

<List>
  <ListItem>항목 1</ListItem>
  <ListItem>항목 2</ListItem>
</List>
```

**예시: dense 모드 (부모로부터 상속)**
```javascript
<List dense>
  <ListItem>컴팩트 항목 1</ListItem>  {/* dense 상속됨 */}
  <ListItem>컴팩트 항목 2</ListItem>
</List>
```

**예시: dense 모드 (직접 지정)**
```javascript
<List>
  <ListItem>일반 항목</ListItem>
  <ListItem dense>이것만 컴팩트</ListItem>
</List>
```

**예시: secondaryAction**
```javascript
<ListItem
  secondaryAction={
    <IconButton edge="end">
      <DeleteIcon />
    </IconButton>
  }
>
  <ListItemText primary="항목" />
</ListItem>
```

**예시: divider**
```javascript
<List>
  <ListItem divider>구분선 있는 항목</ListItem>
  <ListItem>다음 항목</ListItem>
</List>
```

**예시: alignItems**
```javascript
<ListItem alignItems="flex-start">
  <ListItemAvatar>
    <Avatar />
  </ListItemAvatar>
  <ListItemText
    primary="제목"
    secondary="긴 설명 텍스트..."
  />
</ListItem>
```
