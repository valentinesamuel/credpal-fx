export type IOrder<T = any> = {
  [K in keyof T]?: "asc" | "desc" | "ASC" | "DESC";
};

export interface IQuery {
  limit?: number;
  page?: number;
  filterAnd?: Record<string, any>;
  filterOr?: Record<string, any>;
  search?: Record<string, any>;
  order?: IOrder;
}
