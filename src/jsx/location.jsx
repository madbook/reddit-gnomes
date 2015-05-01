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

    let queryParts = url.split('?');
    let query = {};
    
    if (queryParts.length > 1) {
      url = queryParts[0];

      queryParts.slice(1)
      .join('?')
      .split('&')
      .forEach(pair => {
        let parts = pair.split('=')
        let key = parts[0];
        let val = true;
        
        if (parts.length === 2) {
          val = parts[1];
        }

        query[key] = val;
      });
    }

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

    var hostParts = host.split('.');
    var domain = hostParts[hostParts.length - 1];

    var subdomain;
    if (hostParts.length >= 3) {
      subdomain = hostParts[0];
    } else {
      subdomain = 'www';
    }

    var hostName;
    if (hostParts.length >= 3) {
      hostName = hostParts.slice(1, hostParts.length - 2).join('.');
    } else {
      hostName = hostParts.slice(0, hostParts.length - 1).join('.');
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
    this.subdomain = subdomain;
    this.hostName = hostName;
    this.domain = domain;
    this.query = query;
  }
}
