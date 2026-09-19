// ========================================
// МАНДАВОШКА — ПЕРВЫЙ BOT
// ========================================

window.MandavoshkaBot={

    busy:false,
    pendingTurnChange:false,

onTurnChanged:function(){

if(this.busy){

    debugLog(
        "BOT_REENTRY_QUEUED",
        "currentPlayer=",
        window.MandavoshkaGameAPI.getCurrentPlayer()
    );

    this.pendingTurnChange=true;

    return;
}

debugLog(
    "BOT_TURN_CHANGED",
    "currentPlayer=",
    window.MandavoshkaGameAPI.getCurrentPlayer(),
    "fastForward=",
    window.MandavoshkaGameAPI.isFastForwardMode()
);

debugLog(
    "BOT_STATE",
    "busy=",
    this.busy,
    "chain=",
    window.MandavoshkaGameAPI.isBotChainSixTurn(),
    "botTurn=",
    window.MandavoshkaGameAPI.isBotTurn()
);

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

    const botPlayer=
    window.MandavoshkaGameAPI
    .getCurrentPlayer();

this.busy=true;

try{

        /*
         * Небольшая пауза перед ходом.
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
         * Выполняем оптимальные действия.
         */

        while(true){

            /*
             * Если за время выполнения хода
             * текущий игрок изменился —
             * этот startTurn() больше не должен
             * продолжать работу.
             */

            if(
                window.MandavoshkaGameAPI
                .getCurrentPlayer()!==botPlayer
            ){
                break;
            }

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
                !optimal ||
                !optimal.actions ||
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
             * Выбираем случайное действие
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
                
                if(
    window.MandavoshkaGameAPI
    .isTurnAwaitingConfirmation()
){
    break;
}

            await this.delay(450);
        }

        /*
         * Если ход ожидает подтверждения —
         * подтверждаем его.
         */

        if(
            window.MandavoshkaGameAPI
            .isTurnAwaitingConfirmation()
        ){

            window.MandavoshkaGameAPI
                .finishTurn();
        }

        /*
         * История действий бота
         * не должна быть доступна человеку.
         */

        window.MandavoshkaGameAPI
            .clearTurnHistory();

    }catch(error){

        console.error(
            "Ошибка BOT:",
            error
        );

    }finally{

    debugLog(
        "BOT_FINALLY",
        "currentPlayer=",
        window.MandavoshkaGameAPI.getCurrentPlayer(),
        "busy=",
        this.busy,
        "botTurn=",
        window.MandavoshkaGameAPI.isBotTurn(),
        "chain=",
        window.MandavoshkaGameAPI.isBotChainSixTurn(),
        "pending=",
        this.pendingTurnChange
    );
    
        debugLog(
        "PLAYERS_STATUS",
        Object.keys(players).map(
            key => ({
                color:key,
                finished:players[key].finished,
                place:players[key].place
            })
        )
    );

    this.busy=false;

    const needNextTurn=
        this.pendingTurnChange ||
        window.MandavoshkaGameAPI.isBotChainSixTurn() ||
        window.MandavoshkaGameAPI.isBotTurn();

    this.pendingTurnChange=false;

    if(needNextTurn){

        setTimeout(
            ()=>{
                this.onTurnChanged();
            },
            0
        );
    }
   } 
}, 
       
async startChainSixTurn(){

    if(this.busy)
        return;

    this.busy=true;

    try{
    
    const chainPlayer=
    window.MandavoshkaGameAPI
    .getCurrentPlayer();

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
    window.MandavoshkaGameAPI.isBotChainSixTurn() &&
    window.MandavoshkaGameAPI.getCurrentPlayer()===chainPlayer
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

    return new Promise(
        resolve=>{

            setTimeout(
                async ()=>{

                    if(
                        window.MandavoshkaGameAPI &&
                        window.MandavoshkaGameAPI
                            .isGamePaused()
                    ){

                        while(
                            window.MandavoshkaGameAPI
                            .isGamePaused()
                        ){

                            await new Promise(
                                resume=>{
                                    setTimeout(
                                        resume,
                                        100
                                    );
                                }
                            );

                        }

                    }

                    resolve();

                },

                window.MandavoshkaGameAPI &&
                window.MandavoshkaGameAPI
                    .isFastForwardMode()
                ?0
                :ms

            );

        }
    );
}
};

if(
    window.MandavoshkaGameAPI &&
    window.MandavoshkaGameAPI.getGamePhase() ===
    "playing"
){

    if(
        window.MandavoshkaGameAPI
            .getCurrentPlayer() !==
        window.MandavoshkaGameAPI
            .getHumanColor()
    ){

        setTimeout(
            ()=>{
                window.MandavoshkaBot
                    .onTurnChanged();
            },
            0
        );

    }

}