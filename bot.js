// ========================================
// МАНДАВОШКА — ПЕРВЫЙ BOT
// ========================================

window.MandavoshkaBot={

    busy:false,

onTurnChanged:function(){

    if(this.busy)
        return;

    if(
        !window.MandavoshkaGameAPI
    )
        return;
        
            /*
     * Сначала проверяем цепную шестёрку.
     */
    if(
        window.MandavoshkaGameAPI
        .isBotChainSixTurn()
    ){

        this.startChainSixTurn();

        return;
    }

    /*
     * Сначала проверяем жеребьёвку.
     */
    if(
        window.MandavoshkaGameAPI
        .isBotDeterminingTurn()
    ){

        this.startDeterminingRoll();

        return;
    }

    /*
     * Затем обычный игровой ход.
     */
    if(
    window.MandavoshkaGameAPI
    .isBotTurn()
){

    this.startTurn();

    return;
}
},

async startDeterminingRoll(){

    if(this.busy)
        return;

    this.busy=true;

    try{

        /*
         * Небольшая пауза,
         * чтобы бот не бросал мгновенно.
         */
        await this.delay(700);

        if(
            !window.MandavoshkaGameAPI
            .isBotDeterminingTurn()
        ){
            return;
        }

        /*
         * Во время жеребьёвки
         * обычный rollDice() сам понимает,
         * что gamePhase === "determining",
         * и бросает один кубик.
         */
        window.MandavoshkaGameAPI.rollDice();

    }catch(error){

        console.error(
            "Ошибка BOT при жеребьёвке:",
            error
        );

}finally{

    this.busy=false;

    /*
     * После завершения броска жеребьёвки
     * следующий игрок уже мог стать активным.
     *
     * Проверяем и жеребьёвку, и обычную игру.
     */
    if(
        window.MandavoshkaGameAPI &&
        (
            window.MandavoshkaGameAPI
                .isBotDeterminingTurn() ||
            window.MandavoshkaGameAPI
                .isBotTurn()
        )
    ){

        this.onTurnChanged();
    }
}
},

    async startTurn(){

        if(this.busy)
            return;

        this.busy=true;

        try{

            /*
             * Небольшая пауза,
             * чтобы переход хода выглядел естественно.
             */

            await this.delay(500);

            if(
                !window.MandavoshkaGameAPI.isBotTurn()
            )
                return;

            /*
             * Бросаем кубики.
             */

            window.MandavoshkaGameAPI.rollDice();

            await this.delay(700);

            /*
             * Выполняем действия,
             * пока существуют оптимальные варианты.
             */

            while(true){

                if(
                    !window.MandavoshkaGameAPI.isBotTurn()
                ){
                    break;
                }

                if(
                    !window.MandavoshkaGameAPI.isDiceRolled()
                ){
                    break;
                }

                if(
                    !window.MandavoshkaGameAPI.hasRemainingDice()
                ){
                    break;
                }

                const optimal=
                    window.MandavoshkaGameAPI
                    .getOptimalActions();

                if(
    !optimal||
    !optimal.actions||
    optimal.actions.length===0
){

    await this.delay(400);

    if(
        window.MandavoshkaGameAPI.isBotTurn()
    ){

        window.MandavoshkaGameAPI
            .skipTurn();
    }

    break;
}

                /*
                 * Пока выбираем случайный вариант
                 * из всех разрешённых оптимальных.
                 */

                const index=
                    Math.floor(
                        Math.random()*
                        optimal.actions.length
                    );

                const selected=
                    optimal.actions[index];

                await this.delay(450);

                await window.MandavoshkaGameAPI
                    .executeAction(
                        selected
                    );

                await this.delay(450);
            }

            /*
             * Если кубики использованы,
             * а движок уже ждёт подтверждения,
             * подтверждаем ход автоматически.
             */

            if(
                window.MandavoshkaGameAPI
                .isTurnAwaitingConfirmation()
            ){

                window.MandavoshkaGameAPI
                    .finishTurn();
            }
/*
 * Ход бота окончательно завершён.
 * История его действий не должна
 * становиться доступной человеку.
 */
window.MandavoshkaGameAPI
    .clearTurnHistory();
    
        }catch(error){

            console.error(
                "Ошибка BOT:",
                error
            );

      }finally{

    this.busy=false;

    /*
     * Пока бот завершал свой ход,
     * очередь могла перейти к другому боту.
     *
     * После освобождения проверяем очередь ещё раз.
     */
    if(
        window.MandavoshkaGameAPI &&
        window.MandavoshkaGameAPI.isBotTurn()
    ){

        this.onTurnChanged();
    }
}
},

async startChainSixTurn(){

    if(this.busy)
        return;

    this.busy=true;

    try{

        await this.delay(500);


        if(
            !window.MandavoshkaGameAPI
            .isBotChainSixTurn()
        ){

            return;
        }


        /*
         * Цепная шестёрка уже подготовлена
         * движком.
         *
         * Получаем доступные действия.
         */
        const actions=
            window.MandavoshkaGameAPI
            .getChainSixActions();


        if(
            !actions||
            actions.length===0
        ){

            return;
        }


        /*
         * Пока есть шестёрки —
         * выполняем их последовательно.
         */
        while(
            window.MandavoshkaGameAPI
            .isBotChainSixTurn()
        ){

            const available=
                window.MandavoshkaGameAPI
                .getChainSixActions();


            if(
                !available||
                available.length===0
            ){

                break;
            }


            const index=
                Math.floor(
                    Math.random()*
                    available.length
                );


            const selected=
                available[index];


            await this.delay(450);


            await window.MandavoshkaGameAPI
                .executeChainSixAction(
                    selected
                );


            await this.delay(450);
        }


    }catch(error){

        console.error(
            "Ошибка BOT при цепной шестёрке:",
            error
        );

    }finally{

        this.busy=false;


        /*
         * После цепной шестёрки
         * мог сразу наступить обычный
         * ход другого бота.
         */
        if(
            window.MandavoshkaGameAPI &&
            (
                window.MandavoshkaGameAPI
                    .isBotChainSixTurn() ||

                window.MandavoshkaGameAPI
                    .isBotTurn()
            )
        ){

            this.onTurnChanged();
        }
    }
},

    delay:function(ms){

    if(
        window.MandavoshkaGameAPI &&
        window.MandavoshkaGameAPI.isFastForwardMode()
    ){

        return Promise.resolve();

    }

    return new Promise(
        resolve=>
            setTimeout(
                resolve,
                ms
            )
    );
}
};