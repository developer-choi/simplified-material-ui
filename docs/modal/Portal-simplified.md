# Portal 컴포넌트

> Material-UI Portal을 단순화한 버전 - 핵심 기능만 남김

---

## 무슨 기능을 하는가?

수정된 Portal은 **자식 요소를 document.body에 렌더링**하는 단순한 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **document.body에 렌더링** - ReactDOM.createPortal() 사용
2. **Ref 전달** - forwardedRef를 mountNode(document.body)에 전달

---

## 내부 구조

### 1. 전체 코드 (84줄, 원본 90줄)

**위치**: `packages/mui-material/src/Portal/Portal.tsx`

```typescript
const Portal = React.forwardRef(function Portal(
  props: PortalProps,
  forwardedRef: React.ForwardedRef<Element>,
) {
  const { children } = props;
  const [mountNode, setMountNode] = React.useState<Element | null>(null);

  useEnhancedEffect(() => {
    setMountNode(document.body);
  }, []);

  useEnhancedEffect(() => {
    if (mountNode) {
      setRef(forwardedRef, mountNode);
      return () => {
        setRef(forwardedRef, null);
      };
    }

    return undefined;
  }, [forwardedRef, mountNode]);

  return mountNode ? ReactDOM.createPortal(children, mountNode) : mountNode;
});
```

### 2. Props (1개만 남음)

| Prop | 타입 | 설명 |
|------|------|------|
| `children` | ReactNode | Portal에 렌더링할 콘텐츠 |

### 3. 핵심 로직

#### mountNode 상태 관리
```typescript
const [mountNode, setMountNode] = React.useState<Element | null>(null);

useEnhancedEffect(() => {
  setMountNode(document.body);
}, []);
```
- **항상 document.body** - 하드코딩
- 의존성 배열이 비어있어 최초 1번만 실행

#### Ref 전달
```typescript
useEnhancedEffect(() => {
  if (mountNode) {
    setRef(forwardedRef, mountNode);
    return () => {
      setRef(forwardedRef, null);
    };
  }

  return undefined;
}, [forwardedRef, mountNode]);
```
- forwardedRef에 document.body 전달
- cleanup 시 ref를 null로 초기화

#### 최종 렌더링
```typescript
return mountNode ? ReactDOM.createPortal(children, mountNode) : mountNode;
```
- mountNode(document.body)가 있으면 createPortal()로 렌더링
- 없으면 null 반환

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 90줄 | 84줄 |
| **Props 개수** | 3개 | 1개 |
| **container 지정** | ✅ | ❌ (항상 document.body) |
| **disablePortal** | ✅ | ❌ |
| **SSR 함수 지원** | ✅ | ❌ |
| **useForkRef** | ✅ | ❌ |
| **getReactElementRef** | ✅ | ❌ |
| **PropTypes** | ✅ | ✅ (그대로 유지) |
