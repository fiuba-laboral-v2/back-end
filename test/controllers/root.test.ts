import request from "supertest";
import app from "../../src/app";
import {OK, CREATED} from "http-status-codes";
import Database from "../../src/config/database";
import {RootsRepository} from "../../src/roots/roots_repository";
import Roots from "../../src/roots/roots";

describe("Root path", () => {
  const dummyTest = { title: "test" } as any;
  let root: Roots;

  beforeEach(async () => {
    await RootsRepository.truncate();
    root = new Roots(dummyTest);
  });

  afterAll(() => {
    return Database.close();
  });

  beforeAll(() => {
    Database.setConnection();
  });

  describe("GET", () => {
    test("It should give an OK status", async () => {
      await RootsRepository.save(root);
      const response = await request(app).get("/");
      expect(response.status).toEqual(OK);
      expect(response.body.data.length).toEqual(1);
    });

    test("It should give an OK status and return by id", async () => {
      const record: Roots = await RootsRepository.save(root);
      const response = await request(app).get(`/${record.id}`);
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
