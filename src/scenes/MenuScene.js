export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Load background image or other assets
        this.load.image('background', '/assets/images/screenshot.jpg');
    }

    create() {
        // Add background image
        this.add.image(400, 300, 'background').setScale(1);

        // Add title text
        const titleText = this.add.text(400, 200, "PHASER'S REVENGE", {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5);

        // Add start instruction text
        const startText = this.add.text(400, 400, 'CLICK TO START', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
        }).setOrigin(0.5);

        // Add click interaction to start the game
        this.input.once('pointerdown', () => {
            this.scene.start('GameScene'); // Transition to GameScene
        });
    }
}
