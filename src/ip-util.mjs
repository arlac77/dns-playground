export function dotted2Number(x) {
  return x.split(".").reduce((a, c) => a * 256 + parseInt(c, 10), 0);
}

export function number2Dotted(x) {
  return [24, 16, 8, 0].map(s => (x >> s) & 0xff).join(".");
}

export function ipv62Number(x) {
  return x.split(":").reduce((a, c) => a * 256n * 256n + BigInt(parseInt(c, 16)), 0n);
}

export function number2ipv6(x) {
  return [112, 96, 80, 64, 48, 32, 16, 0].map(s => (x >> BigInt(s)) & BigInt(0xffff)).join(":");
}
