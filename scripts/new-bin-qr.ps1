# Generates the printable QR code for a collection bin. The QR points to
# the live scan page with the bin's id, e.g.:
#   https://re-charge.co.za/scan.html?bin=RC-0001&src=bin-RC-0001
# (?src= keeps per-bin attribution in analytics.)
#
#   .\scripts\new-bin-qr.ps1 -BinId RC-0001
#
# Output: qr\RC-0001.svg (vector — print at any size).
# Remember to also add the bin as a row in the Bins tab of the rewards
# Sheet (binId, name, location, active=true) or scans will show
# "Unknown bin".
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^RC-\d{4}$')]
  [string]$BinId
)

$url = "https://re-charge.co.za/scan.html?bin=$BinId&src=bin-$BinId"
$out = Join-Path (Join-Path $PSScriptRoot '..') "qr\$BinId.svg"
New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null

$api = 'https://api.qrserver.com/v1/create-qr-code/?format=svg&size=600x600&margin=2&data=' +
  [uri]::EscapeDataString($url)
Invoke-WebRequest $api -OutFile $out

Write-Host "QR for $BinId -> $out"
Write-Host "Encodes: $url"
Write-Host "Don't forget the Bins tab row in the rewards Sheet."
