@echo off
echo Applying CORS configuration to Firebase Storage...
call gsutil cors set cors.json gs://sobek-play.firebasestorage.app
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Failed to apply CORS via gsutil.
    echo Please ensure you have the Google Cloud CLI installed and authenticated.
    echo Alternatively, you can use the Firebase console or a temporary function.
) else (
    echo ✅ CORS configuration updated successfully.
)
pause
