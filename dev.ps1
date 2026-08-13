$portable = "$env:USERPROFILE\source\tools\node"
if (Test-Path "$portable\npm.cmd") {
  $env:PATH = "$portable;$env:PATH"
}
npm run dev
