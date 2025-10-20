# 프로젝트 설정 가이드

## 🚨 브랜치 변경 후 에러 발생 시 해결 방법

다른 브랜치에서 돌아온 후 다음과 같은 에러가 발생할 수 있습니다:
- `Cannot find module 'react'` 에러
- `Cannot find module 'next'` 에러  
- JSX 타입 에러
- ESLint 에러

## 🔧 해결 단계

### 1. 프론트엔드 의존성 재설치

```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 기존 node_modules와 package-lock.json 삭제
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 의존성 재설치
npm install
```

### 2. 백엔드 의존성 확인 (필요시)

```bash
# 백엔드 디렉토리로 이동
cd ../backend/unimate

# Gradle 빌드
./gradlew clean build
```

### 3. 프로젝트 빌드 테스트

```bash
# 프론트엔드 빌드 테스트
cd ../../frontend
npm run build

# 개발 서버 실행 (선택사항)
npm run dev
```

## ✅ 정상 작동 확인

빌드가 성공하면 다음과 같은 메시지가 출력됩니다:

```
✓ Compiled successfully in 2.7s
✓ Linting and checking validity of types ...
✓ Generating static pages (10/10)
```

## 🐛 문제가 계속 발생하는 경우

1. **캐시 클리어**
   ```bash
   npm cache clean --force
   ```

2. **Node.js 버전 확인**
   ```bash
   node --version
   npm --version
   ```

3. **패키지 매니저 재설치**
   ```bash
   npm install --legacy-peer-deps
   ```

## 📝 참고사항

- 이 문제는 주로 브랜치 변경 시 `node_modules`가 손상되어 발생합니다
- `package.json`은 그대로 두고 `node_modules`와 `package-lock.json`만 삭제하고 재설치하면 됩니다
- 백엔드는 Gradle을 사용하므로 별도 문제가 없을 가능성이 높습니다

## 🔗 유용한 명령어

```bash
# 의존성 상태 확인
npm list --depth=0

# ESLint 검사
npm run lint

# 타입 체크
npx tsc --noEmit
```
