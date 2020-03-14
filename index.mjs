import fs from "fs";
import dnsz from "dnsz";
import {
  loaded,
  RustWasmBackend
} from "SymatemJS";

async function doit() {
  await loaded;

  const backend = new RustWasmBackend();
  backend.initPredefinedSymbols();

  const source = backend.createSymbol(4);

  const buffer =new ArrayBuffer(4);
  const view = new Int32Array(buffer);
  view[0] = 127;

  backend.writeData(source, 0, 32, buffer);

  const data = dnsz.parse(
    await fs.promises.readFile("tests/fixtures/private.zone", {
      encoding: "utf8"
    })
  );

  console.log(data);
}

doit();
