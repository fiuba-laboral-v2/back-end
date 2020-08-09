import { PaginationConfig } from "$config/PaginationConfig";

export const mockItemsPerPage = (itemsPerPage: number) =>
  jest.spyOn(PaginationConfig, "itemsPerPage").mockImplementation(() => itemsPerPage);
