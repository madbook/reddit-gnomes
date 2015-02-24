'use strict';

var unsafeDiv = document.createElement('div');

export function unsafe(text) {
  unsafeDiv.innerHTML = text;
  return unsafeDiv.innerText;
}


var camelCaseRegex = /([a-z])([A-Z])/g;
var whitespaceRegex = /\ +/g;

function hyphenate(match, $1, $2) {
  return $1 + '-' + $2;
}

export function toCssClassName(name) {
  return name.replace(whitespaceRegex, '-')
             .replace(camelCaseRegex, hyphenate)
             .toLowerCase();
}
