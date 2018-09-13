module.exports = function (source) {

  const id = "data-v-" + Math.random().toString(36).substr(2, 9);

  let matchs = source.match(/(class=["']+[a-z.A-Z]+["'])/gm);

  matchs.forEach(element => {
    source = source.replace(element, element + ` ${id}`);
  });

  matchs = source.match(/[.]+[a-z+A-Z]+/gm);

  matchs.forEach(element => {
    source = source.replace(element, element + `[${id}] `);
  });

  return "module.exports = " + JSON.stringify(source) + ";";
}