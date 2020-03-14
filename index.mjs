import fs from "fs";
import  dnsz from "dnsz";
import {loaded, Utils, SymbolInternals, SymbolMap, BasicBackend, Diff, RustWasmBackend} from "SymatemJS";


async function doit() {
    await loaded;

    const backend = new RustWasmBackend();
    backend.initPredefinedSymbols();

    const data = dnsz.parse(await fs.promises.readFile("tests/fixtures/private.zone", { encoding: "utf8"}));

    console.log(data);
}


doit();