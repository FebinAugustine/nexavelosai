@echo off
echo Testing API endpoints...
echo.

echo 1. Testing get teams:
curl -X GET "http://localhost:5000/api/teams" -H "Authorization: Bearer %1"

echo.
echo.

echo 2. Testing get team details:
curl -X GET "http://localhost:5000/api/teams/6985990327c25f6c254bf9ac" -H "Authorization: Bearer %1"

echo.
echo.

echo 3. Testing get team members:
curl -X GET "http://localhost:5000/api/teams/6985990327c25f6c254bf9ac/members" -H "Authorization: Bearer %1"
