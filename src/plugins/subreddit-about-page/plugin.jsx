
import Plugin from '../../jsx/plugin';
import { route } from '../../jsx/route';
import { unsafe } from '../../jsx/utils';
import context from '../../jsx/context';

function aboutPageTemplate(descriptionHTML) {
  return `<div class="gnome-about-page md-container">${unsafe(descriptionHTML)}</div>`
}

export default class SubredditAboutPagePlugin extends Plugin {
  displayName = 'Fake About Page';
  description = 'adds a fake about page using sidebar text at /r/subreddit/about';

  @route({ subreddit: true, page: 'about', thing: false })
  async fakeAboutPage() {
    try {
      let jsonResponse = await $.getJSON(`/r/${context.subreddit}/about/.json`)
      let { data } = jsonResponse;
      let { description_html: descriptionHTML } = data;
      let markup = aboutPageTemplate(descriptionHTML)
      let $container = $('body > div.content');
      $container.html(markup);

      let $pageTitle = $('.redditname');
      $pageTitle.text(`${context.subreddit}: about`);
    } catch (err) {
      console.warn('unable to get json for this subreddit');
    }
  }
}
