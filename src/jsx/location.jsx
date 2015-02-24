'use strict';

var protocolPattern = /^(https?:)/;
var hostPattern = /([a-zA-Z0-9_\-\.]{3,}\.[a-zA-Z]{2,3})/;

export default class Location {
  static parseURL(url) {
    return new Location(url);
  }

  constructor(url) {
    var protocolMatch = url.match(protocolPattern);
    var protocol;

    if (protocolMatch) {
      protocol = protocolMatch[0];
      url = url.replace(protocol, '');
    } else {
      protocol = location.protocol;
    }

    var hostMatch = url.match(hostPattern);
    var host;

    if (hostMatch) {
      host = hostMatch[0];
      url = url.replace(host, '');
    } else {
      host = location.host;
    }

    var parts = url.replace(/\//g, ' ').trim().split(' ');
    var subreddit = parts[0] === 'r' ? parts[1] : null;
    var pageID = subreddit ? 2 : 0;
    var page = parts[pageID] || null;
    var thing = page ? parts[pageID + 1] : null;
    var pathname = '/' + parts.join('/');

    this.parts = parts;
    this.pathname = pathname;
    this.subreddit = subreddit;
    this.page = page;
    this.thing = thing;
    this.protocol = protocol;
    this.host = host;
  }
}
