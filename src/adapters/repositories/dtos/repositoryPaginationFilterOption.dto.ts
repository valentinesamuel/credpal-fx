import { IOrder } from "@shared/repositoryHelpers/interface/query.interface";
import { FindOptionsWhere, FindOptionsSelect } from "typeorm";

export interface IRepositoryPaginationFilterOptionsType<T> {
  page?: number;
  limit?: number;
  filterAnd?: FindOptionsWhere<T>;
  filterOr?: FindOptionsWhere<T>;
  order?: IOrder<T>;
  sortByName?: "asc" | "desc" | "ASC" | "DESC";
  sortByActivity?: "asc" | "desc" | "ASC" | "DESC";
  select?: (keyof T)[] | FindOptionsSelect<T>;
  withDeleted?: boolean;
  searchTerm?: string;
  expand?: boolean;
  applicationType?: string;
  userType?: string;
  role?: string;
  startDate?: Date;
  endDate?: Date;
  dateFilter?: Date | string;
  active?: boolean;
}
