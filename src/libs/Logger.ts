import {
  Category,
  CategoryConfiguration,
  CategoryServiceFactory,
  LogLevel
} from "typescript-logging";

CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info));

export const Logger = new Category("service");
