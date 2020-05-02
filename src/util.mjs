/**
 * Links symbol to a triple
 * @param {Symbol} symbol
 * @param {Symbol[]} triple
 * @param {Backend} backend
 */
export function setMetaTriple(symbol, triple, backend) {
  backend.setTriple([symbol, backend.symbolByName.Entity, triple[0]], true);
  backend.setTriple([symbol, backend.symbolByName.Attribute, triple[1]], true);
  backend.setTriple([symbol, backend.symbolByName.Value, triple[2]], true);
}

/**
 * Creates a symbol with associated data.
 * But only if there is no such symbol already
 * @param {Backend} backend
 * @param {Symbol} ns
 * @param {Symbol} attribute tripple attribute
 * @param {Symbol} value tripple value
 * @param {any} data associated to the entity symbol
 * @param cb called only when symbol was not already present
 */
export function registerDataSymbol(backend, ns, attribute, value, data, cb) {
  let s = hasVMMData(backend, attribute, value, data);

  if (s === undefined) {
    s = backend.createSymbol(ns);
    backend.setData(s, data);
    backend.setTriple([s, attribute, value], true);

    //console.log("create",s, attribute, value, data);

    if (cb) cb(s);
  }

  return s;
}

export function hasVMMData(backend, a, v, data) {
  for (const x of backend.queryTriples(backend.queryMasks.VMM, [
    backend.symbolByName.Void,
    a,
    v
  ])) {
    /*console.log(a,v,
      data,
      "=",
      backend.getData(x[0]),
      data === backend.getData(x[0])
    );
    */
    if (data === backend.getData(x[0])) {
      return x[0];
    }
  }

  return undefined;
}

/**
 * [S1,P,O1]
 * [O1,P,O2]
 * @param backend
 * @param qt
 * @param direction
 */
export function* traverse(backend, qt, direction = backend.queryMasks.MMV) {
  let found;

  do {
    found = false;
    for (const r of backend.queryTriples(direction, qt)) {
      switch (direction) {
        case backend.queryMasks.MMV:
          yield (qt[0] = r[2]);
          break;
      }
      found = true;
      break;
    }
  } while (found);
}

const _variables = {};
export function DeclareVariable(name) {
  let v = _variables[name];
  if (!v) {
    v = _variables[name] = Symbol(name);
  }

  return v;
}