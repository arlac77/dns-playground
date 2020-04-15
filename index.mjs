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

async function doit(dumpFileName, zoneFile = "tests/fixtures/private.zone") {
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
    await fs.promises.readFile(zoneFile, {
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

function dottedString2Number(x) {
  return x.split('.').reduce((a,c) => a * 256 + parseInt(c,10),0);
}

function createDataSymbol(backend,writer,ns,attribute,value,data)
{
  let s = hasVMMData(backend, attribute, value, data);

  if(!s) {
    s = writer.createSymbol(ns);
    writer.setData(s, data);
    writer.setTriple([s, attribute, value], true);
  }

  return s;
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

      /*
      const a = writer.createSymbol(ns);
      writer.setData(a, dottedString2Number(record.content));
      writer.setTriple([a, o.isa, o.ipv4], true);
      const n = writer.createSymbol(ns);
      writer.setData(n, record.name);
      writer.setTriple([n, o.isa, o.name], true);
      const t = writer.createSymbol(ns);
      writer.setData(t, record.ttl);
      */

      const a = createDataSymbol(backend, writer, ns, o.isa, o.ipv4, dottedString2Number(record.content));
      const n = createDataSymbol(backend, writer, ns, o.isa, o.name, record.name);
      const t = createDataSymbol(backend, writer, ns, o.isa, o.ttl, parseInt(record.ttl,10));

      writer.setTriple([z, o.has, r], true);
      writer.setTriple([r, o.isa, o.record], true);
      writer.setTriple([r, o.has, t], true);
      writer.setTriple([r, o.has, n], true);
      writer.setTriple([r, o.has, a], true);
      writer.setTriple([a, o.has, n], true);
    });
}

doit(process.argv[2], process.argv[3]);
