export const HTMLBodyBuilder = {
  build: (bodyText: string) => bodyText.split("\n").join("<br>")
};
