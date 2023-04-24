function now() {
  let dt = new Date();
  let m = ('00' + (dt.getMonth() + 1)).slice(-2);
  let d = ('00' + dt.getDate()).slice(-2);
  let h = ('00' + dt.getHours()).slice(-2);
  let min = ('00' + dt.getMinutes()).slice(-2);
  let s = ('00' + dt.getSeconds()).slice(-2);
  return `[${dt.getFullYear()}-${m}/${d} ${h}:${min}:${s}]`;
}

function log(level, x) {
  console.log(`${now()}\t${level}\t${x}`);
}

module.exports = { log };
