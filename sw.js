const CACHE_NAME = "mandavoshka-v3";

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
                                        key !==
                                        CACHE_NAME
                                )
                                .map(
                                    key =>
                                        caches.delete(
                                            key
                                        )
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
         * Обычный запрос.
         * Сначала используем кэш.
         */
        event.respondWith(

            caches
                .match(
                    request
                )
                .then(
                    cachedResponse => {

                        if(
                            cachedResponse
                        ){

                            return cachedResponse;

                        }


                        /*
                         * Если файла нет в кэше,
                         * пробуем загрузить его из сети.
                         */
                        return fetch(
                            request
                        );

                    }
                )
                .catch(
                    () => {

                        /*
                         * Если сеть недоступна
                         * и это переход на страницу,
                         * показываем нашу заглушку.
                         */
                        if(
                            request.mode ===
                            "navigate"
                        ){

                            return caches.match(
                                new URL(
                                    "./offline.html",
                                    self.location
                                ).href
                            );

                        }


                        /*
                         * Остальные ресурсы
                         * не подменяем.
                         */
                        return Response.error();

                    }
                )

        );

    }
);
