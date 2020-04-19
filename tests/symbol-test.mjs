import test from "ava";
import {
  loaded,
  Diff,
  SymbolInternals,
  RustWasmBackend
} from "SymatemJS";

import { registerDataSymbol } from "../src/util.mjs";

async function prepareBackend() {
  await loaded;

  const backend = new RustWasmBackend();

  backend.initPredefinedSymbols();

  const repositoryNamespace = SymbolInternals.identityOfSymbol(
    backend.createSymbol(backend.metaNamespaceIdentity)
  );
  const modalNamespace = SymbolInternals.identityOfSymbol(
    backend.createSymbol(backend.metaNamespaceIdentity)
  );
  const recordingNamespace = SymbolInternals.identityOfSymbol(
    backend.createSymbol(backend.metaNamespaceIdentity)
  );

  const writer = new Diff(
    backend,
    { [recordingNamespace]: modalNamespace },
    repositoryNamespace
  );

  return { writer, backend, recordingNamespace };
}

test("s1", async t => {
  const { writer, recordingNamespace } = await prepareBackend();

  writer.registerSymbolsInNamespace(recordingNamespace, ["isa", "something"]);

  const s = registerDataSymbol(
    writer,
    recordingNamespace,
    writer.symbolByName.isa,
    writer.symbolByName.something,
    "the data",
    s => {}
  );

  t.truthy(s);
});
