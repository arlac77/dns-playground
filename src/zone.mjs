export const zoneOntologyDef = {
    attributes: {
      networkInterface: {
        attributes: {
          characterString: {},
          name: { isa: "characterString" },
          macAddress: {},
          ipv4: {
            isa: "BinaryNumber",
            description: "ip-v4 address as 32 bit integer",
            minOccurs: 0,
            maxOccurs: 1024
          }
        }
      },
      zone: {
        attributes: {
          record: {
            minOccurs: 0,
            maxOccurs: 0xffffffff,
            attributes: {
              name: {
                minLengthBytes: 1,
                maxLengthBytes: 255
              },
              ttl: {
                description: "time to live in seconds",
                isa: "BinaryNumber",
                minValue: 1,
                maxValue: 2147483647,
                minOccurs: 0,
                maxOccurs: 1,
                physicalUnit: "Second"
              },
              comment: { minOccurs: 0 }
            },
            choice: {
              A: {
                description: "a host address",
                attributes: {
                  ipv4: {
                    isa: "BinaryNumber",
                    description: "ip-v4 address as 32 bit integer"
                  }
                }
              },
              CNAME: {
                description: "the canonical name for an alias",
                isa: "name",
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
  