# HolidayLookup

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.21.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Deployment

This app is deployed as a static site to S3 behind CloudFront.

Prereqs:
- AWS CLI installed and authenticated to the correct account.

Build (production by default):

```sh
npm install
npm run build
```

Upload the build output to S3 (origin bucket):

```sh
aws s3 sync dist/holiday-lookup/browser s3://whenischag.nosson.ai/
```

Clear the CloudFront cache:

```sh
aws cloudfront create-invalidation --distribution-id EHAKOMIX5V7GI --paths "/*"
```

Notes:
- Current CloudFront alias: `whenischag.nosson.ai`
- If you later add Angular Router routes, configure CloudFront to rewrite unknown paths to `index.html`.

Optional: local smoke test of the built output:

```sh
npx serve -s dist/holiday-lookup/browser
```

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
