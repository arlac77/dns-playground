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

  try {
    backend.decodeJson(
      await fs.promises.readFile(dumpFileName, { encoding: "utf8" })
    );
  } catch (e) {}

  const writer = new Diff(
    backend,
    { [recordingNamespace]: modalNamespace },
    repositoryNamespace
  );

  const ontology = createOntology(writer, recordingNamespace);

  const data = dnsz.parse(
    await fs.promises.readFile("tests/fixtures/private.zone", {
      encoding: "utf8"
    })
  );

  readZone(
    data.records,
    backend,
    writer,
    ontology
  );

  writer.compressData();
  writer.commit();

  await fs.promises.writeFile(
    dumpFileName,
    backend.encodeJson([recordingNamespace]),
    { encoding: "utf8" }
  );
}

function readZone(records, backend, writer, o, ns) {
  const z = writer.createSymbol(ns);
  writer.setTriple([z, o.isa, o.zone], true);
  //console.log(records);
  records
    .filter(record => record.type === "A" && record.name !== "@")
    .forEach(record => {
      for (const x of backend.queryTriples(backend.constructor.queryMasks.VMM, [
        "",
        o.isa,
        o.name
      ])) {
        console.log(x, backend.getData(x[0]), record.name);

        if(record.name === backend.getData(x[0])) {
          console.log("skip", record.name);
          return;
        }
      }
      console.log(record.name);

      const e = writer.createSymbol(ns);

      const a = writer.createSymbol(ns);
      writer.setData(a, record.content);

      const n = writer.createSymbol(ns);
      writer.setData(n, record.name);

      const t = writer.createSymbol(ns);
      writer.setData(t, record.ttl);

      writer.setTriple([z, o.has, e], true);
      writer.setTriple([e, o.isa, o.entry], true);
      writer.setTriple([e, o.has, t], true);
      writer.setTriple([e, o.has, n], true);
      writer.setTriple([e, o.has, a], true);
      writer.setTriple([n, o.isa, o.name], true);
      writer.setTriple([a, o.isa, o.ipv4], true);
      writer.setTriple([a, o.has, n], true);
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
  writer.setTriple([symbol, ontology.Entity, triple[0]], true);
  writer.setTriple([symbol, ontology.Attribute, triple[1]], true);
  writer.setTriple([symbol, ontology.Value, triple[2]], true);
}

function createOntology(writer, recordingNamespace) {
  const symbolNames = [
    "ontology",
    "name",
    "description",
    "has",
    "isa",
    "ipv4",
    "zone",
    "entry",
    "ttl"
  ];

  writer.registerSymbolsInNamespace(recordingNamespace, symbolNames);

  const o = writer.symbolByName;

  //console.log(o);

  for (const item of Object.values(o)) {
    if (item === o.ontology) continue;
    writer.setTriple([o.ontology, o.has, item], true);
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
    ttl
    zone
    entry

 '1.1.1.1' isa ipv4
 'ordoid1' isa name
 '1.1.1.1' has 'odroid1'
*/
