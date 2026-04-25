# Script de Monitoramento SENAI (Heartbeat)
# Configure o endereço do servidor abaixo
$ServerUrl = "http://localhost:3001/api/computadores/heartbeat"

Write-Host "Iniciando monitoramento de ativos..." -ForegroundColor Cyan

while($true) {
    try {
        # Obtém o MAC Address da interface ativa
        $mac = (Get-NetAdapter | Where-Object {$_.Status -eq "Up"}).MacAddress | Select-Object -First 1
        
        # Obtém o IP local
        $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}).IPAddress | Select-Object -First 1

        if ($mac) {
            $body = @{
                mac = $mac
                ip  = $ip
            } | ConvertTo-Json

            Invoke-RestMethod -Uri $ServerUrl -Method Post -Body $body -ContentType "application/json"
            Write-Host "[$(Get-Date)] Sinal enviado com sucesso (MAC: $mac)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "[$(Get-Date)] Erro ao comunicar com o servidor: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Aguarda 5 minutos para o próximo pulso
    Start-Sleep -Seconds 300
}
