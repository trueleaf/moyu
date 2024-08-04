
import { createReadStream } from 'fs'
import { resolve } from 'node:path'

export const readResponseLog = () => {
  const readStream = createReadStream(resolve(__dirname, './response.json'), {
    encoding: 'utf-8',
  });

  readStream.on('data', chunk => {
    console.log(`Received chunk of size ${chunk.length}`);
  });
  
  readStream.on('error', err => {
    console.error(`Error reading file: ${err}`);
  });
  
  readStream.on('end', () => {
    console.log('File read completely');
  });
}