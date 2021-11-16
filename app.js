import { createServer } from 'http';
import url from 'url';
import pkg from 'pg';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
//import auth from '../middleware/auth';

dotenv.config();

const {Pool} = pkg;

const hostname = 'localhost';
const config = process.env;

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const getDBResults = async () => {
  try{
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM api_keys ORDER BY validTo DESC');
    return JSON.stringify(result.rows);
  } catch (err) {
    console.error('DB --- ', err);
    return("DB ERROR");
  }
}

const decodeJwt = (token) => {
  console.info('token to be decoded: ', token)
  try {
    const decodedJwt =  jwt.verify(token, config.TOKEN_KEY);
    console.info('decoded token: \n', decodedJwt)
    return decodedJwt
  } catch (e) {
    console.error(e);
  }
}

const dbResults =  await getDBResults();
// const randToken = jwt.sign({
//   "aud": "relay",
//   "iat": 1636982098,
//   "user": "tatoma Relay Technical User"
// }, config.TOKEN_KEY);
// console.log('New token: \n', randToken);

const requestListener = function (req, res) {
    const header = req.headers.authorization || '';
    const token = header.split(' ')[1] || '';  
    const decodedJwt = decodeJwt(token);
    if(!decodedJwt){
      res.writeHead(403);
      res.end(`{"message": "unauthorized, Couldn't verify token"}`); 
      console.warn('Unauthorized access request \n',req)
      return;
    }
    const reqUrl = url.parse(req.url, true);
    const servertime = Date.now()
    switch (reqUrl.pathname) {
      case '/pn':
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(`{"message": "This would be the keys to the castle"}`);
            break;
      case '/heartbeat':
            res.setHeader("Content-Type", "application/json");    
            res.writeHead(200);
            res.end(`{"message": "server up & running @ ${servertime}"}`); 
            break;
      case '/db':
        //double checking. is there a scenario where we wouldnt exit on undefined decoded token?
        if(decodedJwt){
            console.log('------------\n returning results: \n')
            console.log(dbResults)
            res.setHeader("Content-Type", "application/json");    
            res.writeHead(200);
            res.end(`${dbResults}`); 
        } else {
            console.warn('AUTH ERROR ------------\n NOT returning results as token is not verified. \n', req)
            res.setHeader("Content-Type", "application/json");    
            res.writeHead(403);
            res.end(`{"message": "unauthorized, Couldn't verify token"}`); 
          }
            
    }
};

const server = createServer(requestListener);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

