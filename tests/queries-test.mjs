import test from "ava";
import { prepareBackend } from "./helpers/util.mjs";

import { traverse } from "../src/util.mjs";

test("traverse", async t => {
  const { writer, recordingNamespace } = await prepareBackend();

  const attribute = writer.createSymbol(recordingNamespace);

  const path = [];

  for (let i = 0; i < 10; i++) {
    path.push(writer.createSymbol(recordingNamespace));

    if (i > 0) {
      writer.setTriple([path[i - 1], attribute, path[i]], true);
    }
  }

  //console.log(path);

  let i = 1;

  for (const p of traverse(writer, [
    path[0],
    attribute,
    writer.symbolByName.Void
  ])) {
    t.is(p, path[i], `traverse[${i}]`);

    i++;
  }

  t.is(i, 10);
});
