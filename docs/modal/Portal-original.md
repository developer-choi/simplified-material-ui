# Portal 컴포넌트

> Material-UI의 Portal 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Portal은 **자식 요소를 DOM 계층 구조 외부의 다른 위치에 렌더링**하는 컴포넌트입니다.

### 핵심 기능
1. **DOM 외부 렌더링** - ReactDOM.createPortal()을 사용하여 자식을 다른 DOM 노드에 렌더링
2. **컨테이너 지정** - container prop으로 렌더링 위치 지정 (기본값: document.body)
3. **Portal 비활성화** - disablePortal prop으로 일반 렌더링으로 전환 가능
4. **Ref 전달** - forwardedRef를 mountNode에 전달하여 외부에서 컨테이너 참조 가능

### 사용 목적
- **z-index 문제 해결** - 부모의 overflow:hidden, z-index에 영향받지 않음
- **Modal, Dialog 구현** - 화면 최상단에 렌더링
- **Tooltip, Popover** - 부모 컴포넌트 외부에 표시
- **SSR 지원** - container를 함수로 제공하여 서버 렌더링 가능

---

## 내부 구조

### 1. 전체 코드 (약 90줄)

**위치**: `packages/mui-material/src/Portal/Portal.tsx`

```typescript
const Portal = React.forwardRef(function Portal(
  props: PortalProps,
  forwardedRef: React.ForwardedRef<Element>,
) {
  const { children, container, disablePortal = false } = props;
  const [mountNode, setMountNode] = React.useState<ReturnType<typeof getContainer>>(null);

  const handleRef = useForkRef(
    React.isValidElement(children) ? getReactElementRef(children) : null,
    forwardedRef,
  );

  useEnhancedEffect(() => {
    if (!disablePortal) {
      setMountNode(getContainer(container) || document.body);
    }
  }, [container, disablePortal]);

  useEnhancedEffect(() => {
    if (mountNode && !disablePortal) {
      setRef(forwardedRef, mountNode);
      return () => {
        setRef(forwardedRef, null);
      };
    }

    return undefined;
  }, [forwardedRef, mountNode, disablePortal]);

  if (disablePortal) {
    if (React.isValidElement(children)) {
      const newProps = {
        ref: handleRef,
      };
      return React.cloneElement(children, newProps);
    }
    return children;
  }

  return mountNode ? ReactDOM.createPortal(children, mountNode) : mountNode;
});
```

### 2. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | Portal에 렌더링할 콘텐츠 |
| `container` | HTMLElement \| function | document.body | 렌더링할 컨테이너 (함수 가능) |
| `disablePortal` | boolean | false | true면 Portal을 비활성화하고 일반 렌더링 |

### 3. 핵심 로직

#### getContainer 함수
```typescript
function getContainer(container: PortalProps['container']) {
  return typeof container === 'function' ? container() : container;
}
```
- container가 함수면 실행하고, 아니면 그대로 반환
- **SSR 지원**: 서버에서는 함수가 실행되지 않아 안전

#### mountNode 상태 관리
```typescript
const [mountNode, setMountNode] = React.useState<ReturnType<typeof getContainer>>(null);

useEnhancedEffect(() => {
  if (!disablePortal) {
    setMountNode(getContainer(container) || document.body);
  }
}, [container, disablePortal]);
```
- **useEnhancedEffect**: useLayoutEffect + SSR 안전성
- container가 변경되면 mountNode 재설정

#### Ref 전달
```typescript
const handleRef = useForkRef(
  React.isValidElement(children) ? getReactElementRef(children) : null,
  forwardedRef,
);

useEnhancedEffect(() => {
  if (mountNode && !disablePortal) {
    setRef(forwardedRef, mountNode);
    return () => {
      setRef(forwardedRef, null);
    };
  }

  return undefined;
}, [forwardedRef, mountNode, disablePortal]);
```
- **useForkRef**: 여러 ref를 하나로 병합
- forwardedRef에 mountNode를 설정하여 외부에서 컨테이너 접근 가능
- cleanup 시 ref를 null로 초기화

#### disablePortal 처리
```typescript
if (disablePortal) {
  if (React.isValidElement(children)) {
    const newProps = {
      ref: handleRef,
    };
    return React.cloneElement(children, newProps);
  }
  return children;
}
```
- Portal을 비활성화하면 일반 컴포넌트처럼 동작
- children이 React 엘리먼트면 ref를 전달

#### 최종 렌더링
```typescript
return mountNode ? ReactDOM.createPortal(children, mountNode) : mountNode;
```
- mountNode가 있으면 createPortal()로 렌더링
- 없으면 null 반환 (초기 렌더링 시)

---

## 설계 철학

### 1. SSR 안전성
- container를 함수로 받아서 서버에서 실행 방지
- useEnhancedEffect로 useLayoutEffect + SSR 호환

### 2. 유연성
- container를 커스터마이징 가능
- disablePortal로 Portal 기능 끄기 가능

### 3. Ref 관리
- forwardedRef로 mountNode 노출
- useForkRef로 여러 ref 병합

### 4. 점진적 렌더링
- 초기 mountNode가 null이면 아무것도 렌더링 안 함
- useEnhancedEffect로 mountNode 설정 후 재렌더링

---

## 사용 예시

### 기본 사용
```typescript
<Portal>
  <div>document.body에 렌더링됨</div>
</Portal>
```

### 커스텀 컨테이너
```typescript
const containerRef = useRef<HTMLElement>(null);

<div ref={containerRef} />

<Portal container={containerRef.current}>
  <div>containerRef에 렌더링됨</div>
</Portal>
```

### 함수로 컨테이너 지정 (SSR 안전)
```typescript
<Portal container={() => document.getElementById('modal-root')}>
  <div>modal-root에 렌더링됨</div>
</Portal>
```

### Portal 비활성화
```typescript
<Portal disablePortal>
  <div>일반 렌더링 (부모 아래)</div>
</Portal>
```

---

## PropTypes

```typescript
Portal.propTypes = {
  children: PropTypes.node,
  container: PropTypes.oneOfType([HTMLElementType, PropTypes.func]),
  disablePortal: PropTypes.bool,
};
```

---

## 복잡도의 이유

Portal은 약 90줄의 간단한 컴포넌트지만, 다음 기능들을 지원합니다:

1. **SSR 안전성** - container 함수, useEnhancedEffect
2. **Ref 관리** - useForkRef, setRef, getReactElementRef
3. **동적 컨테이너** - container 변경 감지
4. **Portal 비활성화** - disablePortal 지원
5. **PropTypes 검증** - 개발 모드에서 타입 체크

---

## 핵심 차이점: React Portal vs MUI Portal

| 기능 | React.createPortal | MUI Portal |
|------|-------------------|------------|
| **기본 렌더링** | ✅ | ✅ |
| **컨테이너 지정** | ✅ (수동) | ✅ (props) |
| **SSR 안전** | ❌ | ✅ (함수 지원) |
| **Ref 전달** | ❌ | ✅ (forwardedRef) |
| **Portal 비활성화** | ❌ | ✅ (disablePortal) |
| **동적 컨테이너** | ❌ | ✅ (useEffect) |

---

## 의존성

```typescript
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import setRef from '@mui/utils/setRef';
import getReactElementRef from '@mui/utils/getReactElementRef';
import exactProp from '@mui/utils/exactProp';
import HTMLElementType from '@mui/utils/HTMLElementType';
```

---

*분석 일자: 2025-12-07*
*브랜치: master*
*파일: packages/mui-material/src/Portal/Portal.tsx*
*코드 라인: 약 90줄*
