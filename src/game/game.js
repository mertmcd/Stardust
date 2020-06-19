import assetManager from "./assetManager";
import phaserPlusPlus from "./ppp.js";

if (![true].last) {
    Object.defineProperty(Array.prototype, "last", {
        get: function () {
            return this[this.length - 1];
        },
        set: function (e) {
            this[this.length - 1] = e;
        },
    });
}

if (![true, true].pairs) {
    Object.defineProperty(Array.prototype, "pairs", {
        value: function (func) {
            for (let i = 0; i < this.length - 1; i++) {
                for (let j = i; j < this.length - 1; j++) {
                    func([this[i], this[j + 1]]);
                }
            }
        },
    }); 
}

if (![true].random) {
    Object.defineProperty(Array.prototype, "random", {
        get: function () {
            return this[Math.floor(Math.random() * this.length)];
        },
    });
}

let gameScene = {
      
    key: "game-scene",
    active: true,
    create: createGame,
    update: updateGame,
};
let uiScene = {
    key: "ui-scene",
    active: true,
    create: createUi,
};

let lastWidth, lastHeight, aspectRatio;
let currentWidth, currentHeight, squareness, isLandscape;
let currentTime, deltaTime;
let main, data;
let stars, bombs, player, platforms;

let gameData = {
    gameStarted: false
};

/** @type {Phaser.Scene} */
let scene;
/** @type {Phaser.Scene} */
let ui;

function createGame() {
    this.input.on("pointerdown", function () {
        main.interacted();
    });

    if (scene) {
        gameData.isRestarted = true;
        startGame.call(this);
        return;
    } else {
        gameData.isRestarted = false;
    }

    main = app.main;
    data = app.data;

    lastWidth = main.lastWidth;
    lastHeight = main.lastHeight;

    scene = this;
    scene.lastWidth = lastWidth;
    scene.lastHeight = lastHeight;

    assetManager.loadAssets.call(this, main, () => {
        phaserPlusPlus.upgradePhaser();
        startGame.bind(this)();
    });

    main.game.events.on("gameresized", function (w, h) {
        resizeAll(w, h);
    });

    main.game.events.on("postresized", function (w, h) { });

    main.game.events.on("gamecontinue", function (w, h) {
        if (data.soundEnabled) {
            if (app.type != "mobvista") {
                window.Howler && (window.Howler.mute(false));
            }
            main.game.soundOn = true;
        }
    });

    main.game.events.on("gamepaused", function (w, h) {
        if (data.soundEnabled) {
            if (app.type != "mobvista") {
                window.Howler && (window.Howler.mute(true));
            }
            main.game.soundOn = false;
        }
    });

    scene.add.text(0, 0, "", {
        fontFamily: "ui_font_1",
    });
}

function startGame() {

    if (data.soundEnabled) {
        if (app.type != "mobvista") app.playMusic();
        main.game.soundOn = true; 
    }

    // Code below here

    // Add static images

    let sky = this.add.image(0, 0, 'sky');

    sky.onResizeCallback = function (width, height) {

        let scale = Math.max(width / this.width, height / this.height);
        this.setScale(scale);
        this.y = height / 2;
        this.x = width / 2;
    }

    platforms = this.physics.add.staticGroup();

    let ground = platforms.create(0, 0, 'platform');

    ground.onResizeCallback = function (width, height) {

        let scale = width / this.width;

        if (isLandscape) {
            this.setScale(scale, scale * 0.6);
        } else {
            this.setScale(scale);
        }
        this.y = height - this.displayHeight / 2;
        this.x = width / 2;
        this.refreshBody();
    }
    let ground2 = platforms.create(0, 0, 'platform');

    ground2.onResizeCallback = function (width, height) {

        let scale = width / 3 / this.width;

        if (isLandscape) {
            this.setScale(scale, scale * 3 / 2);
            this.y = (height / 3 / 2) + height * 0.3;
        } else {
            this.setScale(scale, scale * 2);
            this.y = (height / 2) + height * 0.15;
        }
        this.x = this.displayWidth * 0.5;
        this.refreshBody();
    }

    let ground3 = platforms.create(0, 0, 'platform');

    ground3.onResizeCallback = function (width, height) {

        let scale = width / 3 / this.width;

        if (isLandscape) {
            this.setScale(scale, scale * 3 / 2);
            this.y = (height / 3 / 2) + height * 0.25; //
        } else {
            this.setScale(scale, scale * 2);
            this.y = (height / 2) + height * 0.1;
        }
        this.x = width - this.displayWidth * 0.5;
        this.refreshBody();
    }

    let ground4 = platforms.create(0, 0, 'platform');

    ground4.onResizeCallback = function (width, height) {

        let scale = width / 3 / this.width;

        if (isLandscape) {
            this.setScale(scale * 3 / 2, scale * 3 / 2);
            this.y = (height / 2) + height * 0.2;
        } else {
            this.setScale(scale * 3 / 2, scale * 2);
            this.y = (height / 2) + height * 0.3;
        }
        this.x = (width - this.displayWidth * 0.5);
        this.refreshBody();
    }

    sky.onResizeCallback = function (width, height) {

        let scale = Math.max(width / this.width, height / this.height);
        this.setScale(scale);
        this.y = height / 2;
        this.x = width / 2;
    }

    // Add kinematic player

    player = this.physics.add.sprite(0, 0, 'dude');

    player.onResizeCallback = function (width, height) {

        let scale = Math.min(width * 0.05 / this.width, height * 0.05 / this.height);

        if (isLandscape) {
            this.setScale(scale * 3 / 2);
        } else {
            this.setScale(scale);
        };
        this.y = height / 2;
        this.x = width / 2;
        //this.refreshBody();
    }

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    player.body.setGravityY(300);
    this.physics.add.collider(player, platforms);

    // Add star images

    let sampleStar = this.add.image(0, 0, 'star');
    sampleStar.setVisible(false);


    if (!isLandscape) {

        stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: sampleStar.displayWidth, y: 0, stepX: (lastWidth / 12 + sampleStar.displayWidth / 12) }
        });

    } else {

        stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: sampleStar.displayWidth, y: 0, stepX: (lastWidth / 12 + sampleStar.displayWidth / 12) }
        });
    }

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));

    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    // Add scoreboard

    let score = 0;
    let scoreText;

    scoreText = this.add.text(16, 16, 'Score: ', {fontSize: '48px', fill: '#000', fontWeight: 'bold' });
    // Add bomb images

    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    // Player events and bomb drop

    function collectStar(player, star) {
        star.disableBody(true, true);

        score += 10;
        scoreText.setText('score: ' + score);

        if (stars.countActive(true) === 0) {
            stars.children.iterate(function (child) {

                child.enableBody(true, child.x, 0, true, true);

            });

            let bombDropX = (player.x < currentWidth / 2) ? Phaser.Math.Between(currentWidth / 2, currentWidth) : Phaser.Math.Between(0, currentWidth / 2);

            let bomb = bombs.create(bombDropX, 0, 'bomb');
            bomb.setScale(3 / 2);
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-300, 300), Phaser.Math.Between(-300, 300)); // 

        }
    }

    function hitBomb(player, bomb) {

        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('dude_idle');
        let gameOver = true;
    }

    gameData.gameStarted = true;
}

function updateGame(time, delta) {
    currentTime = time;
    deltaTime = delta;

    // Update is called before start
    if (!gameData.gameStarted) return;

    let cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-260);

        player.anims.play('dude_left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(260);

        player.anims.play('dude_right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('dude_idle');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-560);
    }

    main.update();
}

function resizeAll(w, h) {
    lastWidth = w;
    lastHeight = h;

    scene.lastWidth = lastWidth;
    scene.lastHeight = lastHeight;

    currentWidth = w;
    currentHeight = h;

    scene.resizeWidth = w;
    scene.resizeHeight = h;
    ui.resizeWidth = w;
    ui.resizeHeight = h;

    aspectRatio = lastWidth / lastHeight;
    squareness = aspectRatio > 1 ? 1 / aspectRatio : aspectRatio;
    isLandscape = w > h;

    scene.aspectRatio = aspectRatio;
    scene.squareness = squareness;
    scene.isLandscape = isLandscape;
    ui.aspectRatio = aspectRatio;
    ui.squareness = squareness;
    ui.isLandscape = isLandscape;

    scene.resizeManager.resize(w, h);
    ui.resizeManager.resize(w, h);

    // Determine boundaires of the screen (portrait and landscape)

    scene.physics.world.setBounds(0, 0, currentWidth, currentHeight);
}

function createUi() {
    ui = this;
}

function initTimer(callback) {
    if (data.gameTimeEnabled) {
        scene.time.delayedCall(data.gameTime * 1000, () => {
            if (!data.gameFinished) {
                data.gameFinished = true;
                callback && callback();
            }
        });
    }
}

function initClickTracker(callback) {
    if (data.clickCounterEnabled) {
        data.clicked = 0;
        scene.input.on("pointerdown", () => {
            data.clicked++;
            if (data.clicked >= data.clickCount) {
                if (!data.gameFinished) {
                    data.gameFinished = true;
                    callback && callback();
                }
            }
        });
    }
}

function endGame() {
    scene.time.delayedCall(200, () => {
        if (data.endCardFullScreenClick) {
            scene.input.on("pointerdown", main.gotoLink);
        }
    });

    scene.time.delayedCall(2000, () => {
        if (data.goToMarketDirectly) {
            main.gotoLink();
        }
    });
}

export {
    gameScene,
    uiScene
};