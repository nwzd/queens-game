import Phaser from 'phaser';
//import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js'; // Import the new GameScene

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1d212d',
    scene: [GameScene], // Include both scenes here
};

const game = new Phaser.Game(config);
