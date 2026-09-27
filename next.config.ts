import type {NextConfig} from 'next';
const config:NextConfig={
  allowedDevOrigins:['terminal.local'],
  webpack(config,{dev}){if(dev)config.devtool='source-map';return config;},
};
export default config;
