import { createServer } from 'http';
import url from 'url';

const hostname = '127.0.0.1';


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
const requestListener = function (req, res) {
    const reqUrl = url.parse(req.url, true);
    console.log(reqUrl);

    switch (reqUrl.pathname) {
        case '/heartbeat':
            res.setHeader("Content-Type", "application/json");    
            res.writeHead(200);
            const servertime = Date.now()
            res.end(`{"message": "server up & running @ ${servertime}"}`); 
        case '/pn':
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(`{"message": "This would be the keys to the castle"}`);
    }
};

const server = createServer(requestListener);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

