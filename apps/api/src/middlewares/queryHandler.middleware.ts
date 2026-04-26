import { NextFunction, Request, Response } from "express"

declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number,
        limit: number,
        offset: number
      },
      sorting?: {
        column: string,
        order: "asc" | "desc"
      },
      search?: string
    }
  }
}

export const parseQueryParams = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  }

  req.sorting = {
    column: (req.query.sort as string) || "created_at",
    order: (req.query.order as "asc" | "desc") || "desc",
  }
  req.search = req.query.q as string || ""
  next()

}