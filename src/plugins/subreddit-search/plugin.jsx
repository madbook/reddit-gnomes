'use strict';

import Plugin from '../../jsx/plugin';
import context from '../../jsx/context';

const isSubreddit = (result) => result.kind === 't5';

const isPost = (result) => result.kind === 't3';

const fakeThumbnails = new Set(['self', 'default', 'nsfw'])

const hasThumbnail = (result) => {
  let thumbnail = result.data.thumbnail;

  return thumbnail && !fakeThumbnails.has(thumbnail);
}

const classSet = (classDesc) => Object.keys(classDesc)
                                .filter((key) => classDesc[key]).join(' ');

const getTemplateClasses = (result) => classSet({
  'gnome-sr-search-result': true,
  'gnome-sr-post-result': isPost(result),
  'gnome-sr-subreddit-result': isSubreddit(result),
  'gnome-sr-has-thumbnail': hasThumbnail(result),
});

const renderPostThumbnail = (result) => {
  if (!hasThumbnail(result)) {
    return '';
  }

  return `<div class="gnome-sr-thumbnail">
    <img src="${result.data.thumbnail}">
  </div>`;
}

const queryPattern = new RegExp(`(${context.query.q})`, 'igm');

const highlightQuery = (text) => text.replace(queryPattern, '<strong>$1</strong>');

const renderPostSelftext = (result) => {
  if (!result.data.selftext) {
    return '';
  }

  return `<div class="gnome-sr-description">
    ${highlightQuery(result.data.selftext)}
  </div>`;
}

const getIconClasses = (type) => `gnome-sr-icon gnome-sr-icon-${type}`;

const renderIconLink = (iconType, url, displayText) => {
  if (!url) {
    return '';
  }

  if (!displayText) {
    displayText = url;
  }

  let iconLinkClasses = getIconClasses(iconType);
  
  return `<div class="gnome-sr-link-container">
    <span class="${iconLinkClasses}"></span>
    <a class="gnome-sr-link" href="${url}">${displayText}</a>
  </div>`;
}

const renderPostLink = (result) => renderIconLink('external', result.data.url);

const renderPostResult = (result) => `<!-- post result type -->
  ${renderPostThumbnail(result)}
  <div class="gnome-sr-title-container">
    <a class="gnome-sr-title" href="${result.data.permalink}">
       ${highlightQuery(result.data.title)}</a>
    <a class="gnome-sr-subtitle" href="/r/${result.data.subreddit}">
       /r/${highlightQuery(result.data.subreddit)}</a>
  </div>
  <div class="gnome-sr-meta">
    ${result.data.score} points,
    ${result.data.num_comments} comments,
    submitted [some time] ago
    by ${result.data.author}
  </div>
  ${renderPostSelftext(result)}
  ${renderPostLink(result)}`;

const renderSubredditRelation = (result) => {
  let label = '';

  if (result.data.user_is_moderator) {
    label = 'moderator';
  } else if (result.data.user_is_contributor) {
    label = 'contributor';
  } else if (result.data.user_is_subsriber) {
    label = 'subscribed';
  }

  if (!label) {
    return '';
  }

  return `<span class="gnome-sr-subreddit-relation">${label}</span>`;
}

const renderSubredditDescription = (result) => {
  if (!result.data.public_description) {
    return '';
  }

  return `<div class="gnome-sr-description">
    ${highlightQuery(result.data.public_description)}
  </div>`;
}

const renderSubredditFilterLink = (result) => renderIconLink('filter',
                                                `${result.data.url}subreddit-search${location.search}&restrict_sr=on`,
                                                `search in ${result.data.url}`);

const renderSubredditResult = (result) => `<!-- subreddit result type -->
  <div class="gnome-sr-title-container">
    <a class="gnome-sr-title" href="${result.data.url}">
       ${highlightQuery(result.data.title)}</a>
    <a class="gnome-sr-subtitle" href="${result.data.url}">
       /r/${highlightQuery(result.data.display_name)}</a>
  </div>
  <div class="gnome-sr-meta">
    ${renderSubredditRelation(result)}
    ${result.data.subscribers} subscribers,
    a community for [some time].
  </div>
  ${renderSubredditDescription(result)}
  ${renderSubredditFilterLink(result)}`;

const renderResult = (result) => {
  let content = '';

  if (isSubreddit(result)) {
    content = renderSubredditResult(result);
  } else if (isPost(result)) {
    content = renderPostResult(result);
  }

  if (!content) {
    return '';
  }

  return `<div class="${getTemplateClasses(result)}">${content}</div>`;
}

const renderGroup = (name, contents) => `<div class="gnome-sr-result-group">
  <div class="gnome-sr-result-group-header">
    ${name}
  </div>
  <div class="gnome-sr-result-group-contents">
    ${contents.join('\n')}
  </div>
  <div class="gnome-sr-more-results-container">
    <a class="gnome-sr-more-results" href="#">more ${name} results »</a>
  </div>
</div>`;

const renderSearchForm = (defaultVal) => `<div class="gnome-sr-search-form">
  <form action="/subreddit-search" method="GET">
    <input name="q" value="${defaultVal}" placeholder="search">
  </form>
</div>`;

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
        if (posts && posts.length) {
          posts = renderGroup('posts', posts.map(x => renderResult(x)));
        } else {
          posts = '';
        }

        var exactMatch = '';

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
          subreddits = renderGroup('subreddits', subreddits.map(x => renderResult(x)));
        } else {
          subreddits = '';
        }
        
        $container.html(`<div class="gnome-sr-page">
          ${renderSearchForm(searchQuery)}
          ${exactMatch}
          ${subreddits}
          ${posts}
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
