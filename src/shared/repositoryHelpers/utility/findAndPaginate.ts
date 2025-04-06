import {
  FindOptionsRelationByString,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from "typeorm";
import { IPaged } from "../interface/paged.interface";
import { IQuery } from "../interface/query.interface";

export interface IPaginationFilterParam<T> {
  repository: Repository<T>;
  query: IQuery;
  qWhere?: FindOptionsWhere<T>;
  relations?: FindOptionsRelations<T> | FindOptionsRelationByString;
  select?: (keyof T)[] | FindOptionsSelect<T>;
  options?: { withDeleted?: boolean };
}

export function combineAndWithOr(
  filterAnd: any,
  filterOr: any,
): FindOptionsWhere<any>[] | FindOptionsWhere<any> {
  filterAnd = filterAnd ?? {};
  filterOr = filterOr ?? {};
  // Remove empty values from filterAnd
  const cleanedFilterAnd = Object.fromEntries(
    Object.entries(filterAnd).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
  console.log("cleanedFilterAnd:", cleanedFilterAnd);

  const where = { ...cleanedFilterAnd };
  const combined: FindOptionsWhere<any>[] = [];
  if (filterOr && Object.keys(filterOr).length > 0) {
    Object.keys(filterOr).forEach((key) => {
      combined.push({ ...where, [key]: filterOr[key] });
    });
  }
  console.log("Combined Where Clause:", combined.length > 0 ? combined : where);
  return combined.length > 0 ? combined : where;
}

function formatQuery(filter: any) {
  const obj = {};
  if (filter && isArray(filter)) {
    return filter;
  }
  if (filter && isObject(filter)) {
    Object.keys(filter).forEach((key) => {
      if (isArray(filter[key]) && isArrayOfStringOrNumber(filter[key])) {
        obj[key] = In(filter[key]);
      } else if (isObject(filter[key])) {
        obj[key] = filter[key];
        // } else if (typeof filter[key] === 'string') { // removed cus of enums search
        //   obj[key] = ILike(`%${filter[key]}%`);
      } else {
        obj[key] = filter[key];
      }
    });
  }
  return obj;
}

function isArrayOfStringOrNumber(value: any): boolean {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" || typeof item === "number")
  );
}

function isArray(value: any): boolean {
  return Array.isArray(value);
}

function isObject(value: any): boolean {
  return typeof value === "object" && !Array.isArray(value);
}

/**
 * Converts query parameters to a more structured object.
 * @param query - The query parameters as an unstructured object.
 * @returns A structured object with typed values.
 */
export function convertQueryParamsToObject(query: any): any {
  const obj: any = {};
  Object.keys(query).forEach((key) => {
    if (query[key] === "true") {
      obj[key] = true;
    } else if (query[key] === "false") {
      obj[key] = false;
    } else if (query[key] === "null") {
      obj[key] = null;
    } else if (/^[0-9\.]+$/.test(query[key])) {
      obj[key] = Number(query[key]);
    } else if (
      (typeof query[key] == "string" &&
        query[key] &&
        query[key].trim().charAt(0) === "{" &&
        query[key].trim().charAt(query[key].trim().length - 1) === "}") ||
      (typeof query[key] == "string" &&
        query[key] &&
        query[key].trim().charAt(0) === "[" &&
        query[key].trim().charAt(query[key].trim().length - 1) === "]")
    ) {
      if (query[key].trim().charAt(1) === '"') {
        obj[key] = JSON.parse(query[key]);
      } else if (query[key].trim().charAt(1) !== '"') {
        obj[key] = query[key]
          .trim()
          .replace(/[\[\]']+/g, "")
          .split(",")
          .map((e) => e.trim());
      }
    } else if (typeof query[key] == "object") {
      obj[key] = query[key];
    } else {
      obj[key] = query[key];
    }
  });
  return obj;
}

export function sanitizeOrder(order: any): any {
  if (typeof order === "object" && !Array.isArray(order)) {
    // Recursively sanitize each key in the order object
    return Object.fromEntries(
      Object.entries(order)
        .map(([key, value]) => {
          if (typeof value === "string" && value.trim() === "") {
            return [key, undefined]; // Remove empty strings
          }
          if (typeof value === "object" && Object.keys(value).length === 0) {
            return [key, undefined]; // Remove empty objects
          }
          if (typeof value === "object") {
            return [key, sanitizeOrder(value)]; // Recursively clean nested objects
          }
          return [key, value]; // Leave other values intact
        })
        .filter(([, value]) => value !== undefined), // Remove undefined entries
    );
  }
  return order; // Return as-is if not an object
}

/**
 * Paginates and filters repository results based on query parameters.
 * @param repository - The repository to query.
 * @param query - The query parameters including pagination and filters.
 * @param qWhere - Additional query conditions.
 * @param relations - Additional relations to include.
 * @param select - fields to select.
 * @param options - sort and order option.
 * @returns A promise that resolves to a paginated result object.
 *
 * // To use a AND filter
 * @example
 * ?filter[businessId]=75352a3e-74f2-4e7f-ac90-db419004bc16 => (where businessId = '75352a3e-74f2-4e7f-ac90-db419004bc16')
 *
 * // To use a OR filter
 * @example
 * ?filterOr[name]=john&filterOr[name]=sarah => (where name = 'john' or name = 'sarah')
 *
 * // To use a OR filter with AND filter
 * @example
 * ?filter[businessId]=75352a3e-74f2-4e7f-ac90-db419004bc16&filterOr[name]=john&filterOr[description]=john => (where businessId = '75352a3e-74f2-4e7f-ac90-db419004bc16' and (name = 'john' or description = 'john')
 *
 * // To use a OR filter with IN filter
 * @example
 * ?filterAnd[name] = [john, sarah] => where name in ('%john%', '%sarah%')
 * ?filterOr[name] = [john, sarah] => where name in ('%john%', '%sarah%')
 */
export async function findAndPaginate<T>(
  filterParams: IPaginationFilterParam<T>,
): Promise<IPaged<T[]>> {
  const { repository, query, qWhere, relations, select, options } =
    filterParams;
  console.log("query", query);
  query.page = Number(query.page) > 1 ? Number(query.page) - 1 : 0;
  const take = Number(query.limit) || 10;
  const skip = query.page * take || 0;
  // const whereAnd = { ...qWhere, ...formatQuery(query.filterAnd) };
  const whereAnd = {
    ...qWhere,
    ...Object.fromEntries(
      Object.entries(formatQuery(query.filterAnd)).filter(
        ([, value]) => value !== undefined && value !== null && value !== "",
      ),
    ),
  };

  const whereOr = formatQuery(query.filterOr);

  let order = { createdAt: "DESC" } as any;

  if (query.order && typeof query.order === "object") {
    order = sanitizeOrder(query.order);
  }

  const where = combineAndWithOr(whereAnd, whereOr);

  if (
    query.search &&
    typeof query.search === "object" &&
    Object.keys(query.search).length > 0
  ) {
    Object.keys(query.search).forEach((key) => {
      if (typeof query.search[key] === "object") {
        where[key] = {};
        for (const nestedKey of Object.keys(query.search[key])) {
          const searchValue = query.search[key][nestedKey];
          // Replace spaces with `+` for cases where `+` is intended
          const sanitizedValue = searchValue?.replace(/\s/g, "+");
          where[key][nestedKey] = ILike(`%${sanitizedValue}%`);
        }
      } else {
        const searchValue = query.search[key];
        const sanitizedValue = searchValue?.replace(/\s/g, "+");
        where[key] = ILike(`%${sanitizedValue}%`);
      }
    });
  }

  console.log("Final Query", {
    where,
    order,
    take: take,
    skip: skip,
    relations,
    select,
    withDeleted: options?.withDeleted,
  });

  console.log(
    JSON.stringify({
      where,
      order,
      take: take,
      skip: skip,
      relations,
      select,
      withDeleted: options?.withDeleted,
    }),
  );

  const [result, total] = await repository.findAndCount({
    where,
    order,
    take: take,
    skip: skip,
    relations,
    select,
    withDeleted: options?.withDeleted,
  });

  const mainPage = query.page + 1;
  const numberOfPages = Math.ceil(total / take);
  const nextPage = mainPage + 1;

  return {
    data: result,
    meta: {
      page: mainPage,
      limit: take,
      totalRecords: total,
      previousPage: mainPage > 1 ? mainPage - 1 : false,
      nextPage: numberOfPages >= nextPage ? nextPage : false,
      pageCount: numberOfPages,
    },
  };
}
