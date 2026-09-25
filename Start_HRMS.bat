@echo off
title Galapitiyagama Sanasa HRMS System Launcher
color 0A
echo =========================================================================
echo    Galapitiyagama Sanasa Cooperative Society Ltd
echo    ගලපිටියගම සනස සමුපකාර සමිතිය - මානව සම්පත් කළමනාකරණ පරිගණක පද්ධතිය
echo =========================================================================
echo.
echo Starting .NET 9 Web Server...
echo System is launching on:
echo   -> Local PC: http://localhost:5000
echo   -> Mobile Phone QR Scanner: Open on your Wi-Fi IP address
echo.

start "" "http://localhost:5000"
dotnet run --urls "http://0.0.0.0:5000"

pause
