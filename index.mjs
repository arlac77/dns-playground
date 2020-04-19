import fs from "fs";
import dnsz from "dnsz";
import {
  loaded,
  Diff,
  SymbolInternals,
  BasicBackend,
  RustWasmBackend
} from "SymatemJS";
import { createOntology, registerDataSymbol, hasVMMData } from "./src/util.mjs";
import { dotted2Number, number2Dotted } from "./src/ip-util.mjs";
import { zoneOntologyDef } from "./src/zone.mjs";

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

  const ontology = createOntology(
    backend,
    writer,
    recordingNamespace,
    zoneOntologyDef
  );

  const data = dnsz.parse(
    await fs.promises.readFile(zoneFile, {
      encoding: "utf8"
    })
  );

  readZone(data.records, backend, writer, ontology, recordingNamespace);

  writer.compressData();
  writer.commit();

  //writeZone(backend, ontology);

  await fs.promises.writeFile(
    dumpFileName,
    backend.encodeJson([recordingNamespace]),
    defaultEncoding
  );
}

function writeZone(backend, ontology) {
  for (const x of backend.queryTriples(backend.constructor.queryMasks.VMM, [
    backend.symbolByName.Void,
    ontology.isa,
    ontology.name
  ])) {
    console.log(backend.getData(x[0]));
  }

  for (const x of backend.queryTriples(backend.constructor.queryMasks.VMM, [
    backend.symbolByName.Void,
    ontology.isa,
    ontology.ipv4
  ])) {
    console.log(number2Dotted(backend.getData(x[0])));
  }
}

function readZone(records, backend, writer, o, ns) {
  const z = writer.createSymbol(ns);
  writer.setTriple([z, o.isa, o.zone], true);
  records
    .filter(record => record.type === "A" && record.name !== "@")
    .forEach(record => {
      
      if (hasVMMData(backend, o.isa, o.name, record.name)) {
        console.log("skip", record.name);
        return;
      }

      const r = writer.createSymbol(ns);

      const a = registerDataSymbol(
        backend,
        writer,
        ns,
        o.isa,
        o.ipv4,
        dotted2Number(record.content)
        // s => console.log("create", number2Dotted(writer.getData(s)))
      );
      const n = registerDataSymbol(
        backend,
        writer,
        ns,
        o.isa,
        o.name,
        record.name
        // s => console.log("create", writer.getData(s))
      );
      const t = registerDataSymbol(
        backend,
        writer,
        ns,
        o.isa,
        o.ttl,
        parseInt(record.ttl, 10)
        // s => console.log("create", writer.getData(s))
      );

      
      writer.setTriple([z, o.has, r], true);
      writer.setTriple([r, o.isa, o.record], true);
      writer.setTriple([r, o.has, t], true);
      writer.setTriple([r, o.has, n], true);
      writer.setTriple([r, o.has, a], true);
      writer.setTriple([a, o.has, n], true);
      
    });
}

doit(process.argv[2], process.argv[3]);
