export function dotted2Number(x) {
  return x.split(".").reduce((a, c) => a * 256 + parseInt(c, 10), 0);
}

export function number2Dotted(x) {
  return [24, 16, 8, 0].map(s => (x >> s) & 0xff).join(".");
}
