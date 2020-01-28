import { Root } from "../../../src/models/Root";
import * as Database from "../../../src/config/Database";

beforeAll(async () => {
  await Database.default.setConnection();
});

beforeEach(async () => {
  await Root.destroy({ truncate: true });
});

afterAll(async () => {
  await Database.default.close();
});

test("create a valid root", async () => {
  const root: Root = new Root({ title: "some title" });
  expect(root).not.toBeNull();
  expect(root).not.toBeUndefined();
  expect(root.title).toEqual("some title");
});

test("raise an error if title is null", async () => {
  const root: Root = new Root({ title: null });
  await expect(root.save()).rejects.toThrow();
});
