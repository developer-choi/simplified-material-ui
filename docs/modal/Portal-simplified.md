# Portal 컴포넌트

> Material-UI Portal을 단순화한 버전 - 핵심 기능만 남김

---

## 무슨 기능을 하는가?

수정된 Portal은 **자식 요소를 document.body에 렌더링**하는 단순한 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **document.body에 렌더링** - ReactDOM.createPortal() 사용
2. **Ref 전달** - forwardedRef를 mountNode(document.body)에 전달

### 제거된 기능
1. ❌ container prop (항상 document.body)
2. ❌ disablePortal prop
3. ❌ 자식의 ref 병합 (useForkRef, getReactElementRef)
4. ❌ PropTypes 검증

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

---

## 설계 철학의 변화

### 원본: "유연성과 호환성"
- container 커스터마이징
- disablePortal로 Portal 끄기
- 자식 ref 병합
- SSR 안전성

### 수정본: "단순함과 명확함"
- document.body 하드코딩
- Portal 기능만 제공
- Ref 병합 제거
- SSR 미지원 (container 함수 없음)

---

## 제한 사항

1. **container 고정** - 항상 document.body, 변경 불가
2. **Portal 비활성화 불가** - disablePortal 없음
3. **자식 ref 병합 안 됨** - useForkRef, getReactElementRef 제거
4. **SSR 미지원** - container 함수 기능 없음

---

## 사용 예시

### 기본 사용 (유일한 방법)
```typescript
<Portal>
  <div>항상 document.body에 렌더링됨</div>
</Portal>
```

### forwardedRef로 container 접근
```typescript
const portalRef = useRef<Element>(null);

<Portal ref={portalRef}>
  <div>컨텐츠</div>
</Portal>

// portalRef.current === document.body
```

---

## 의존성

```typescript
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import setRef from '@mui/utils/setRef';
import exactProp from '@mui/utils/exactProp';
import HTMLElementType from '@mui/utils/HTMLElementType';
```

**제거된 의존성**:
- ❌ `useForkRef` - 자식 ref 병합 제거
- ❌ `getReactElementRef` - 자식 ref 추출 제거

---

## 장단점

### 장점
- ✅ 코드 단순함 (84줄)
- ✅ 이해하기 쉬움
- ✅ document.body 렌더링 보장

### 단점
- ❌ 커스터마이징 불가
- ❌ disablePortal 없음
- ❌ SSR 미지원
- ❌ 유연성 부족

---

## 왜 이렇게 단순화했는가?

1. **대부분의 경우 document.body면 충분** - container 커스터마이징은 드물게 사용됨
2. **disablePortal은 거의 안 씀** - Portal을 쓸 거면 Portal로 쓰고, 안 쓸 거면 Portal 자체를 안 씀
3. **ref 병합은 복잡도만 증가** - forwardedRef만으로 충분
4. **SSR은 프로젝트 요구사항 아님** - 클라이언트 전용 프로젝트

---

*분석 일자: 2025-12-07*
*브랜치: fix/docs*
*파일: packages/mui-material/src/Portal/Portal.tsx*
*코드 라인: 84줄 (원본 90줄)*
*코드 감소: 6줄 (-7%)*
