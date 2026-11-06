// 產生加密版 index.html
// 用法：PHONE_PW='你的密碼' node build.mjs <原始電話表.html>
// 原始電話表（明文）請勿放進此 repo。
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";

const src = process.argv[2];
const pw = process.env.PHONE_PW;
if (!src || !pw) {
  console.error("用法：PHONE_PW='密碼' node build.mjs <原始電話表.html>");
  process.exit(1);
}
if (pw.length < 10) console.warn("警告：密碼少於 10 字元，加密資料公開後容易被暴力破解。");

const html = readFileSync(src, "utf8");
const m = html.match(/const D = (\[[\s\S]*?\n\]);/);
if (!m) throw new Error("在原始檔中找不到 const D = [...] 資料");
const D = JSON.parse(m[1].replace(/,(\s*\])/g, "$1"));

const h1 = html.match(/<h1>([^<]*?)\s*<small>([^<]*)<\/small>/);
const foot = html.match(/<footer>([\s\S]*?)<\/footer>/);
const payload = {
  title: h1 ? h1[1].trim() : "電話查詢",
  date: h1 ? h1[2].trim() : "",
  footer: foot ? foot[1].trim() : "",
  D,
};

const iter = 600000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" },
  base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const ct = new Uint8Array(await crypto.subtle.encrypt(
  { name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(payload))));

const b64 = u => Buffer.from(u).toString("base64");
const enc = JSON.stringify({ iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) });
const tpl = readFileSync(new URL("./template.html", import.meta.url), "utf8");
const out = tpl.replace("/*ENC*/null/*/ENC*/", "/*ENC*/" + enc + "/*/ENC*/");
writeFileSync(new URL("./index.html", import.meta.url), out);
console.log(`已產生 index.html：${D.length} 筆，${payload.title} ${payload.date}`);
