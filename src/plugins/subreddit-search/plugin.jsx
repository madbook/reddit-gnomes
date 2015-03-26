'use strict';

import Plugin from '../../jsx/plugin';
import context from '../../jsx/context';
import {renderResult, renderGroup, renderSearchForm} from './templates';

export default class SubredditSearch extends Plugin {
  shouldRun() {
    return context.page === 'subreddit-search';
  }

  run() {
    let searchQuery = location.search.slice(3);
    let $container = $('body > div.content');

    $container.empty();
    $('#header .pagename').text('search + subreddits');

    if (searchQuery) {
      var postSearchEndpoint;
      
      let searches = [];

      if (context.subreddit) {
        searches.push(`/r/${context.subreddit}/search.json${location.search}`);
      } else {
        searches.push(`/search.json${location.search}`);
        searches.push(`/subreddits/search.json${location.search}&limit=5`);
      }

      let searchResults = searches.map(query => $.get(query).then(res => res.data.children));

      $.when.apply($, searchResults)
      .then((posts, subreddits) => {
        var exactMatch = '';
        var renderedSubreddits = '';
        var renderedPosts = '';
        
        if (posts && posts.length) {
          renderedPosts = posts.map(x => renderResult(x));
          let moreLink = '/search' + location.search;
          
          if (context.subreddit) {
            moreLink = `/r/${context.subreddit}${moreLink}`
          }

          let lastPost = posts[posts.length - 1];
          moreLink += `&after=${lastPost.data.name}`;

          renderedPosts = renderGroup('posts', renderedPosts, moreLink);
        }

        if (subreddits && subreddits.length) {
          let testDisplayName = subreddits[0].data.display_name.toLowerCase();
          let testQuery = context.query.q.toLowerCase();

          if (testDisplayName === testQuery) {
            exactMatch = `<div class="gnome-sr-result-group">
              <div class="gnome-sr-result-group-contents">
                ${renderResult(subreddits[0])}
              </div>
            </div>`;
            subreddits = subreddits.slice(1);
          }
        } 

        if (subreddits && subreddits.length) {
          renderedSubreddits = subreddits.map(x => renderResult(x));
          let moreLink = '/subreddits/search' + location.search;
          let lastSubreddit = subreddits[subreddits.length - 1];
          moreLink += `&after=${lastSubreddit.data.name}`;
          renderedSubreddits = renderGroup('subreddits', renderedSubreddits, moreLink);
        }
        
        $container.html(`<div class="gnome-sr-page">
          ${renderSearchForm(searchQuery)}
          ${exactMatch}
          ${renderedSubreddits}
          ${renderedPosts}
        </div>`);
      });
    } else {
      $container.html(`<div class="gnome-sr-page">
          ${renderSearchForm(searchQuery)}
        </div>`);
    }
  }
}

SubredditSearch.meta = {
  displayName: 'Subreddit Search',
  description: 'mockup of subreddits in search results',
}
