'use strict';

import Plugin from '../../jsx/plugin';
import { route } from '../../jsx/route';
import { 
  toCssClassName,
  escapeHTML,
} from '../../jsx/utils';

const lazyLinkflairRegex = / *\[([^\]]+)\] */g;

function replaceLazyLinkFlair(match, $1) {
  var className = toCssClassName($1);

  return ` <span class="lazy-linkflair lazy-linkflair-${className}">${$1}</span> `;
}

function injectLazyLinkFlair(link) {
  let $link = $(link);
  let $title = $link.find('a.title');
  let titleText = $title.text();
  let escapedText = escapeHTML(titleText);
  var replacedText = escapedText.replace(lazyLinkflairRegex, replaceLazyLinkFlair);

  $title.html(replacedText);
}

export default class LazyLinkflairPlugin extends Plugin {
  displayName = 'LazyLinkflair';
  description = 'linkflair for the lazy';

  @route
  addLazyLinkFlair() {
    let $listing = $('.linklisting');
    let $links = $listing.children('.link').toArray();

    if (!$links.length) {
      return;
    }

    $links.forEach(injectLazyLinkFlair);
  }
}
