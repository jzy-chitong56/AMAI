@ECHO OFF
SET LOG=%~1
ECHO _____________________________
call MakeVERBase.bat 0 ROC
ECHO =============================
if not "%LOG%"=="0" (
    pause
)