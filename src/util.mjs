/**
 * Links symbol to a triple
 * @param {Symbol} symbol
 * @param {Symbol[]} triple
 * @param {Object} ontology
 * @param writer
 */
export function setMetaTriple(symbol, triple, ontology, writer) {
  writer.setTriple([symbol, ontology.Entity, triple[0]], true);
  writer.setTriple([symbol, ontology.Attribute, triple[1]], true);
  writer.setTriple([symbol, ontology.Value, triple[2]], true);
}

export function createOntology(backend, writer, recordingNamespace) {
  const symbolNames = new Set(["ontology", "has", "isa"]);

  for (const a of attributes(metaOntology)) {
    symbolNames.add(a.name);
  }

  for (const a of attributes(zoneOntologyDef)) {
    symbolNames.add(a.name);
  }

  //console.log(symbolNames);

  writer.registerSymbolsInNamespace(recordingNamespace, [...symbolNames]);

  const o = writer.symbolByName;

  //setMetaTriple(ontology, [], o, writer);

  for (const a of attributes(zoneOntologyDef)) {
    for (const ma of attributes(metaOntology)) {
      const data = a[ma.name];
      if (ma.type !== undefined && data !== undefined) {
        let s = hasVMMData(backend, o.isa, o[ma.name], data);
        if (!s) {
          console.log(a.name, ma.name, data);
          const s = writer.createSymbol(recordingNamespace);
          writer.setTriple([s, o.isa, o[ma.name]], true);
          writer.setData(s, data);
          writer.setTriple([o[a.name], o.has, s], true);
        }
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
    minValue: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
    maxValue: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
    minOccurs: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
    maxOccurs: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
    minLengthBytes: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
    maxLengthBytes: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 }
  }
};

const zoneOntologyDef = {
  attributes: {
    zone: {
      attributes: {
        record: {
          minOccurs: 0,
          maxOccurs: 0xFFFFFFFF,
          attributes: {
            name: {
              minLengthBytes: 1,
              maxLengthBytes: 255
            },
            ttl: {
              description: "time to live in seconds",
              type: "BinaryNumber",
              minValue: 1,
              maxValue: 2147483647,
              minOccurs: 0, maxOccurs: 1 },
            comment: { minOccurs: 0 }
          },
          choice: {
            A: {
              description: "a host address",
              attributes: {
                ipv4: {
                  type: "BinaryNumber",
                  description: "ip-v4 address as 32 bit integer"
                }
              }
            },
            CNAME: {
              description: "the canonical name for an alias",
              attributes: {
                alias: {}
              }
            },
            MX: {
              description: "mail exchange",
              attributes: {
                mx: {}
              }
            }
          }
        }
      }
    }
  }
};

/*
 ontology:
    isa   - subject isa category?
    has   - subject has attribute

*/
