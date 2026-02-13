Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "PID: $($_.OwningProcess)"
    Stop-Process -Id $_.OwningProcess -Force
