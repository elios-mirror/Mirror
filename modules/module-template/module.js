const id = "data-v-" + Math.random().toString(36).substr(2, 9);

function replaceCssClass(str, group1) {
  return (group1  + `[${id}]`);
}

function replaceHtmlClass(str, group1) {
  return (group1  + ` ${id}`);
}

module.exports = function (source) {
  var html = source.replace(/(class=["']+[a-z0-9]+["'])/g, replaceHtmlClass);
  var css = html.replace(/(\.[a-z0-9]+)(?={|:| |\.)/g, replaceCssClass);

  return "module.exports = " + JSON.stringify(css) + ';';
}