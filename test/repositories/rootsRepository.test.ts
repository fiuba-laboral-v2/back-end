import Database from "../../src/config/database";
import { Root, RootsRepository } from "../../src/models/roots";

describe("Root Repository", () => {
  beforeEach(async () => {
    await RootsRepository.truncate();
    return;
  });

  afterAll(() => {
    return Database.close();
  });

  beforeAll(() => {
    return Database.setConnection();
  });

  describe("create", () => {
    test("It should create a new root", async () => {
      const root: Root = new Root({title: "some title"});
      const roots = await RootsRepository.save(root);
      expect(roots.title).toEqual(root.title);
      expect(roots.id).toEqual(root.id);
      return;
    });
    test("It should raise an error", async () => {
      const root: Root = new Root({title: null});
      await expect(RootsRepository.save(root)).rejects.toThrow();
      return;
    });
  });

  describe("retrieves", () => {
    test("It should retrieve no models", async () => {
      const roots = await RootsRepository.findAll();
      expect(roots.length).toEqual(0);
      return;
    });
    test("It should retrieve one root", async () => {
      await RootsRepository.save(new Root({title: "first root"}));
      const roots = await RootsRepository.findAll();
      expect(roots.length).toEqual(1);
      return;
    });
    test("It should retrieve one root by id", async () => {
      const expected: Root = await RootsRepository.save(new Root({title: "root by id"}));
      const actual = await RootsRepository.findById(expected.id);
      expect(actual).not.toBeNull();
      expect(actual!.id).toEqual(expected.id);
      return;
    });
  });
});
