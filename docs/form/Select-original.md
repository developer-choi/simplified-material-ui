# Select 컴포넌트

> Select 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

Select는 **드롭다운 선택 컴포넌트**입니다. MUI의 Menu를 팝업으로 사용하는 커스텀 select입니다.

### 핵심 기능
1. **controlled/uncontrolled** - `value`/`defaultValue` 두 방식 모두 지원
2. **open/close 제어** - `open`/`defaultOpen` 으로 메뉴 열림 상태 제어
3. **multiple 선택** - `multiple={true}`로 배열 값 선택
4. **displayEmpty** - 빈 값일 때도 label notch 표시
5. **renderValue** - 선택된 값 커스텀 렌더링
6. **키보드 접근성** - Space/ArrowUp/ArrowDown/Enter로 메뉴 열기
7. **labelId 연결** - `<InputLabel>`의 클릭으로 Select 포커스

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/Select/Select.js       (71줄)
packages/mui-material/src/Select/SelectInput.js  (464줄)
```

### 컴포넌트 계층

```
Select (API 래퍼)
  └─> OutlinedInput (form field 컨테이너)
        └─> SelectInput (inputComponent로 주입)
              ├─> <div role="combobox"> (보이는 선택 영역)
              ├─> <input hidden> (form 값 전송용)
              ├─> <IconComponent> (ArrowDropDown 아이콘)
              └─> <Menu> (드롭다운 팝업)
                    └─> children (MenuItem들, cloneElement로 수정됨)
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `value` | any | - | (controlled) 선택된 값 |
| `defaultValue` | any | - | (uncontrolled) 초기값 |
| `open` | bool | - | (controlled) 메뉴 열림 |
| `defaultOpen` | bool | `false` | (uncontrolled) 초기 열림 |
| `multiple` | bool | `false` | 다중 선택 |
| `renderValue` | func | - | 선택값 커스텀 렌더링 |
| `labelId` | string | - | InputLabel 연결용 ID |
| `MenuProps` | object | `{}` | Menu 컴포넌트 props |
| `SelectDisplayProps` | object | `{}` | combobox div props |
| `IconComponent` | elementType | `ArrowDropDownIcon` | 드롭다운 아이콘 |

### 핵심 로직 발췌

```javascript
// Select.js - cloneElement 패턴 (이상한 래퍼)
const InputComponent = <StyledOutlinedInput label={label} />;
return React.cloneElement(InputComponent, {
  inputComponent: SelectInput,  // OutlinedInput의 내부 input을 SelectInput으로 교체
  inputProps: { children, IconComponent, multiple, ... },
  ref,
  ...other,
});

// SelectInput.js - open/value 두 개 모두 controlled
const [value, setValueState] = useControlled({ controlled: valueProp, default: defaultValue });
const [openState, setOpenState] = useControlled({ controlled: openProp, default: defaultOpen });

// displayNode 함수형 ref - Menu의 anchorEl로 사용
const handleDisplayRef = React.useCallback((node) => {
  displayRef.current = node;
  if (node) setDisplayNode(node);  // state update로 리렌더 트리거
}, []);
const anchorElement = displayNode?.parentNode;  // OutlinedInput의 루트 요소

// useImperativeHandle - 외부에서 focus/value 접근
React.useImperativeHandle(handleRef, () => ({
  focus: () => displayRef.current.focus(),
  node: inputRef.current,
  value,
}), [value]);

// labelId 효과 - InputLabel 클릭 시 Select 포커스
React.useEffect(() => {
  const label = document.getElementById(labelId);
  label.addEventListener('click', () => {
    if (getSelection().isCollapsed) displayRef.current.focus();
  });
}, [labelId]);

// handleItemClick - 이벤트 target 재정의 (form 라이브러리 호환)
const clonedEvent = new nativeEvent.constructor(nativeEvent.type, nativeEvent);
Object.defineProperty(clonedEvent, 'target', {
  writable: true,
  value: { value: newValue, name },
});
onChange(clonedEvent, child);
```

---

## 복잡도의 이유

1. **2개 파일** - Select (래퍼) + SelectInput (구현, 464줄)
2. **이중 useControlled** - value와 open 상태 모두 controlled/uncontrolled 지원
3. **cloneElement 패턴** - OutlinedInput에 props를 주입하는 특이한 방식
4. **useImperativeHandle** - focus/value API 노출
5. **labelId DOM 이벤트** - React 밖에서 label 클릭 이벤트 직접 처리
6. **이벤트 재정의** - form 라이브러리 호환을 위해 clonedEvent.target 오버라이드
7. **displayNode 함수형 ref** - Menu anchor 위치 계산을 위한 상태 동기화

---

## 간소화 방향

- **Select.js**: forwardRef/muiName 제거, cloneElement → 직접 JSX
- **SelectInput.js**:
  - forwardRef + useForkRef + useImperativeHandle + inputRefProp 제거
  - labelId DOM 이벤트 리스너 제거
  - className + `delete other['aria-invalid']` 정리

> 상세한 간소화 결과는 `Select-simplified.md` 참고
