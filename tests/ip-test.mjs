import test from "ava";
import { dotted2Number, number2Dotted,
         number2ipv6, ipv62Number } from "../src/ip-util.mjs";

function dnt4(t, d) {
  t.is(d, number2Dotted(dotted2Number(d)), `${d}<>${dotted2Number(d)}`);
}

dnt4.title = (providedTitle = "dotted2Number & back", d) =>
  `${providedTitle} ${d}
  )}`.trim();

test(dnt4, "0.0.0.0");
test(dnt4, "127.0.0.1");
test(dnt4, "10.0.6.1");
test(dnt4, "255.255.255.255");


function dnt6(t, d) {
  t.is(d, number2ipv6(ipv62Number(d)), `${d}<>${ipv62Number(d)}`);
}

dnt6.title = (providedTitle = "ipv62Number & back", d) =>
  `${providedTitle} ${d}
  )}`.trim();


test(dnt6,"0:0:0:0:0:0:0:0");
test(dnt6,"2003:fb:fff:94c:c225:6ff:fee2:8a7c");