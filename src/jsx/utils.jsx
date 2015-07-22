'use strict';

var unsafeEl = document.createElement('div');

export function unsafe(text) {
  unsafeEl.innerHTML = text;
  return unsafeEl.innerText;
}

var whitespaceRegex = /\ +/g;
var unsafeCharRegex = /[^A-Za-z0-8_\-]/g;
var camelCaseRegex = /([a-z])([A-Z])/g;
var leadingNumberRegex = /^([0-9])/;

function hyphenate(match, $1, $2) {
  return $1 + '-' + $2;
}

export function toCssClassName(name) {
  return name.replace(whitespaceRegex, '-')
             .replace(unsafeCharRegex, '')
             .replace(camelCaseRegex, hyphenate)
             .replace(leadingNumberRegex, '_$1')
             .toLowerCase();
}

var escapeEl = document.createElement('textarea');

export function escapeHTML(html) {
    escapeEl.textContent = html;
    return escapeEl.innerHTML;
}

export function unescapeHTML(html) {
    escapeEl.innerHTML = html;
    return escapeEl.textContent;
}
