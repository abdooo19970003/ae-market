import { createServer } from "./server.js"
import CategoriesRoutes from "./routes/categories.routes.js"
const port = process.env.PORT || 3002
const server = createServer()
server.use("/api/v1/categories", CategoriesRoutes)
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default server