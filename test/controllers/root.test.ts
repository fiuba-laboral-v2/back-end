import request from "supertest";
import app from "../../src/app";
import {OK, CREATED} from "http-status-codes";
import model from "../../src/models";

describe("Root path", () => {
  const dummyTest = { title: "test" } as any;

  beforeEach(() => {
    return model.db.Roots.destroy({ truncate: true })
      .then(() => {
        model.db.Roots.create(dummyTest)
          .then((record: any) => {
            dummyTest.id = record.id;
        });
      });
  });

  afterAll(() => {
    return model.close();
  });

  describe("GET", () => {
    test("It should give an OK status", async () => {
      const response = await request(app).get("/");
      expect(response.status).toEqual(OK);
      expect(response.body.data.length).toEqual(1);
    });

    test("It should give an OK status and return by id", async () => {
      const response = await request(app).get(`/${dummyTest.id}`);
      expect(response.status).toEqual(OK);
      expect(response.body.data.title).toEqual(dummyTest.title);
    });
  });

  describe("POST", () => {
    test("It should give an CREATED status", async () => {
      const response = await request(app).post("/").send({ title: "test" });
      expect(response.status).toEqual(CREATED);
      expect(response.body.data.title).toEqual(dummyTest.title);
    });
  });
});
