// axiosSling.js
import axios from 'axios';

const CLIENT_KEY_SECRET = `${process.env.NEXT_PUBLIC_CLIENT_KEY_SECRET}`;
const CLIENT_ID = `${process.env.NEXT_PUBLIC_CLIENT_ID}`;

const axiosSling = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    license: CLIENT_KEY_SECRET,
    client: CLIENT_ID,
  },
});

export default axiosSling;
