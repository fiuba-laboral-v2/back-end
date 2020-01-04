export default class Environment {
  public static PRODUCTION: string = "production";
  public static STAGING: string = "staging";
  public static DEVELOPMENT: string = "development";
  public static TEST_TRAVIS: string = "test_travis";
  public static TEST: string = "test";
  public static NODE_ENV: string = process.env.NODE_ENV || Environment.DEVELOPMENT;
  public static DATABASE_URL: string =  process.env.DATABASE_URL || "";
}
