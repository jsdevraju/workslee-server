import NodeGeocoder from "node-geocoder";
import { config } from 'dotenv';

config()

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: process.env.GEOCODER_HTTP_ADAPTER,
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

export default geocoder;
