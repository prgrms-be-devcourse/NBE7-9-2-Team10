# 🚨 빠른 문제 해결 가이드

## 브랜치 변경 후 에러 발생 시

다른 브랜치에서 pull 받은 후 다음과 같은 에러가 발생하면:

```
Cannot find module 'react' or its corresponding type declarations
JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists
```

## 🔧 해결 방법

### 방법 1: 자동 스크립트 실행 (권장)

```powershell
# PowerShell에서 실행
.\fix-dependencies.ps1
```

### 방법 2: 수동 해결

```bash
# 1. 프론트엔드 디렉토리로 이동
cd frontend

# 2. 기존 의존성 삭제
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 3. 의존성 재설치
npm install

# 4. 빌드 테스트
npm run build
```

### 방법 3: 캐시 클리어 (문제가 계속될 때)

```bash
npm cache clean --force
npm install --legacy-peer-deps
```

## ✅ 성공 확인

빌드가 성공하면 다음과 같이 출력됩니다:

```
✓ Compiled successfully in 2.7s
✓ Linting and checking validity of types ...
✓ Generating static pages (10/10)
```

## 📞 문제가 계속되면

1. Node.js 버전 확인: `node --version`
2. npm 버전 확인: `npm --version`
3. 팀원에게 문의
