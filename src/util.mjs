/**
 * Links symbol to a triple
 * @param {Symbol} symbol
 * @param {Symbol[]} triple
 * @param writer
 */
export function setMetaTriple(symbol, triple, writer) {
  writer.setTriple([symbol, writer.symbolByName.Entity, triple[0]], true);
  writer.setTriple([symbol, writer.symbolByName.Attribute, triple[1]], true);
  writer.setTriple([symbol, writer.symbolByName.Value, triple[2]], true);
}

/**
 * Creates a symbol with associated data
 * @param backend
 * @param writer
 * @param ns
 * @param attribute tripple attribute
 * @param value tripple value
 * @param data associated to the entity symbol
 * @param cb called only when symbol was not already present
 */
export function registerDataSymbol(
  backend,
  writer,
  ns,
  attribute,
  value,
  data,
  cb
) {
  let s = hasVMMData(backend, attribute, value, data);

  if (s === undefined) {
    s = writer.createSymbol(ns);
    writer.setData(s, data);
    writer.setTriple([s, attribute, value], true);

    //console.log("create",s, attribute, value, data);

    if (cb) cb(s);
  }

  return s;
}

export function createOntology(backend, writer, ns, ontologyDefintion) {
  const symbolNames = new Set([
    "ontology",
    "has",
    "isa",
    ...Object.keys(metaOntology.physicalUnits)
  ]);

  for (const a of attributes(metaOntology)) {
    symbolNames.add(a.name);
  }

  for (const a of attributes(ontologyDefintion)) {
    symbolNames.add(a.name);
  }

  //console.log(symbolNames);

  writer.registerSymbolsInNamespace(ns, [...symbolNames]);

  const o = writer.symbolByName;

  for (const a of attributes(ontologyDefintion)) {
    for (const ma of attributes(metaOntology)) {
      const data = a[ma.name];
      if (ma.type !== undefined && data !== undefined) {
        registerDataSymbol(backend, writer, ns, o.isa, o[ma.name], data, s => {
          console.log("set", a.name, ma.name, data);
          writer.setTriple([o[a.name], o.has, s], true);
        });
      }
    }
  }

  return o;
}

export function hasVMMData(backend, a, v, data) {
  for (const x of backend.queryTriples(backend.constructor.queryMasks.VMM, [
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
 * iterate over all attributes
 * @param owner root of the definition to traverse
 */
function* attributes(owner) {
  if (owner.attributes) {
    for (const [name, def] of Object.entries(owner.attributes)) {
      yield { owner, name, minOccurs: 1, maxOccurs: 1, ...def };
      yield* attributes(def);
    }
  }
  if (owner.choice) {
    for (const [name, def] of Object.entries(owner.choice)) {
      yield* attributes(def);
    }
  }
}

const metaOntology = {
  attributes: {
    choice: {},
    attributes: { minOccurs: 0, maxOccurs: 1 },
    description: { type: "UTF8" },
    physicalUnit: {},
    minValue: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
    maxValue: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
    minOccurs: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
    maxOccurs: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
    minLengthBytes: {
      type: "BinaryNumber",
      minOccurs: 0,
      maxOccurs: 1,
      minValue: 0
    },
    maxLengthBytes: {
      type: "BinaryNumber",
      minOccurs: 0,
      maxOccurs: 1,
      minValue: 0
    }
  },
  physicalUnits: {
    Second: {}
  }
};
