import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const prototype = await readFile(resolve(root, "docs", "design", "index.html"), "utf8");
const match = prototype.match(/<defs>([\s\S]*?)<\/defs>/);
if (!match) throw new Error("The reviewed prototype does not contain the illustration definitions.");

const destination = resolve(root, "web", "public", "images");
await mkdir(destination, { recursive: true });

const illustrations = [
  ["meal-harissa", "art-harissa", 400, 330, "Illustration of a chicken and vegetable bowl"],
  ["meal-paneer", "art-paneer", 400, 330, "Illustration of a paneer and vegetable bowl"],
  ["meal-chickpea", "art-chickpea", 400, 330, "Illustration of a chickpea and herb bowl"],
  ["meal-oats", "art-oats", 400, 330, "Illustration of an oats and berry pot"],
  ["meal-tofu", "art-tofu", 400, 330, "Illustration of a tofu and vegetable bowl"],
  ["meal-wrap", "art-wrap", 400, 330, "Illustration of a vegetable wrap"],
  ["story-carrots", "story-carrots", 340, 290, "Illustration of fresh carrots"],
];

for (const [name, symbol, width, height, title] of illustrations) {
  if (!match[1].includes(`id="${symbol}"`)) throw new Error(`Missing illustration symbol: ${symbol}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="image-title"><title id="image-title">${title}</title><defs>${match[1]}</defs><use href="#${symbol}" width="${width}" height="${height}"/></svg>\n`;
  await writeFile(resolve(destination, `${name}.svg`), svg);
}
console.log(`Exported ${illustrations.length} original illustrations. These are not food photographs.`);
