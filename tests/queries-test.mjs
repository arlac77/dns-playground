import test from "ava";
import { prepareBackend } from "./helpers/util.mjs";

import { traverse, tripleQueries, DeclareVariable } from "../src/util.mjs";

test.only("tripleQueries", async t => {
  const { writer, recordingNamespace } = await prepareBackend();

  const a1 = writer.createSymbol(recordingNamespace);
  const a2 = writer.createSymbol(recordingNamespace);
  const s1 = writer.createSymbol(recordingNamespace);
  const s2 = writer.createSymbol(recordingNamespace);
  const s3 = writer.createSymbol(recordingNamespace);

  writer.setTriple([s1, a1, s2], true);
  writer.setTriple([s2, a2, s3], true);

  for (const p of tripleQueries(writer, [
    [s1, a1, DeclareVariable("A")],
    [DeclareVariable("A"), a2, DeclareVariable("B")]
  ])) {
    console.log(p);
    t.deepEqual(
      p,
      new Map([
        [DeclareVariable("A"), [s2]],
        [DeclareVariable("B"), [s3]]
      ])
    );
  }
});

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
