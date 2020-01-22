import { Root, RootsRepository } from "../../../src/models/Root";
import Database from "../../../src/config/Database";

beforeAll(async () => {
  await Database.setConnection();
});

beforeEach(async () => {
  await RootsRepository.truncate();
});

afterAll(async () => {
  await Database.close();
});

test("create a new root", async () => {
  const root: Root = new Root({ title: "some title" });
  const roots = await RootsRepository.save(root);
  expect(roots.title).toEqual(root.title);
  expect(roots.id).toEqual(root.id);
});

test("raise an error if title is null", async () => {
  const root: Root = new Root({ title: null });
  await expect(RootsRepository.save(root)).rejects.toThrow();
});

test("find no roots if save was not invoked", async () => {
  const roots = await RootsRepository.findAll();
  expect(roots.length).toEqual(0);
});

test("find one root if save was invoked once", async () => {
  await RootsRepository.save(new Root({ title: "first root" }));
  const roots = await RootsRepository.findAll();
  expect(roots.length).toEqual(1);
});

test("retrieve a root by id", async () => {
  const expected: Root = await RootsRepository.save(new Root({ title: "root by id" }));
  const actual = await RootsRepository.findById(expected.id);
  expect(actual).not.toBeNull();
  expect(actual!.id).toEqual(expected.id);
});
