import {
  Category, CategoryServiceFactory, CategoryConfiguration, LogLevel
} from "typescript-logging";

CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info));

export const Logger = new Category("service");
