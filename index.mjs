import fs from "fs";
import { join } from "path";
import dnsz from "dnsz";
import {
  loaded,
  Diff,
  SymbolInternals,
  BasicBackend,
  RustWasmBackend
} from "SymatemJS";

async function doit(dumpFileName) {
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

  backend.decodeJson(
    await fs.promises.readFile(dumpFileName, { encoding: "utf8" })
  );

  const writer = new Diff(
    backend,
    { [recordingNamespace]: modalNamespace },
    repositoryNamespace
  );

  const { has, isa, ipv4, name } = createOntology(writer, recordingNamespace);

  const data = dnsz.parse(
    await fs.promises.readFile("tests/fixtures/private.zone", {
      encoding: "utf8"
    })
  );

  readZone(data.records, writer, has, isa, ipv4, name, recordingNamespace);

  writer.compressData();
  writer.commit();

  await fs.promises.writeFile(
    dumpFileName,
    backend.encodeJson([recordingNamespace]),
    { encoding: "utf8" }
  );
}

function readZone(records, writer, has, isa, ipv4, name, ns) {
  records
    .filter(record => record.type === "A")
    .forEach(record => {
      const a = writer.createSymbol(ns);
      writer.setData(a, record.content);

      const n = writer.createSymbol(ns);
      writer.setData(n, record.name);

      writer.setTriple([n, isa, name], true);
      writer.setTriple([a, isa, ipv4], true);
      writer.setTriple([a, has, n], true);
    });
}

/**
 * Links symbol to a triple
 * @param {Symbol} symbol
 * @param {Symbol[]} triple
 * @param {Object} ontology
 * @param writer
 */
function setMetaTriple(symbol, triple, ontology, writer) {
  writer.setTriple([symbol, ontology.entity, triple[0]], true);
  writer.setTriple([symbol, ontology.attribute, triple[1]], true);
  writer.setTriple([symbol, ontology.value, triple[2]], true);
}

function createOntology(writer, recordingNamespace) {
  const symbolNames = [
    "entity",
    "attribute",
    "value",
    "name",
    "has",
    "isa",
    "ipv4",
    "root",
    "zone",
    "ontology"
  ];

  writer.registerSymbolsInNamespace(recordingNamespace, symbolNames);

  const o = Object.fromEntries(
    symbolNames.map(name => {
      const symbol = writer.createSymbol(recordingNamespace);
      writer.setData(symbol, name);
      return [name, symbol];
    })
  );

  const { root, isa, has, ontology } = o;
  writer.setTriple([root, isa, ontology], true);

  for (const item of Object.values(ontology)) {
    if (item === ontology) continue;
    writer.setTriple([ontology, has, item], true);
  }

  //setMetaTriple(ontology, [], o, writer);

  return o;
}

doit(process.argv[2]);

/*
 ontology:
    isa   - subject isa category?
    has   - subject has attribute

    ontology
    name
    ipv4
    zone

 '1.1.1.1' isa ipv4
 'ordoid1' isa name
 '1.1.1.1' has 'odroid1'
*/
