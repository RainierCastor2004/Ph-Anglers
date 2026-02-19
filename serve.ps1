param(
  [int]$Port = 8000
)
$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $PWD on $prefix"

function Get-ContentType($path){
  $ext = [System.IO.Path]::GetExtension($path).ToLower()
  switch ($ext) {
    '.html' { return 'text/html' }
    '.css' { return 'text/css' }
    '.js' { return 'application/javascript' }
    '.json' { return 'application/json' }
    '.png' { return 'image/png' }
    '.jpg' { return 'image/jpeg' }
    '.jpeg' { return 'image/jpeg' }
    '.svg' { return 'image/svg+xml' }
    default { return 'application/octet-stream' }
  }
}

while ($listener.IsListening) {
  try{
    $context = $listener.GetContext()
  } catch { break }
  $request = $context.Request
  $response = $context.Response
  $localPath = $request.Url.LocalPath.TrimStart('/')
  if ($localPath -eq '') { $localPath = 'index.html' }
  $file = Join-Path $PSScriptRoot $localPath
  if (Test-Path $file) {
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $response.ContentType = Get-ContentType $file
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes,0,$bytes.Length)
  } else {
    $response.StatusCode = 404
    $msg = "Not Found: $localPath"
    $b = [System.Text.Encoding]::UTF8.GetBytes($msg)
    $response.ContentType = 'text/plain'
    $response.ContentLength64 = $b.Length
    $response.OutputStream.Write($b,0,$b.Length)
  }
  $response.OutputStream.Close()
}

$listener.Stop()
