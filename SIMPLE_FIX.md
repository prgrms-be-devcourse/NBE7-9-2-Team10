# 🚨 간단한 문제 해결 가이드

## 브랜치 변경 후 에러 발생 시

### 방법 1: 스크립트 실행 (권장)
```powershell
.\fix-dependencies.ps1
```

### 방법 2: 수동 해결 (스크립트 실행 불가 시)
```bash
# 1. 프론트엔드 폴더로 이동
cd frontend

# 2. 기존 의존성 삭제
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 3. 의존성 재설치
npm install

# 4. 빌드 테스트
npm run build
```

### 방법 3: npm install만 실행
```bash
cd frontend
npm install
```

---

## 📦 필요한 의존성 정보

### package.json 내용:
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@swc/helpers": "^0.5.17",
    "axios": "^1.12.2",
    "next": "15.5.6",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-hook-form": "^7.65.0",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### 필요한 Node.js 버전:
- Node.js 18.17 이상
- npm 9.0 이상

---

## 🔧 문제가 계속되면

1. **Node.js 버전 확인**
   ```bash
   node --version
   npm --version
   ```

2. **캐시 클리어**
   ```bash
   npm cache clean --force
   ```

3. **의존성 강제 재설치**
   ```bash
   npm install --legacy-peer-deps
   ```

---

## ✅ 성공 확인

빌드가 성공하면 다음과 같이 출력됩니다:
```
✓ Compiled successfully in 2.7s
✓ Linting and checking validity of types ...
✓ Generating static pages (10/10)
```

