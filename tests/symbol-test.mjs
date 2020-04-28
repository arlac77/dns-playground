import test from "ava";
import { prepareBackend } from "./helpers/util.mjs";

import { registerDataSymbol, traverse } from "../src/util.mjs";

test("registerDataSymbol", async t => {
  const { writer, recordingNamespace } = await prepareBackend();

  writer.registerSymbolsInNamespace(recordingNamespace, ["isa", "something"]);

  const registeredSymbol = registerDataSymbol(
    writer,
    recordingNamespace,
    writer.symbolByName.isa,
    writer.symbolByName.something,
    "the data",
    s => {}
  );

  t.truthy(registeredSymbol);

  let queriedSymbol;

  for (const x of writer.queryTriples(writer.queryMasks.VMM, [
    writer.symbolByName.Void,
    writer.symbolByName.isa,
    writer.symbolByName.something
  ])) {
    queriedSymbol = x[0];
  }

  t.is(registeredSymbol, queriedSymbol);
  t.is(writer.getData(registeredSymbol), "the data");
});

test.only("traverse", async t => {
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
  for (const p of traverse(writer, path[0], attribute)) {
    t.is(p, path[i], `traverse[${i}]`);
  }
});
