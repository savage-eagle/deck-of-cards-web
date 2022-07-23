const startGame = $("#start-game");
const drawCardAction = $("#draw-card-action");
const gameContainer = $("#game-container");
const playerA_CardsContainer = $("#player-cards-a");
const playerB_CardsContainer = $("#player-cards-b");
const resumeGameAction = $("#resume-game-action");
const allCards = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING', 'ACE'];

class DeckCards {
    constructor() {
        this.playerA = {};
        this.playerB = {};
    }

    async init() {
        document.getElementById('start-game').addEventListener('click', async () => {
            await this.startGame();
            
            startGame.hide();
            drawCardAction.show();
            gameContainer.show();
        })

        document.getElementById('draw-card-action').addEventListener('click', async () => {
            drawCardAction.attr("disabled", true); // Prevent multiple clicks
            await this.drawCardAction();
            drawCardAction.attr("disabled", false);
        })

        document.getElementById('resume-game-action').addEventListener('click', async () => {
            startGame.show();
            
            drawCardAction.hide();

            playerA_CardsContainer.empty();
            playerB_CardsContainer.empty();
            gameContainer.hide();
            resumeGameAction.hide();

            this.resumeGame();
        })
    }

    async startGame() {
        this.playerA = {
            'deck_id': await this.generateDeck(),
            'cards': [],
            'total': 0,
        }

        this.playerB = {
            'deck_id': await this.generateDeck(),
            'cards': [],
            'total': 0,
        }

        console.log("Player A - DeckID: " + this.playerA.deck_id);
        console.log("Player B - DeckID: " + this.playerB.deck_id);
    }

    async generateDeck() {
        const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle');
        const result = await response.json();

        return result.deck_id;
    }

    async drawCardAction() {
        let playerA_Card = await this.drawCard(this.playerA.deck_id);
        if (! playerA_Card) {
            resumeGameAction.show();
            drawCardAction.hide();
            
            return;
        }

        this.playerA['cards'].push(playerA_Card);
        playerA_CardsContainer.append($('<img />').attr('src', playerA_Card.image));

        let playerB_Card = await this.drawCard(this.playerB.deck_id);
        this.playerB['cards'].push(playerB_Card);
        playerB_CardsContainer.append($('<img />').attr('src', playerB_Card.image));

        this.checkWinner(playerA_Card.value, playerB_Card.value);
    }

    resumeGame() {
        this.playerA = {};
        this.playerB = {};

        $('#player-a-score').text(0);
        $('#player-b-score').text(0);
    }

    async drawCard(deckId) {
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
        const result = await response.json();

        let card = result['cards'][0];
        if (! card) {
            return null;
        }

        return {
            'image': card.image,
            'code': card.code,
            'value': card.value,
        }
    }

    async checkWinner(playerA_Card, playerB_Card) {
        let playerA_CardValue = allCards.indexOf(playerA_Card); 
        let playerB_CardValue = allCards.indexOf(playerB_Card);
        if (playerA_CardValue > playerB_CardValue) {
            console.log("Player A Wins");

            this.playerA['total'] += 1;
            $('#player-a-score').text(this.playerA['total']);
        } else if (playerB_CardValue > playerA_CardValue) {
            console.log("Player B Wins");

            this.playerB['total'] += 1;
            $('#player-b-score').text(this.playerB['total']);
        } else {
            console.log("Draw");
        }
    }
}

async function main() {
    const deckCards = new DeckCards();
    await deckCards.init();
}

main();
