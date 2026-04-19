import swaggerDocs from "./lib/swagger.js";
import { createServer, V1 } from "./server.js"
import { errorHandler } from "./middlewares/errorhandler.middleware.js"
import { StatusCodes } from "http-status-codes"

const port = process.env.PORT || "3002"
const server = createServer()

// __ Swagger Docs ______________________________________________________
swaggerDocs(server, port)

// __ 404 Handler _____________________________________________________
server.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND)
    .json({ success: false, error: { message: "Route not found" } })
})

// __ Central Error Handler _____________________________________________
server.use(errorHandler)

server.listen(port, () => {
  console.log(`🚀  Server  →  http://localhost:${port}${V1}`);
  console.log(`🔑  Auth    →  http://localhost:${port}${V1}/auth`);
  console.log(`❤️   Health  →  http://localhost:${port}${V1}/health`);
  console.log(`📚 Docs    →  http://localhost:${port}/docs`);
})

export default server