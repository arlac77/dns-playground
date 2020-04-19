import test from "ava";
import {
  loaded,
  Diff,
  SymbolInternals,
  BasicBackend,
  RustWasmBackend
} from "SymatemJS";

import { registerDataSymbol } from "../src/util.mjs";

async function prepareBackend() {
  await loaded;

  const backend = new RustWasmBackend();

  backend.initPredefinedSymbols();

  const repositoryNamespace = SymbolInternals.identityOfSymbol(
    backend.createSymbol(BasicBackend.metaNamespaceIdentity)
  );
  const modalNamespace = SymbolInternals.identityOfSymbol(
    backend.createSymbol(BasicBackend.metaNamespaceIdentity)
  );
  const recordingNamespace = SymbolInternals.identityOfSymbol(
    backend.createSymbol(BasicBackend.metaNamespaceIdentity)
  );
  const writer = new Diff(
    backend,
    { [recordingNamespace]: modalNamespace },
    repositoryNamespace
  );

  return { writer, backend, recordingNamespace };
}

test("s1", async t => {
  const { backend, writer, recordingNamespace } = await prepareBackend();

  writer.registerSymbolsInNamespace(recordingNamespace, ["isa", "something"]);

  const s = registerDataSymbol(
    backend,
    writer,
    recordingNamespace,
    writer.symbolByName.isa,
    writer.symbolByName.something,
    "the data",
    s => {}
  );

  t.truthy(s);
});
