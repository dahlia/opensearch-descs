"use strict";
import {
  Parser,
  HtmlRenderer,
} from "https://cdn.skypack.dev/commonmark@0.30.0";

async function loadList() {
  const prefetchLink =
    document.querySelector("link[rel=prefetch][type='application/json']");
  const dataHref = prefetchLink.href;
  const response = await fetch(dataHref);
  const data = await response.json();
  const list = Object.entries(data)
    .map(([title, href]) => ({ title, href: new URL(href, dataHref).href }));
  return list;
}

function createLinkElement(tag, { title, href }) {
  const el = document.createElement(tag);
  el.rel = "search";
  el.type = "application/opensearchdescription+xml";
  el.href = href;
  el.title = title;
  if (el.tagName == "A") el.innerText = title;
  return el;
}

let ul;
function addLinkElements(link) {
  document.head.appendChild(createLinkElement("link", link));
  const li = document.createElement("li");
  li.appendChild(createLinkElement("a", link));
  ul ??= document.querySelector("ul#list");
  ul.appendChild(li);
}

async function renderList() {
  const list = await loadList();
  for (const link of list) {
    addLinkElements(link);
  }
}

async function loadReadme() {
  const prefetchLink =
    document.querySelector("link[rel=prefetch][type^='text/markdown']");
  const dataHref = prefetchLink.href;
  const response = await fetch(dataHref);
  return await response.text();
}

async function renderReadme() {
  const text = await loadReadme();
  const parser = new Parser();
  const tree = parser.parse(text);
  const renderer = new HtmlRenderer();
  const html = renderer.render(tree);
  const readmeEl = document.getElementById("readme");
  readmeEl.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    renderReadme(),
    renderList()
  ]);
});

// <link href="https://ctext.org/searchxml.pl?type=dic&amp;if=gb&amp;remap=" rel="search" type="application/opensearchdescription+xml" title="中國哲學書電子化計劃（辭典）">
