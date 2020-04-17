import test from "ava";
import { dotted2Number, number2Dotted } from "../src/ip-util.mjs";

function dnt(t, d) {
  t.is(d, number2Dotted(dotted2Number(d)), `${d}<>${dotted2Number(d)}`);
}

dnt.title = (providedTitle = "dotted2Number & back", d) =>
  `${providedTitle} ${d}
  )}`.trim();

test(dnt, "0.0.0.0");
test(dnt, "10.0.6.1");
test(dnt, "255.255.255.255");
