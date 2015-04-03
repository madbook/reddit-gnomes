'use strict';

import context from '../../jsx/context';
import Plugin from '../../jsx/plugin';

let ghostTemplate = `<div class="gnome-stickied-comment-ghost">
  <p>This comment has been stickied above.</p>
</div>`;

let stickyTemplate = `<div class="gnome-stickied-comment-container collapsed">
  <div class="gnome-stickied-comment"></div>
  <div class="gnome-stickied-expando"></div>
</div>`;

export default class StickyCommentsPlugin extends Plugin {
  shouldRun() {
    return super.shouldRun() && context.page === 'comments';
  }

  run() {
    let distinguishements = ['admin', 'moderator'];
    let cssQuery = distinguishements.map(name => `.userattrs .${name}`).join(',');
    let $commentArea = $('.commentarea');
    let $theComment = $commentArea.find(cssQuery).closest('.thing').eq(0);

    if (!$theComment.length) {
      return;
    }

    let $siteTable = $commentArea.children('.sitetable');
    let $stickyContainer = $($.parseHTML(stickyTemplate));
    let $stickyComment = $stickyContainer.find('.gnome-stickied-comment');
    let $stickyGhost = $($.parseHTML(ghostTemplate));
    let $replies = $theComment.find('> .child > .sitetable > .thing');
    let numReplies = $replies.length;

    if (numReplies) {
      let $stickyExpando = $stickyContainer.find('.gnome-stickied-expando');
      $stickyExpando.text(`[+] ${numReplies} replies`);
      $stickyExpando.on('click', e => $stickyContainer.removeClass('collapsed'));
    } else {
      $stickyContainer.removeClass('collapsed');
    }

    $theComment.before($stickyGhost);
    $stickyComment.append($theComment);
    $siteTable.before($stickyContainer);
  }
}

StickyCommentsPlugin.meta = {
  displayName: 'Gnome-Child\'s Sticky Comment',
  description: `seaches for a distinguished comment on a page and makes it sticky.`,
};
