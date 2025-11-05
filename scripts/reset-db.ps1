# Database Reset Script
# Deletes existing SQLite database and recreates with fresh admin user + sample data

Write-Host "🗑️  Resetting database..." -ForegroundColor Yellow

# Delete existing database
$dbPath = "data/portfolio.db"
if (Test-Path $dbPath) {
    Remove-Item $dbPath -Force
    Write-Host "✅ Deleted existing database" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No existing database found" -ForegroundColor Cyan
}

# Delete WAL and SHM files if they exist
if (Test-Path "data/portfolio.db-wal") {
    Remove-Item "data/portfolio.db-wal" -Force
    Write-Host "✅ Deleted WAL file" -ForegroundColor Green
}
if (Test-Path "data/portfolio.db-shm") {
    Remove-Item "data/portfolio.db-shm" -Force
    Write-Host "✅ Deleted SHM file" -ForegroundColor Green
}

# Recreate and seed
Write-Host "`n🔄 Running setup scripts..." -ForegroundColor Yellow
npm run setup

Write-Host "`n✨ Database reset complete!" -ForegroundColor Green
Write-Host "You can now start the dev server with: npm run dev" -ForegroundColor Cyan
