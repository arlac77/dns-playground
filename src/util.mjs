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
  const symbolNames = [
    "ontology",
    "name",
    "description",
    "has",
    "isa",
    "ipv4",
    "zone",
    "entry",
    "ttl"
  ];

  writer.registerSymbolsInNamespace(recordingNamespace, symbolNames);

  const o = writer.symbolByName;

  //console.log(o);

  for (const item of Object.values(o)) {
    if (item === o.ontology) continue;
    writer.setTriple([o.ontology, o.has, item], true);
  }

  //setMetaTriple(ontology, [], o, writer);

  return o;
}
