import { registerDataSymbol } from "./util.mjs";

/**
 * 
 * @param {Backend} backend
 * @param ns 
 * @param ontologyDefintion 
 */
export function createOntology(backend, ns, ontologyDefintion) {
    const symbolNames = new Set([
      "ontology",
      "has",
      "isa"
    ]);
  
    for (const a of attributes(metaOntology)) {
      symbolNames.add(a.name);
    }
  
    for (const a of attributes(ontologyDefintion)) {
      symbolNames.add(a.name);
    }
  
    //console.log(symbolNames);
  
    backend.registerSymbolsInNamespace(ns, [...symbolNames]);
  
    const o = backend.symbolByName;
  
    //console.log(Object.keys(o));
    for (const a of attributes(ontologyDefintion)) {
      for (const ma of attributes(metaOntology)) {
        const data = a[ma.name];
        if (ma.isa !== undefined && data !== undefined) {
          registerDataSymbol(backend, ns, o.isa, o[ma.name], data, s => {
            console.log("set", a.name, ma.name, data);
            backend.setTriple([o[a.name], o.has, s], true);
          });
        }
      }
    }
  
    return o;
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
    entities: {
      physicalUnit: {},
      Second: { isa: "physicalUnit" }
    },
    attributes: {
      choice: {},
      attributes: { minOccurs: 0, maxOccurs: 1 },
      
      characterString: {},
      name: { isa: "characterString" },
      description: { isa: "characterString" },
  
      minValue: { isa: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
      maxValue: { isa: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
      minOccurs: { isa: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
      maxOccurs: { isa: "BinaryNumber", minOccurs: 0, maxOccurs: 1 },
      minLengthBytes: {
        isa: "BinaryNumber",
        minOccurs: 0,
        maxOccurs: 1,
        minValue: 0
      },
      maxLengthBytes: {
        isa: "BinaryNumber",
        minOccurs: 0,
        maxOccurs: 1,
        minValue: 0
      }
    }
  };
  