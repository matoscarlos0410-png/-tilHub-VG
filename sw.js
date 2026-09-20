const CACHE_NAME =
  "utilhub-v12-master-nova-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest"
];

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(cache =>
          cache.addAll(
            FILES_TO_CACHE
          )
        )
        .then(() =>
          self.skipWaiting()
        )

    );

  }
);

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()
        .then(keys =>

          Promise.all(

            keys
              .filter(
                key =>
                  key !== CACHE_NAME
              )
              .map(
                key =>
                  caches.delete(key)
              )

          )

        )
        .then(() =>
          self.clients.claim()
        )

    );

  }
);

self.addEventListener(
  "fetch",
  event => {

    if (
      event.request.method !==
      "GET"
    ) {
      return;
    }

    event.respondWith(

      caches
        .match(event.request)
        .then(cached => {

          if (cached) {
            return cached;
          }

          return fetch(
            event.request
          )

            .then(response => {

              if (
                response.ok &&
                response.type !==
                "opaque"
              ) {

                const copy =
                  response.clone();

                caches
                  .open(CACHE_NAME)
                  .then(cache =>
                    cache.put(
                      event.request,
                      copy
                    )
                  );

              }

              return response;

            })

            .catch(() =>
              caches.match(
                "./index.html"
              )
            );

        })

    );

  }
);
