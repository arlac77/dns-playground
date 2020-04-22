import {
    loaded,
    Diff,
    SymbolInternals,
    RelocationTable,
    RustWasmBackend
  } from "SymatemJS";
  
export async function prepareBackend() {
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
   
    const rt = RelocationTable.create();
    RelocationTable.set(rt,recordingNamespace,modalNamespace);
  
    const writer = new Diff(
      backend,
      repositoryNamespace,
      rt
    );
  
    return { writer, backend, recordingNamespace, repositoryNamespace, modalNamespace };
  }
  