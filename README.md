# Insurance Claims Exercise - Josh Higginbottom


## Getting Started

This is a Node application and it is recommended that a minimum of Node version 18 be used to run the application successfully. From there, use the following commands with the project:

### Install:
npm i

### Build
npm run build

### Run on development server
npm run startDev

### Run all test cases
npm test



## Using & Testing the Application:
Aside from the exhaustive unit test suite, the logic can be run and tested by running the development server via the command above,
and by using an API platform such as Postman, or any other dev tool that enables interaction with REST APIs.

When the server is started, it will listen on port 8000. Sending a POST request to 'localhost:8000/evaluateClaim' with the JSON payload below will trigger the evaluation logic. It will send a response indicating whether the request was approved, the payout if applicable, and the reason the request was approved or denied.


### Request JSON Format:
Below is an example claim / policy request to be evaluated. All fields in the below JSON structure are required in each request.

{
	"claim": {
        "policyId": "POL123",
        "incidentType": "accident",
        "incidentDate": "2023-06-01",
        "amountClaimed": 5000
    },
    "policy": {
        "policyId": "POL123",
        "startDate": "2023-02-05",
        "endDate": "2024-02-05",
        "deductible": 500,
        "coverageLimit": 10000,
        "coveredIncidents": ["accident", "theft"]
    }
}

- All dates must be in YYYY-MM-DD format
- Valid incident types are "accident", "theft", "fire", and "water damage". Case sensitive. (See claim/incidentType and policy/coveredIncidents)
- Amounts must be numbers - not strings - and must be positive (or will trigger a failure)

### Response JSON format
Responses will be given in a format similar to the example below:

{
    "approved": true,
    "payout": 4500,
    "reasonCode": "approved"
}

Current active reason codes are "approved", "policy_inactive", "not_covered", "zero_payout", "invalid_parameters", and "unknown error" in the case of a catastophic failure


## Reflections on the Project:
As this is intended to be insurance system logic, I decided to heavily test edge cases that could break the system
and result in an erroneous payout or an unintentionally large payout. False positives are much more dangerous than false negatives in this scenario.

I also tested assuming data may be corrupt, which adds an extra layer of safety.

I decided to include the start date of a policy in the valid "active" range, but did not include the end date in that range - assuming the policy expired at midnight the night before.

I did not attempt to take hours/minutes/seconds into account for policy "active" time, makind sure to zero out everything more granular than the date. This also means no region / time zone processing is taken into account.

Both of the above policy "active range" decisions I would clarify with a product owner in a real project.



I also decided that for the purposes of this exercise, which focused on logic, that I would take both policy and claim as inputs. In a real situation, I would advocate for at least the policy - if not both claim and policy - to be in a database which my web service queried to get the information it needs.

This would of course then require authentication setup and mocking of the other services in my tests, which is beyond scope for this exercise.

Finally, I would dockerize this service and run it on AWS or AzureDevops if given the time to do so.



I will note that the input validation in this project leaves a lot to be desired, and if given more time I would spend some effort doing case correction, character cleanup, etc. I would also spend a lot more time configuring the project's build systems and add lint rules and other working conventions.
