import { Environment } from "$config/Environment";

const PRODUCTION_ITEMS_PER_PAGE = 50;
const DEVELOPMENT_ITEMS_PER_PAGE = 1;
const TEST_ITEMS_PER_PAGE = 10000;

const PaginationConfigForAllEnvironments = {
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
  },
  test_travis: {
    itemsPerPage: () => TEST_ITEMS_PER_PAGE
  }
};

export const PaginationConfig: IPaginationConfig =
  PaginationConfigForAllEnvironments[Environment.NODE_ENV];

interface IPaginationConfig {
  itemsPerPage: () => number;
}
