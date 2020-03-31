import fs from "fs";
import { join } from "path";
import dnsz from "dnsz";
import { loaded, Diff, RustWasmBackend } from "SymatemJS";

const repositoryNamespace = 4,
  recordingNamespace = 5,
  modalNamespace = 6;

async function doit() {
  await loaded;

  const rootNS = new RustWasmBackend();
  rootNS.initPredefinedSymbols();

  const writer = new Diff(
    rootNS,
    { [recordingNamespace]: modalNamespace },
    repositoryNamespace
  );

  const data = dnsz.parse(
    await fs.promises.readFile("tests/fixtures/private.zone", {
      encoding: "utf8"
    })
  );

  const ns = 4;
  const has = writer.createSymbol(ns);
  writer.setData(has, "has");

  data.records
    .filter(record => record.type === "A")
    .forEach(record => {
      const a = writer.createSymbol(ns);
      writer.setData(a, record.content);

      const name = writer.createSymbol(ns);
      writer.setData(name, record.name);

      writer.setTriple([a, has, name], true);
    });

  writer.compressData();
  writer.commit();

  const fileContent = writer.encodeJson();
  console.log(fileContent);
  // await fs.promises.writeFile(join("/tmp", "001.json"), fileContent, { encoding: 'utf8' });

  //console.log(data.records);
}

doit();
