import path from "path";
import glob from "glob";

const resolverPath = path.join(__dirname, "./**/resolvers.js");

const getResolvers = (globPath: string) => {
  const files = glob.sync(globPath);
  return files.reduce((acc: any[], file: string) => [...acc, require(file)], []);
};

const resolvers = getResolvers(resolverPath);

export default resolvers;
