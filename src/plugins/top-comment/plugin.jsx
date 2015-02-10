!function() {
  'use strict';

  window.initPlugin(
    'top-comment',
    'adds a link to posts on listing pages to load the top comment inline',
    plugin);

  function plugin(context, store) {
    if (context.location.page) { return; }

    var $things = $('#siteTable .thing');

    if (!$things.length) { return; }

    var onFrontpage = !context.location.subreddit;
    var buttonTemplate = `<li>
      <a class="reddit-prototype-top-comment" href="#">[top comment]</a>
    </li>`;

    $things.each(function() {
      var $this = $(this);
      // check the number of comments first
      var comments = parseInt($this.find('.comments').text().split(' ')[0], 10) | 0;

      if (!comments) { return; }

      $this.find('.buttons').append($.parseHTML(buttonTemplate));
    });

    $('#siteTable').on('click', 'a.reddit-prototype-top-comment', function(e) {
      e.preventDefault();

      var $this = $(this);
      var $parent = $this.closest('.thing');
      var fullname = $parent.data('fullname');
      var id = fullname.split('_')[1];
      var pathObj = onFrontpage ? context.parseURL($parent.find('a.subreddit').attr('href')) : context.location;
      var params = $.param({
        limit: 1,
        sort: 'top',
      });
      var path = `/${pathObj.pathname}/comments/${id}.json\?${params}`;

      $.get(path).then(function(res) {
        var comment = res[1].data.children[0].data;
        $parent.find('.entry').append(
          $.parseHTML(`<div class="reddit-prototype-top-comment-text md-container">
            ${context.unsafe(comment.body_html)}
          </div>`)
        );
        $this.remove();
      });
    });
  }
}();
