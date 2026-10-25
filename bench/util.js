function arg(name, def) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  return process.argv[i + 1];
}
function has(name) {
  return process.argv.includes(name);
}
function fmt(n) {
  return Number(n).toLocaleString("en-US");
}
function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
module.exports = { arg, has, fmt, mean };
