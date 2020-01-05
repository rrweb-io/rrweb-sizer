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

export const e1 = getFile(path.resolve(__dirname, "./e1.json"));
export const e2 = getFile(path.resolve(__dirname, "./e2.json"));
