import * as fs from "fs";
import * as path from "path";

type File = {
  path: string;
  content: string;
  size: number;
};

function getFile(p: string): File {
  return {
    path: p,
    content: fs.readFileSync(p, "utf8"),
    size: fs.statSync(p).size
  };
}

export const realWorld = getFile(path.resolve(__dirname, "./real-world.json"));
