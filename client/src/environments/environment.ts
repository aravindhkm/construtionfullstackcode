// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// http://f9e63ef76e4e.ngrok.io

//Local Path Link
// let BASE_PATH = "http://192.168.1.20:5005/v1.0/"
// let IMAGE_PATH = "http://192.168.1.20:5005/"

// let BASE_PATH= "http://64fc9f75cc85.ngrok.io/v1.0/"
// let IMAGE_PATH= "http://64fc9f75cc85.ngrok.io/"

// //Amazon Server Link
let BASE_PATH = "http://ec2-13-229-120-202.ap-southeast-1.compute.amazonaws.com:5005/v1.0/"
let IMAGE_PATH = "http://ec2-13-229-120-202.ap-southeast-1.compute.amazonaws.com:5005/"

//Swagger Link
// let BASE_PATH = "http://8ead8ae31bdd.ngrok.io/v1.0/"
// let IMAGE_PATH = "http://8ead8ae31bdd.ngrok.io/"

export const environment = {
  // production: false,
  production: true,
  api_url: `${BASE_PATH}`,
  image_url:`${IMAGE_PATH}`
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
