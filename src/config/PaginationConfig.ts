import { Environment } from "$config/Environment";

const PRODUCTION_ITEMS_PER_PAGE = 50;
const DEVELOPMENT_ITEMS_PER_PAGE = 5;
const TEST_ITEMS_PER_PAGE = 10000;

export const PaginationConfig: IPaginationConfig = {
  production: {
    itemsPerPage: () => PRODUCTION_ITEMS_PER_PAGE
  },
  staging: {
    itemsPerPage: () => DEVELOPMENT_ITEMS_PER_PAGE
  },
  development: {
    itemsPerPage: () => DEVELOPMENT_ITEMS_PER_PAGE
  },
  test: {
    itemsPerPage: () => TEST_ITEMS_PER_PAGE
  }
}[Environment.NODE_ENV];

interface IPaginationConfig {
  itemsPerPage: () => number;
}
