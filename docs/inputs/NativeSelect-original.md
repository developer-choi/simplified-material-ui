# NativeSelect 컴포넌트

> NativeSelect 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

NativeSelect는 **브라우저 기본 `<select>` 드롭다운 컴포넌트**입니다.
MUI의 `Select` 컴포넌트보다 번들 크기가 훨씬 작습니다.

### 핵심 기능
1. **브라우저 기본 select** - 네이티브 `<select>` 엘리먼트 사용
2. **드롭다운 아이콘** - `ArrowDropDown` 아이콘 우측 오버레이
3. **multiple 지원** - `multiple={true}`일 때 아이콘 숨김
4. **disabled/open** - 시각적 상태 변경 (커서, 아이콘 색상/회전)

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/NativeSelect/NativeSelect.js       (40줄)
packages/mui-material/src/NativeSelect/NativeSelectInput.js  (54줄)
```

### 컴포넌트 계층

```
NativeSelect (thin wrapper)
  └─> NativeSelectInput
        ├─> <select> (브라우저 기본 드롭다운)
        └─> ArrowDropDownIcon (아이콘, multiple=false일 때만)
```

### 주요 Props

| Prop | 타입 | 설명 |
|------|------|------|
| `children` | node | `<option>` 항목들 |
| `value` | any | 선택된 값 |
| `onChange` | func | 변경 콜백 |
| `disabled` | bool | 비활성화 |
| `multiple` | bool | 다중 선택 (아이콘 숨김) |
| `open` | bool | 아이콘 180도 회전 (열림 표시) |
| `error` | bool | 에러 상태 (DOM에 전달 안 함) |

### 핵심 로직 발췌

```javascript
// NativeSelect.js - 얇은 래퍼, ref 전달
const NativeSelect = React.forwardRef(function NativeSelect(props, ref) {
  const { children, disabled, error, multiple, open, value, onChange, name, ...other } = props;
  return (
    <NativeSelectInput ref={ref} disabled={disabled} error={error} ... {...other}>
      {children}
    </NativeSelectInput>
  );
});
NativeSelect.muiName = 'Select'; // MUI 내부 컴포넌트 감지용

// NativeSelectInput.js - 실제 렌더링
const selectStyle = {
  MozAppearance: 'none',   // 브라우저 기본 화살표 제거
  WebkitAppearance: 'none',
  cursor: disabled ? 'default' : 'pointer',
  paddingRight: 24,        // 아이콘 공간
};

const iconStyle = {
  position: 'absolute', right: 0,
  color: disabled ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.54)',
  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
};
```

---

## 복잡도의 이유

NativeSelect는 **매우 단순한 컴포넌트**입니다. 약 95줄이며, 복잡한 요소가 거의 없습니다:

1. **2개 파일** - NativeSelect (래퍼) + NativeSelectInput (실제 구현)
2. **forwardRef** - 두 파일 모두 존재
3. **muiName** - MUI Input 컴포넌트 감지 시스템용 static prop

---

## 간소화 방향

- **forwardRef** 제거 (두 파일 모두)
- **NativeSelect.muiName** 제거 (내부 MUI 시스템)
- **NativeSelect props 전달** 단순화 (불필요한 명시적 destructuring)

> 상세한 간소화 결과는 `NativeSelect-simplified.md` 참고
