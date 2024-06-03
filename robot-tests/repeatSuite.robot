*** Settings ***
Library         OperatingSystem
Library         Process
Library         String

*** Variables ***
@{TESTS}   tests/login.spec.ts   tests/companies.spec.ts

*** Test Cases ***
Run Playwright Tests
   # Infinite loop to ensure things keep running
   FOR   ${i}   IN RANGE   1  2
      # Do the tests
      FOR   ${test}   IN   @{TESTS}
         ${filename}=   Replace String Using Regexp   ${test}   ^tests/   ""
         ${command}=   Catenate      SEPARATOR=\s   npx playwright test ${test} --reporter=html
         # This _should_ work to prevent playwright commands from hanging
         ${pid}=   Start Process   ${command}   shell=True
         Wait For Process   ${pid}   timeout=3m
         Log To Console   ${test} has finished
      END
      Log To Console   See you again in a day!
      # Wait a day
      Sleep  24 hours
   END