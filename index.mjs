import fs from "fs";
import { join } from "path";
import dnsz from "dnsz";
import { loaded, Diff, SymbolInternals, BasicBackend, RustWasmBackend } from "SymatemJS";

async function doit() {
  await loaded;

  const backend = new RustWasmBackend();

  backend.initPredefinedSymbols();

  const repositoryNamespace = SymbolInternals.identityOfSymbol(backend.createSymbol(BasicBackend.metaNamespaceIdentity));
  const modalNamespace = SymbolInternals.identityOfSymbol(backend.createSymbol(BasicBackend.metaNamespaceIdentity));
  const recordingNamespace = SymbolInternals.identityOfSymbol(backend.createSymbol(BasicBackend.metaNamespaceIdentity));


  const writer = new Diff(
    backend,
    { [recordingNamespace]: modalNamespace },
    repositoryNamespace
  );

  const has = writer.createSymbol(recordingNamespace);
  writer.setData(has, "has");

  const data = dnsz.parse(
    await fs.promises.readFile("tests/fixtures/private.zone", {
      encoding: "utf8"
    })
  );

  readZone(data.records, writer, has, recordingNamespace);

  writer.compressData();
  writer.commit();

  const fileContent = writer.encodeJson();
  console.log(fileContent);
  // await fs.promises.writeFile(join("/tmp", "001.json"), fileContent, { encoding: 'utf8' });
}

function readZone(records, writer, has, ns) {
  records
    .filter(record => record.type === "A")
    .forEach(record => {
      const a = writer.createSymbol(ns);
      writer.setData(a, record.content);

      const name = writer.createSymbol(ns);
      writer.setData(name, record.name);

      writer.setTriple([a, has, name], true);
    });
}

doit();

/*
 
 IPv4
 name
*/
