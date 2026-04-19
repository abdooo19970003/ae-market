import { createServer } from "./server.js"
const port = process.env.PORT || 3002
const server = createServer()
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default server