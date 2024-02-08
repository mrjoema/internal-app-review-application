# Internal App Review Application

This is the internal app review application that distributes the apps into reviewers across different categories as many as possible

## Description

An in-depth paragraph about your project and overview of use.

## Getting Started

### Dependencies

* NodeJS

### Installing

1. Run `npm install`
2. Complile the project by running `npx tsc`

### Executing program
```
// Step 1: Simulate the ETL jobs for apps assignment
npm run refresh

// Step 2: Run the webserver
npm start

// Step 3: Look up what apps are asssigned into the reviewer
ping http://localhost:3000/review_apps/${reviewer_id}

// Step 4: Look up the app assignment by pinging the reporting endpoint (For debugging purpose)
ping http://localhost:3000/reporting

// Step 5: (Bonus point) decline apps review
Run curl command to decide what app you want to decline to review
curl -X POST http://localhost:3000/decline/:reviewer_id/:app_uuid

// Step 6: Simulate the ETL jobs for refresh apps assignment
// The outcome should be different due to someone sending the request to decline to review
npm run refresh
```

