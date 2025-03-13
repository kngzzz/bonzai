@echo off
REM Script to run the ReAct Agent Backend server on Windows

REM Check if virtual environment exists, if not create it
if not exist .venv (
    echo Virtual environment not found. Creating one...
    echo.
    echo If you have uv installed (recommended):
    echo   uv venv
    echo   .venv\Scripts\activate
    echo   uv pip install -r requirements.txt
    echo.
    echo If you prefer pip:
    echo   python -m venv .venv
    echo   .venv\Scripts\activate
    echo   pip install -r requirements.txt
    echo.
    echo Then run this script again.
    exit /b 1
)

REM Activate virtual environment if not already activated
if "%VIRTUAL_ENV%"=="" (
    echo Activating virtual environment...
    call .venv\Scripts\activate
)

REM Load environment variables from .env file if it exists
if exist .env (
    echo Loading environment variables from .env file...
    for /F "tokens=*" %%A in (.env) do (
        set %%A
    )
)

REM Check if Anthropic API key is set
if "%ANTHROPIC_API_KEY%"=="" (
    echo Error: ANTHROPIC_API_KEY environment variable is not set.
    echo Please set it in the .env file or set it before running this script.
    exit /b 1
)

REM Set default environment if not set
if "%ENVIRONMENT%"=="" (
    set ENVIRONMENT=development
    echo Setting default ENVIRONMENT to 'development'
)

REM Set default authentication if not set
if "%AUTH_USERNAME%"=="" (
    set AUTH_USERNAME=admin
    echo Setting default AUTH_USERNAME to 'admin'
)

if "%AUTH_PASSWORD%"=="" (
    set AUTH_PASSWORD=password
    echo Setting default AUTH_PASSWORD to 'password'
    echo WARNING: Using default password. Change this in production!
)

REM Set default host and port if not set
if "%HOST%"=="" (
    set HOST=0.0.0.0
    echo Setting default HOST to '0.0.0.0'
)

if "%PORT%"=="" (
    set PORT=8000
    echo Setting default PORT to '8000'
)

REM Create logs directory if it doesn't exist
if not exist logs mkdir logs

REM Run the server
echo Starting ReAct Agent Backend server...
echo Environment: %ENVIRONMENT%
echo Host: %HOST%
echo Port: %PORT%
echo Press Ctrl+C to stop the server

if "%ENVIRONMENT%"=="development" (
    REM Run with reload in development mode
    uvicorn main:app --host %HOST% --port %PORT% --reload
) else (
    REM Run without reload in production mode
    uvicorn main:app --host %HOST% --port %PORT%
)
