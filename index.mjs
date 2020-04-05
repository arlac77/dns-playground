import fs from "fs";
import { join } from "path";
import dnsz from "dnsz";
import {
  loaded,
  Diff,
  SymbolInternals,
  BasicBackend,
  RustWasmBackend,
} from "SymatemJS";

async function doit() {
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

  const { has, isa, ipv4, name } = createOntology(writer, recordingNamespace);

  const data = dnsz.parse(
    await fs.promises.readFile("tests/fixtures/private.zone", {
      encoding: "utf8",
    })
  );

  readZone(data.records, writer, has, isa, ipv4, name, recordingNamespace);

  writer.compressData();
  writer.commit();

  const fileContent = writer.encodeJson();
  console.log(fileContent);
  // await fs.promises.writeFile(join("/tmp", "001.json"), fileContent, { encoding: 'utf8' });
}

function readZone(records, writer, has, isa, ipv4, name, ns) {
  records
    .filter((record) => record.type === "A")
    .forEach((record) => {
      const a = writer.createSymbol(ns);
      writer.setData(a, record.content);

      const n = writer.createSymbol(ns);
      writer.setData(n, record.name);

      writer.setTriple([n, isa, name], true);
      writer.setTriple([a, isa, ipv4], true);
      writer.setTriple([a, has, n], true);
    });
}

function createOntology(writer, recordingNamespace) {
  const o = Object.fromEntries(
    ["has", "isa", "ipv4", "name", "root", "zone", "ontology"].map((name) => {
      const symbol = writer.createSymbol(recordingNamespace);
      writer.setData(symbol, name);
      return [name, symbol];
    })
  );

  const {root, isa, has, ontology} = o;
  writer.setTriple([root, isa, ontology], true);


  for(const item of Object.values(ontology)) {
    if(item === ontology) continue;
    writer.setTriple([ontology, has, item], true);
  }

  return o;
}

doit();

/*
 '1.1.1.1' isa ipv4
 'ordoid1' isa name
 '1.1.1.1' has 'odroid1'
*/
