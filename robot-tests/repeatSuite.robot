*** Settings ***
Library           OperatingSystem

*** Variables ***
${npm}  C:\\Users\\skl_o\\AppData\\Roaming\\JetBrains\\Aqua2024.1\\node\\node-v18.15.0-win-x64\\npm
${TESTS}  tests/login.spec.ts; tests/companies.spec.ts

*** Test Cases ***
Run Playwright Tests
    FOR   ${test}   IN   ${TESTS}
    ${command} =  Catenate   SEPARATOR=    ${npm}  run test   ${test}
    Run   ${command}
    END