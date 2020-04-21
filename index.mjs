import fs from "fs";
import dnsz from "dnsz";
import {
  loaded,
  Diff,
  SymbolInternals,
  RustWasmBackend,
  RelocationTable
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
    backend.createSymbol(backend.metaNamespaceIdentity)
  );
  const modalNamespace = SymbolInternals.identityOfSymbol(
    backend.createSymbol(backend.metaNamespaceIdentity)
  );
  const recordingNamespace = SymbolInternals.identityOfSymbol(
    backend.createSymbol(backend.metaNamespaceIdentity)
  );

  try {
    backend.decodeJson(
      await fs.promises.readFile(dumpFileName, defaultEncoding)
    );
  } catch (e) {}

  const rt = RelocationTable.create();
  RelocationTable.set(rt, recordingNamespace, modalNamespace);

  const writer = new Diff(backend, repositoryNamespace, rt);

  const ontology = createOntology(writer, recordingNamespace, zoneOntologyDef);

  const data = dnsz.parse(
    await fs.promises.readFile(zoneFile, {
      encoding: "utf8"
    })
  );

  readZone(data.records, writer, ontology, recordingNamespace);

  writer.compressData();
  writer.commit();

  writeZone(backend, ontology);

  await fs.promises.writeFile(
    dumpFileName,
    backend.encodeJson([recordingNamespace]),
    defaultEncoding
  );
}

function writeZone(backend, ontology) {
  for (const rt of backend.queryTriples(backend.queryMasks.VMM, [
    backend.symbolByName.Void,
    ontology.isa,
    ontology.record
  ])) {
    const rs = rt[0];

    const record = {};

    for (const n of backend.queryTriples(backend.queryMasks.MMV, [
      rs,
      ontology.has,
      backend.symbolByName.Void
    ])) {
      const attribute = n[2];

      for (const at of backend.queryTriples(backend.queryMasks.MMV, [
        attribute,
        ontology.isa,
        backend.symbolByName.Void
      ])) {
        const as = at[2];

        switch (as) {
          case ontology.ipv4:
            record[backend.getData(as)] = number2Dotted(
              backend.getData(attribute)
            );
            break;
          default:
            record[backend.getData(as)] = backend.getData(attribute);
        }
        break;
      }
    }

    console.log(record);
  }
}

function readZone(records, backend, o, ns) {
  let z;

  records
    .filter(record => record.type === "A" && record.name !== "@")
    .forEach(record => {
      if (hasVMMData(backend, o.isa, o.name, record.name)) {
        //console.log("skip", record.name);
        return;
      }

      if (!z) {
        z = backend.createSymbol(ns);
        backend.setTriple([z, o.isa, o.zone], true);
      }

      const r = backend.createSymbol(ns);

      const a = registerDataSymbol(
        backend,
        ns,
        o.isa,
        o.ipv4,
        dotted2Number(record.content)
      );
      const n = registerDataSymbol(backend, ns, o.isa, o.name, record.name);
      const t = registerDataSymbol(
        backend,
        ns,
        o.isa,
        o.ttl,
        parseInt(record.ttl, 10)
      );

      backend.setTriple([z, o.has, r], true);
      backend.setTriple([r, o.isa, o.record], true);
      backend.setTriple([r, o.has, t], true);
      backend.setTriple([r, o.has, n], true);
      backend.setTriple([r, o.has, a], true);
      backend.setTriple([a, o.has, n], true);
    });
}

doit(process.argv[2], process.argv[3]);
