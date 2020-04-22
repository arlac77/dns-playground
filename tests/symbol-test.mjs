import test from "ava";
import { prepareBackend } from "./helpers/util.mjs";

import { registerDataSymbol } from "../src/util.mjs";

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
