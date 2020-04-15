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

export function createOntology(writer, recordingNamespace) {
  const symbolNames = ["ontology", "has", "isa"];

  for (const a of attributes(metaOntology)) {
    symbolNames.push(a.name);
  }

  for (const a of attributes(zoneOntologyDef)) {
    symbolNames.push(a.name);
  }

  //console.log(symbolNames);

  writer.registerSymbolsInNamespace(recordingNamespace, symbolNames);

  const o = writer.symbolByName;

  for (const item of Object.values(o)) {
    if (item === o.ontology) continue;
    writer.setTriple([o.ontology, o.has, item], true);
  }

  //setMetaTriple(ontology, [], o, writer);

  return o;
}

/**
 * iterate over all attributes
 * @param od
 */
function* attributes(od) {
  if (od.attributes) {
    for (const [name, def] of Object.entries(od.attributes)) {
      yield { owner: od, name, ...def };
      yield* attributes(def);
    }
  }
}

const metaOntology = {
  attributes: {
    attributes: { minOccurs: 0, maxOccurs: 1 },
    minOccurs: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
    maxOccurs: { type: "BinaryNumber", minOccurs: 0, maxOccurs: 1 }
  }
};

const zoneOntologyDef = {
  attributes: {
    zone: {
      attributes: {
        entry: {
          minOccurs: 0,
          maxOccurs: Number.MAX_SAFE_INTEGER,
          attributes: {
            name: { minOccurs: 1, maxOccurs: 1 },
            ttl: { minOccurs: 0, maxOccurs: 1 },
            ipv4: { minOccurs: 0, maxOccurs: 1 },
            comment: {}
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

 '1.1.1.1' isa ipv4
 'ordoid1' isa name
 '1.1.1.1' has 'odroid1'
*/
