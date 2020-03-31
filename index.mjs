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

  const outDiff = new Diff(
    rootNS,
    { [recordingNamespace]: modalNamespace },
    repositoryNamespace
  );

  const source = outDiff.createSymbol(4);
  const source2 = outDiff.createSymbol(4);

  const buffer = new ArrayBuffer(4);
  const view = new Int32Array(buffer);
  view[0] = 127;

  outDiff.writeData(source, 0, 32, buffer);

  outDiff.compressData();
  outDiff.commit();

  const fileContent = outDiff.encodeJson();
  console.log(fileContent);
 // await fs.promises.writeFile(join("/tmp", "001.json"), fileContent, { encoding: 'utf8' });

  const data = dnsz.parse(
    await fs.promises.readFile("tests/fixtures/private.zone", {
      encoding: "utf8"
    })
  );

 // console.log(data);
}

doit();
