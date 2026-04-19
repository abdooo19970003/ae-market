import { createServer, V1 } from "./server.js"
const port = process.env.PORT || 3002
const server = createServer()
server.listen(port, () => {
  console.log(`🚀  Server  →  http://localhost:${port}${V1}`);
  console.log(`🔑  Auth    →  http://localhost:${port}${V1}/auth`);
  console.log(`❤️   Health  →  http://localhost:${port}${V1}/health`);
})

export default server