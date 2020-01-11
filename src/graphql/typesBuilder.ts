import path from "path";
import glob from "glob";

const typeDefsPath = path.join(__dirname, "./**/types.js");

const RootTypes = `
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
  # type Subscription
`;

const getTypeDefs = (globPath: string) => {
  const files = glob.sync(globPath);
  return files.reduce((acc: any[], file: string) => [...acc, ...require(file)], [RootTypes]);
};

const typeDefs = getTypeDefs(typeDefsPath);

export default typeDefs;
