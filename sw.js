const CACHE_NAME = "mandavoshka-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./menu.html",
    "./setup.html",
    "./game.html",
    "./settings.html",
    "./rules.html",
    "./bot.js",
    "./manifest.json",
    "./offline.html"
];

self.addEventListener(
    "install",
    event => {

        event.waitUntil(
            caches
                .open(CACHE_NAME)
                .then(
                    cache =>
                        cache.addAll(
                            FILES_TO_CACHE
                        )
                )
        );

        self.skipWaiting();
    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(
            caches
                .keys()
                .then(
                    keys =>
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
        );

        self.clients.claim();
    }
);


self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;

        /*
         * Для обычных запросов:
         * сначала используем кэш,
         * затем интернет.
         */
        event.respondWith(

            caches
                .match(request)
                .then(
                    cachedResponse => {

                        if(cachedResponse){

                            return cachedResponse;

                        }

                        return fetch(request);

                    }
                )
                .catch(
                    () => {

                        /*
                         * Если пользователь открывает
                         * страницу без интернета,
                         * вместо технической ошибки
                         * показываем нашу заглушку.
                         */
                        if(
                            request.mode ===
                            "navigate"
                        ){

                            return caches.match(
                                "./offline.html"
                            );

                        }

                        /*
                         * Для остальных ресурсов
                         * не подменяем ответ.
                         */
                        return Response.error();

                    }
                )

        );

    }
);
