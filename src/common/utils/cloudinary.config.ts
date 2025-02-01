import { v2 as cloudinary } from 'cloudinary';

import { SECRETS } from '../config/secrets.js';

cloudinary.config({
  cloud_name: SECRETS.cloudinaryCloudName,
  api_key: SECRETS.cloudinaryApiKey,
  api_secret: SECRETS.cloudinaryApiSecret,
});

export default cloudinary;
