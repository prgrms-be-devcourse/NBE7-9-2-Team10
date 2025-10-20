# 프로젝트 의존성 문제 해결 스크립트
# 브랜치 변경 후 에러 발생 시 사용

Write-Host "🔧 프로젝트 의존성 문제 해결을 시작합니다..." -ForegroundColor Green

# 프론트엔드 디렉토리로 이동
Write-Host "📁 프론트엔드 디렉토리로 이동..." -ForegroundColor Yellow
Set-Location frontend

# 기존 의존성 삭제
Write-Host "🗑️  기존 node_modules 삭제..." -ForegroundColor Red
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "✅ node_modules 삭제 완료" -ForegroundColor Green
}

Write-Host "🗑️  package-lock.json 삭제..." -ForegroundColor Red
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "✅ package-lock.json 삭제 완료" -ForegroundColor Green
}

# 의존성 재설치
Write-Host "📦 의존성 재설치 중..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 의존성 설치 완료!" -ForegroundColor Green
    
    # 빌드 테스트
    Write-Host "🔨 빌드 테스트 실행..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 모든 문제가 해결되었습니다!" -ForegroundColor Green
        Write-Host "프로젝트가 정상적으로 작동합니다." -ForegroundColor Green
    } else {
        Write-Host "❌ 빌드에 실패했습니다. 추가 확인이 필요합니다." -ForegroundColor Red
    }
} else {
    Write-Host "❌ 의존성 설치에 실패했습니다." -ForegroundColor Red
    Write-Host "npm cache clean --force 를 실행해보세요." -ForegroundColor Yellow
}

Write-Host "`n스크립트 실행 완료!" -ForegroundColor Cyan
