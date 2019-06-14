
// Audio fajlovi za igru i ponasanje pri pozivu odredjenih funkcija. (pobeda, poraz, match...). Kao i slike, audio fajlovi su uglavnom iz Hearthstone-a.
class AudioFiles {
    constructor() {
        this.bgMusic = new Audio('Assets/Audio/tabletop-battles.mp3');
        this.flipSound = new Audio('Assets/Audio/flip.wav');
        this.matchSound = new Audio('Assets/Audio/purchase_complete.ogg');
        this.victorySound = new Audio('Assets/Audio/Quest_Complete_Jingle.ogg');
        this.gameOverSound = new Audio('Assets/Audio/defeat_jingle.ogg');
        this.bgMusic.volume = 0.1;
        this.bgMusic.loop = true;
        this.matchSound.volume = 0.2;
        this.victorySound.volume = 0.2;
        this.gameOverSound.volume = 0.2;
    }
    startMusic() {
        this.bgMusic.play();
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    flip() {
        this.flipSound.play();
    }
    match() {
        this.matchSound.play();
    }
    victory() {
        this.stopMusic();
        this.victorySound.play();
    }
    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class MemoryGame {

    // konstruktor kome prosledjujemo vreme za igru i karte.
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining')
        this.ticker = document.getElementById('flips');
        this.AudioFiles = new AudioFiles();
    }
    // pocetak igre, funkcija koja se poziva kada se skine overlay, ili kada se dese victory ili gameover.
    startGame() {
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.cardToCheck = null;
        //prazan niz koji se puni kako budemo matchovali
        this.matchedCards = [];
        //da li igrac moze da okrece karte ili ne
        this.busy = true;
        // krece muzika, odbrojavanje i radi se shuffle po algoritmu.
        setTimeout(() => {
            this.AudioFiles.startMusic();
            this.shuffleCards(this.cardsArray);
            this.countdown = this.startCountdown();
            this.busy = false;
        }, 500)
        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.ticker.innerText = this.totalClicks;
    }
    // definisanje odbrojavanja, svaki sekund tajmer se smanjuje za 1sec, usput se proverava da li je tajmer pao do nule, ako jeste zove se gameOver.
    startCountdown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0)
                this.gameOver();
        }, 1000);
    }
    gameOver() {
        clearInterval(this.countdown);
        this.AudioFiles.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
    }
    victory() {
        clearInterval(this.countdown);
        this.AudioFiles.victory();
        document.getElementById('victory-text').classList.add('visible');
    }
    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }
    // ako moze da se okrene karta, dodajemo audio, povecavamo broj klikova, okrecemo kartu dodavajuci visible klasu karti.
    flipCard(card) {
        if(this.canFlipCard(card)) {
            this.AudioFiles.flip();
            this.totalClicks++;
            this.ticker.innerText = this.totalClicks;
            card.classList.add('visible');

            if(this.cardToCheck) {
                this.checkForCardMatch(card);
            } else {
                this.cardToCheck = card;
            }
        }
    }
    // provrava se da li se karte matchuju...
    checkForCardMatch(card) {
        if(this.getCardType(card) === this.getCardType(this.cardToCheck))
            this.cardMatch(card, this.cardToCheck);
        else 
            this.cardMismatch(card, this.cardToCheck);

        this.cardToCheck = null;
    }
    // ... ako se matchuju ubacuju se u prazan niz koji je ranije definisan. Takodje, proverava se da li su duzine niza karata i niza matchovanih karata iste - ako jesu zove se victory() i igra se zavrsava.
    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.AudioFiles.match();
        if(this.matchedCards.length === this.cardsArray.length)
            this.victory();
    }
    // sa druge strane, ako se karte nisu slozile, sklanja se visible klasa i karte se vracaju nazad na pozadinu - ali tek nakon 1 sekunde, da bi igrac imao vremena da proba da zapamti sta je bilo na karti.
    cardMismatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }
    shuffleCards(cardsArray) { // Fisher-Yates Shuffle Algorithm.
        for (let i = cardsArray.length - 1; i > 0; i--) {
            let randIndex = Math.floor(Math.random() * (i + 1));
            cardsArray[randIndex].style.order = i;
            cardsArray[i].style.order = randIndex;
        }
    }
    //cita se source za sliku - potrebno za matchovanje da vidimo da li je isti kada flipujemo dve karte.
    getCardType(card) {
        return card.getElementsByClassName('card-value')[0].src;
    }
    //uslov da li igrac moze da okrene kartu
    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }
}

// Ne pokretati program dok se ne ucita ceo HTML

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

// Pravi se niz iz HTML klasa koje presledjujemo. Pokrecemo igru sa limitom od 100 sekundi i prosledjujemo niz karata iz HTMLa

function ready() {
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    let game = new MemoryGame(100, cards);

// Dodajemo na overlay deo u HTMLu listener i skidamo klasu koja mu daje vidljivost, kada kliknemo na overlay. Nakon toga, treba da se pokrene igra sa StartGame.

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        });
    });
// na klik misa se karta okrece u skladu sa flipCard funkcijom.
    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    });
}


