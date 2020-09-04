let BASE_PATH = "http://ec2-13-229-120-202.ap-southeast-1.compute.amazonaws.com:5005/v1.0/"
let IMAGE_PATH = "http://ec2-13-229-120-202.ap-southeast-1.compute.amazonaws.com:5005/"
export const environment = {
  // production: false,
  production: true,
  api_url: `${BASE_PATH}`,
  image_url:`${IMAGE_PATH}`
};
