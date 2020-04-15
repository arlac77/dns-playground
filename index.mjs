import fs from "fs";
import dnsz from "dnsz";
import {
  loaded,
  Diff,
  SymbolInternals,
  BasicBackend,
  RustWasmBackend
} from "SymatemJS";
import { createOntology, hasVMMData } from "./src/util.mjs";

const defaultEncoding = { encoding: "utf8" };

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
      await fs.promises.readFile(dumpFileName, defaultEncoding)
    );
  } catch (e) {}

  const writer = new Diff(
    backend,
    { [recordingNamespace]: modalNamespace },
    repositoryNamespace
  );

  const ontology = createOntology(backend, writer, recordingNamespace);

  const data = dnsz.parse(
    await fs.promises.readFile("tests/fixtures/private.zone", {
      encoding: "utf8"
    })
  );

  readZone(data.records, backend, writer, ontology);

  writer.compressData();
  writer.commit();

  await fs.promises.writeFile(
    dumpFileName,
    backend.encodeJson([recordingNamespace]),
    defaultEncoding
  );
}

function readZone(records, backend, writer, o, ns) {
  const z = writer.createSymbol(ns);
  writer.setTriple([z, o.isa, o.zone], true);
  records
    .filter(record => record.type === "A" && record.name !== "@")
    .forEach(record => {
      if (hasVMMData(backend, o.isa, o.name, record.name)) {
        //console.log("skip", record.name);
        return;
      }

      //console.log(record.name);

      const r = writer.createSymbol(ns);

      const a = writer.createSymbol(ns);
      writer.setData(a, record.content);

      const n = writer.createSymbol(ns);
      writer.setData(n, record.name);

      const t = writer.createSymbol(ns);
      writer.setData(t, record.ttl);

      writer.setTriple([z, o.has, r], true);
      writer.setTriple([r, o.isa, o.record], true);
      writer.setTriple([r, o.has, t], true);
      writer.setTriple([r, o.has, n], true);
      writer.setTriple([r, o.has, a], true);
      writer.setTriple([n, o.isa, o.name], true);
      writer.setTriple([a, o.isa, o.ipv4], true);
      writer.setTriple([a, o.has, n], true);
    });
}

doit(process.argv[2]);
