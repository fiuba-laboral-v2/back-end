import request from "supertest";
import app from "../../src/app";
import {OK, CREATED, BAD_REQUEST} from "http-status-codes";
import Database from "../../src/config/database";
import {RootsRepository} from "../../src/roots/roots_repository";
import Roots from "../../src/roots/roots";

describe("Root path", () => {
  afterEach(async () => {
    await RootsRepository.truncate();
    return;
  });

  afterAll(async () => {
    return Database.close();
  });

  beforeAll(async () => {
    return Database.setConnection();
  });

  describe("GET", () => {
    test("It should give an OK status", async () => {
      const root: Roots = new Roots({title: "test"});
      await RootsRepository.save(root);
      const response = await request(app).get("/");
      expect(response.status).toEqual(OK);
      expect(response.body.data.length).toEqual(1);
      expect(response.body.data[0].title).toEqual("test");
      return;
    });

    test("It should give an OK status and return by id", async () => {
      const root: Roots = await RootsRepository.save(new Roots({title: "return by id"}));
      const response = await request(app).get(`/${root.id}`);
      expect(response.status).toEqual(OK);
      expect(response.body.data.title).toEqual(root.title);
      return;
    });
  });

  describe("POST", () => {
    test("It should give an CREATED status", async () => {
      const response = await request(app).post("/").send({title: "test"});
      expect(response.status).toEqual(CREATED);
      expect(response.body.data.title).toEqual("test");
      return;
    });
    test("It should give an BAD REQUEST status if title is null", async () => {
      const response = await request(app).post("/").send({title: null});
      expect(response.status).toEqual(BAD_REQUEST);
      return;
    });
  });
});
