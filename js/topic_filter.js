/**
 * js/topic_filter.js — Research Topics Faceted Filter & Tag Navigation (Ticket 012).
 * Filters publication cards by data-topics, updates aria-pressed, and syncs #topic=<slug> hash.
 */
(function () {
  'use strict';

  function filterPublicationsByTopic(topic) {
    var normalized = (topic || 'all').toLowerCase().trim();
    var cards = document.querySelectorAll('[data-topics]');
    cards.forEach(function (card) {
      var raw = (card.getAttribute('data-topics') || '').toLowerCase();
      var tags = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      var match = (normalized === 'all' || tags.indexOf(normalized) !== -1);
      card.style.display = match ? '' : 'none';
    });

    var buttons = document.querySelectorAll('.topic-filter-chip[data-topic]');
    buttons.forEach(function (btn) {
      var btnTopic = (btn.getAttribute('data-topic') || '').toLowerCase().trim();
      var active = (btnTopic === normalized);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (typeof history !== 'undefined' && history.replaceState) {
      var hash = normalized === 'all' ? window.location.pathname : '#topic=' + encodeURIComponent(normalized);
      history.replaceState(null, '', hash);
    }
  }

  function initTopicFilter() {
    var buttons = document.querySelectorAll('.topic-filter-chip[data-topic]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.getAttribute('data-topic') || 'all';
        filterPublicationsByTopic(t);
      });
    });

    var hash = (window.location.hash || '').replace(/^#/, '');
    if (hash.indexOf('topic=') === 0) {
      var initial = decodeURIComponent(hash.slice('topic='.length));
      if (initial) filterPublicationsByTopic(initial);
    }
  }

  if (typeof window !== 'undefined') {
    window.filterPublicationsByTopic = filterPublicationsByTopic;
    window.initTopicFilter = initTopicFilter;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTopicFilter);
    } else {
      initTopicFilter();
    }
  }
})();
