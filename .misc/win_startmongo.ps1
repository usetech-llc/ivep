param (
    [string]$logpath = "D:\data\mongo\log\.log",
    [string]$dbpath = "D:\data\mongo\db\"
 )

Start -FilePath "C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe" -ArgumentList @("--logpath $logpath", "--dbpath $dbpath")
