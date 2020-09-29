import {
    Diff,
    SymbolInternals,
    Repository,
    RustWasmBackend
  } from "@symatem/core";
  
export async function prepareBackend() {  
    const backend = await new RustWasmBackend();
    
    const repositoryNamespace = SymbolInternals.identityOfSymbol(
      backend.createSymbol(backend.metaNamespaceIdentity)
    );
 
    const recordingNamespace = SymbolInternals.identityOfSymbol(
      backend.createSymbol(backend.metaNamespaceIdentity)
    );
     
    const repository = new Repository(backend, backend.createSymbol(repositoryNamespace));
    const writer = new Diff(repository);
  
    return { writer, backend, recordingNamespace, repositoryNamespace, repository };
  }
  