// 2Dベクトルクラス
const Vector = class {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    clone() {
        return new Vector(this.x, this.y);
    }
    /**
     * @param {Vector} v
     */
    plus(v) {
        this.x += v.x;
        this.y += v.y;
    }
    /**
     * @param {number} s
     */
    multiple(s) {
        this.x *= s;
        this.y *= s;
    }
}

// ゲームクラス
const Game = class {
    constructor(canvas, context, character) {
        this.canvas = canvas;
        this.context = context;
        this.character = character;
    }
    update() { }
    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.character.draw(this.context);
    }
};

// 操作可能なキャラクタークラス
const Character = class {
    constructor(position, speed, animation) {
        this.position = position;
        this.speed = speed;
        this.animation = animation;

        window.addEventListener("keydown", (e) => {
            const v = new Vector(0, 0);
            switch (e.code) {
                case 'KeyA':
                    v.plus(new Vector(-1, 0));
                    this.animation.turn('Left');
                    break;
                case 'KeyD':
                    v.plus(new Vector(1, 0));
                    this.animation.turn('Right');
                    break;
                case 'KeyW':
                    v.plus(new Vector(0, -1));
                    this.animation.turn('Up');
                    break;
                case 'KeyS':
                    v.plus(new Vector(0, 1));
                    this.animation.turn('Down');
                    break;
            }
            // 画像を1コマ進める
            this.animation.walk();
            // 移動
            v.multiple(this.speed);
            this.position.plus(v);
        });
    }
    draw(context) {
        context.drawImage(this.animation.currentImage, this.position.x, this.position.y);
    }
};

// キャラクターのアニメーション管理クラス
const CharacterAnimation = class {
    constructor(downs, lefts, rights, ups) {
        this.images = { 'Down': downs, 'Left': lefts, 'Right': rights, 'Up': ups };
        this.currentDirection = 'Down';
        this.currentIndex = 0;
        this.currentImage = null;

        this.update();
    }
    // 方向転換
    turn(direction) {
        this.currentDirection = direction;
        this.update();
    }
    // 1コマ進める
    walk() {
        this.currentIndex++;
        this.update()
    }
    // 現在の方向コマ数で画像を更新
    update() {
        const currentImages = this.images[this.currentDirection];
        this.currentImage = currentImages[this.currentIndex % currentImages.length];
    }
};


// 画像非同期読み込み
const loadImage = source => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = source;
        image.onload = () => resolve(image);
    });
};
// 全画像非同期読み込み
const loadImageAll = sources => Promise.all(sources.map(loadImage));


// ゲームループ
const update = () => {
    game.update();
    game.draw();
    window.requestAnimationFrame(update);
}

// ゲームインスタンス
let game;


window.onload = async () => {
    // canvas準備
    canvas = document.getElementById("main-canvas");
    context = canvas.getContext("2d");

    // 画像読み込み
    const images = await loadImageAll(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            .map(i => `https://asset.neecbox.net/image/char/walk/1/walk${i}.png`)
    );
    // キャラクターアニメーション構築
    const charaAnim = new CharacterAnimation(
        // ↓アニメーション
        [1, 0, 1, 2].map(i => images[i]),
        // ←アニメーション
        [4, 3, 4, 5].map(i => images[i]),
        // →アニメーション
        [7, 6, 7, 8].map(i => images[i]),
        // ↑アニメーション
        [10, 9, 10, 11].map(i => images[i])
    );
    // 読み込んだ画像でキャラクタークラス準備
    chara = new Character(new Vector(280, 200), 8, charaAnim)

    // ゲームクラス準備
    game = new Game(canvas, context, chara);

    // ループ開始
    update();
};
