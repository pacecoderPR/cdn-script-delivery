// ==UserScript==
// @name         Kray Header Loader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @match        https://www.casterconcepts.com/*
// @run-at       document-start
// @grant        none
// @require      https://cdn.jsdelivr.net/gh/pacecoderPR/cdn-script-delivery/javascript/header/client_header.js
// @description  Initializing Header
// ==/UserScript==

(function () {


    document.addEventListener("DOMContentLoaded", () => {
    const headerNew = document.querySelector(".header-new");
    if (!headerNew) return;

    // Get ONLY the first child inside header-new
    const firstRow = headerNew.querySelector(":scope > .row:nth-child(1)");
    if (firstRow) {
        firstRow.style.display = "none";
        firstRow.style.visibility = "hidden";
    }

    // To be sure the second child stays visible:
    const secondRow = headerNew.querySelector(":scope > .row:nth-child(2)");
    if (secondRow) {
        secondRow.style.display = "";
        secondRow.style.visibility = "visible";
    }
        // Insert placeholder early
    const container = document.createElement("div");
    container.id = "kray-header";
    (document.body || document.documentElement).prepend(container);
        window.KrayHeaderInit?.();
    });
})();
