$projectRoot = Split-Path $PSScriptRoot -Parent
$dbBase = Join-Path $projectRoot '.runtime/mysql/mysql-8.4.13-winx64'
if (!(Test-Path -LiteralPath (Join-Path $dbBase 'data/auto.cnf'))) { throw 'Initialize the portable MySQL instance first; see README.' }
Start-Process -FilePath (Join-Path $dbBase 'bin/mysqld.exe') -ArgumentList @('--no-defaults', ('--basedir="' + $dbBase + '"'), ('--datadir="' + (Join-Path $dbBase 'data') + '"'), '--port=3307', '--bind-address=127.0.0.1', '--mysqlx=OFF') -WindowStyle Hidden
