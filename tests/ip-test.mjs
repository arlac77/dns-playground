import test from "ava";
import { dotted2Number, number2Dotted } from "../src/ip-util.mjs";

test("dotted", t => {
  t.is('0.0.0.0',number2Dotted(0));
}); 
