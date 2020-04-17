export const zoneOntologyDef = {
    attributes: {
      networkInterface: {
        attributes: {
          name: {},
          type: {},
          macAddress: {},
          ipv4: {
            type: "BinaryNumber",
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
                type: "BinaryNumber",
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
  