/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "a97ba18f10bbd101ab44257a4503c178"
  }, {
    "url": "pwa-512x512.png",
    "revision": "119fb253eb1a28027b50e2b292b74503"
  }, {
    "url": "pwa-192x192.png",
    "revision": "8a954c8ff0db5bc904702eaac9aab1d6"
  }, {
    "url": "index.html",
    "revision": "c3ea5b2d3bb1c8b8b98f271dc5020472"
  }, {
    "url": "icon.svg",
    "revision": "be800af3fadedac6906f21ebda15b6b5"
  }, {
    "url": "icon-maskable.svg",
    "revision": "e7b55a0d9525a8ea34740b8dd3458944"
  }, {
    "url": "favicon.ico",
    "revision": "c003099e40e0994a8dd6edfc4b1a7d7a"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "7ec8e7b5b89a89bd1fdbb31c2fafee42"
  }, {
    "url": "assets/web-B3kijInj.js",
    "revision": null
  }, {
    "url": "assets/school_sports_event_1795249139851-HA8hA32k.jpg",
    "revision": null
  }, {
    "url": "assets/school_science_lab_1795249139703-XS-8brU9.jpg",
    "revision": null
  }, {
    "url": "assets/school_computer_lab_1795249139475-CS-dtUbv.jpg",
    "revision": null
  }, {
    "url": "assets/react-RJ5L4koL.js",
    "revision": null
  }, {
    "url": "assets/index-Cz9B0u_r.js",
    "revision": null
  }, {
    "url": "assets/index-CKc0DVEU.css",
    "revision": null
  }, {
    "url": "assets/hero_school_campus_1795249139717-ZseLXjk7.jpg",
    "revision": null
  }, {
    "url": "assets/head_teacher_portrait_1795249139021-CsKhgLlK.jpg",
    "revision": null
  }, {
    "url": "assets/firebase-OaCt-tdW.js",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-26_003945_7d2bf270.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-25_143214_de23817f.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-23_231952_6407f1c7.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-23_214649_f03d9152.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-23_170317_c1779c87.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-23_162815_2011dd8d.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-22_223733_c79c1602.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-22_223726_c67ceb56.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-22_155855_dd3b5497.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-22_004316_28a0a22b.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-22_004301_91c6aaff.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-22_004226_fbb107a8.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-11-14_232651_e2dfdac2.png",
    "revision": null
  }, {
    "url": "assets/aistudio/RBMB_Digital_Campus_Dashboard_6b1da2d3.png",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "7ec8e7b5b89a89bd1fdbb31c2fafee42"
  }, {
    "url": "favicon.ico",
    "revision": "c003099e40e0994a8dd6edfc4b1a7d7a"
  }, {
    "url": "icon.svg",
    "revision": "be800af3fadedac6906f21ebda15b6b5"
  }, {
    "url": "pwa-192x192.png",
    "revision": "8a954c8ff0db5bc904702eaac9aab1d6"
  }, {
    "url": "pwa-512x512.png",
    "revision": "119fb253eb1a28027b50e2b292b74503"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "a97ba18f10bbd101ab44257a4503c178"
  }, {
    "url": "manifest.webmanifest",
    "revision": "e36d49d0193ca24428c4bf825185a7ee"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
