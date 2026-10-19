// Seller Center - Fulfillment Mode
//
// Built to fail safe: everything here keys off page addresses and on-screen
// labels ("GMV", "$"), never off Walmart's page layout code. If Walmart
// changes something, the worst case is a number shows again; order
// fulfillment is never affected.

(function () {
  "use strict";

  var config = FULFILLMENT_MODE_CONFIG;
  var HOST = "seller.walmart.com";

  function normalize(path) {
    return path.toLowerCase().replace(/\/+$/, "") || "/";
  }

  var redirectPath = normalize(new URL(config.redirectTo).pathname);
  var homePath = normalize(config.homepagePath || "/home");

  var blocked = config.blockedPaths
    .map(normalize)
    // Never block the page we redirect to, or we'd loop forever.
    .filter(function (p) { return !isUnder(redirectPath, p); });

  function isUnder(path, prefix) {
    if (prefix === "/") return path === "/";
    return path === prefix || path.indexOf(prefix + "/") === 0;
  }

  function isBlocked(url) {
    var u;
    try {
      u = new URL(url, location.href);
    } catch (e) {
      return false;
    }
    // Only Seller Center pages; links to Brand Portal, Ad Center etc. are left alone.
    if (u.hostname !== HOST) return false;
    var path = normalize(u.pathname);
    return blocked.some(function (prefix) { return isUnder(path, prefix); });
  }

  function onHomepage() {
    return normalize(location.pathname) === homePath;
  }

  // ---- Redirect away from blocked pages ----------------------------------

  // Hide the whole page so no numbers flash on screen before the redirect.
  var hider = null;
  function hidePage() {
    if (hider) return;
    hider = document.createElement("style");
    hider.textContent = "html { visibility: hidden !important; }";
    (document.head || document.documentElement).appendChild(hider);
  }

  var redirecting = false;
  function check(url) {
    if (redirecting || !isBlocked(url || location.href)) return;
    redirecting = true;
    hidePage();
    location.replace(config.redirectTo);
  }

  // ---- Remove links to blocked pages (sidebar, homepage tiles) ------------

  var CONTROLS = 'a, button, input, select, [role="button"], [role="link"], [role="menuitem"]';

  function inBlockedLink(node, box) {
    for (var el = node.parentElement; el && el !== box.parentElement; el = el.parentElement) {
      if (el.tagName === "A" && el.href && isBlocked(el.href)) return true;
    }
    return false;
  }

  function squash(s) { return s.replace(/\s+/g, " ").trim(); }

  // True if `box` holds nothing worth keeping: every link in it is blocked
  // (so a Payments sub-menu goes along with Payments), any other button is
  // an unlabeled icon such as an expand arrow, and any leftover text only
  // repeats the item's own name (like a hover tooltip).
  function holdsOnly(box, link) {
    var controls = box.querySelectorAll(CONTROLS);
    for (var i = 0; i < controls.length; i++) {
      var c = controls[i];
      if (c === link || link.contains(c)) continue;
      if (c.tagName === "A") {
        if (c.href && isBlocked(c.href)) continue;
        return false;
      }
      if (inBlockedLink(c, box)) continue;
      if (squash(c.textContent) !== "") return false;
    }
    var label = squash(link.textContent);
    var walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    for (var t = walker.nextNode(); t; t = walker.nextNode()) {
      var text = squash(t.nodeValue);
      if (text === "" || inBlockedLink(t, box)) continue;
      if (label === "" || label.indexOf(text) === -1) return false;
    }
    return true;
  }

  // The whole row or tile around a link, so hiding it closes the gap
  // instead of leaving an empty slot.
  function containerFor(link) {
    var row = link;
    var parent = row.parentElement;
    while (parent && parent !== document.body && parent !== document.documentElement &&
           holdsOnly(parent, link)) {
      row = parent;
      parent = row.parentElement;
    }
    return row;
  }

  function hide(el) {
    if (!el.hasAttribute("data-fm-hidden")) el.setAttribute("data-fm-hidden", "");
  }

  function hideBlockedLinks() {
    var links = document.querySelectorAll("a[href]:not([data-fm-checked])");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      a.setAttribute("data-fm-checked", "1");
      if (isBlocked(a.href)) hide(containerFor(a));
    }
  }

  // ---- Homepage: hide the GMV graph -----------------------------------------

  // A real chart, not a small info icon next to the label.
  function holdsChart(box) {
    var graphics = box.querySelectorAll("svg, canvas");
    for (var i = 0; i < graphics.length; i++) {
      if (graphics[i].getBoundingClientRect().height >= 100) return true;
    }
    return false;
  }

  function hideGmvGraph() {
    var labels = document.querySelectorAll("body *");
    for (var i = 0; i < labels.length; i++) {
      var el = labels[i];
      if (el.children.length !== 0 || el.textContent.trim() !== "GMV") continue;
      if (el.closest("[data-fm-hidden]")) continue;
      // Walk up from the "GMV" label to the box that also holds the chart.
      var box = el.parentElement;
      while (box && box !== document.body && !holdsChart(box)) {
        box = box.parentElement;
      }
      // Safety: never hide something page-sized.
      if (!box || box === document.body || box.getBoundingClientRect().height > 700) continue;
      // Include plain wrappers around it so no empty gap is left.
      while (box.parentElement && box.parentElement !== document.body &&
             box.parentElement.children.length === 1) {
        box = box.parentElement;
      }
      hide(box);
    }
  }

  // ---- Homepage: mask dollar amounts ------------------------------------------

  var MONEY = /\$\s?\d[\d,]*(?:\.\d+)?\s?[KMB]?/g;
  var MASK = "$•••";

  function maskDollarAmounts() {
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (var t = walker.nextNode(); t; t = walker.nextNode()) {
      if (t.nodeValue.indexOf("$") === -1) continue;
      var masked = t.nodeValue.replace(MONEY, MASK);
      if (masked !== t.nodeValue) t.nodeValue = masked;
    }
  }

  // ---- Run --------------------------------------------------------------------

  var hideStyle = null;
  function update() {
    if (!hideStyle) {
      hideStyle = document.createElement("style");
      hideStyle.textContent = "[data-fm-hidden] { display: none !important; }";
      (document.head || document.documentElement).appendChild(hideStyle);
    }
    hideBlockedLinks();
    if (onHomepage()) {
      if (config.homepage.hideGmvGraph) hideGmvGraph();
      if (config.homepage.maskDollarAmounts) maskDollarAmounts();
    }
  }

  // 1. Full page loads (typing the address, bookmarks, logging in).
  check();

  // 2. In-app clicks: Seller Center changes pages without reloading, so
  //    watch for those navigations too.
  if (window.navigation && window.navigation.addEventListener) {
    window.navigation.addEventListener("navigate", function (e) {
      if (e.destination && isBlocked(e.destination.url)) {
        hidePage();
        check(e.destination.url);
      }
    });
  }

  // 3. Safety net in case a navigation slips past the above.
  setInterval(check, 300);

  // Re-apply whenever the page adds or changes content. MutationObserver
  // runs before the screen repaints, so hidden numbers never flash.
  var observer = new MutationObserver(update);
  function startObserving() {
    update();
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserving);
  } else {
    startObserving();
  }
})();
