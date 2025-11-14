@echo off
REM Run the Spring Boot app using the 'dev' profile (H2 in-memory DB)
cd /d %~dp0
mvn -Dspring-boot.run.profiles=dev spring-boot:run
pause
