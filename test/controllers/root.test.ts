import request from "supertest";
import app from "../../src/app";
import {OK} from "http-status-codes";

describe("Root path", () => {
  test("It should give an OK status", async () => {
    const response = await request(app).get("/");
    expect(response.status).toEqual(OK);
  });
});
