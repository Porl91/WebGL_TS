import { Game } from './src/game';

window.addEventListener('load', () => {
    var canvas = document.createElement('canvas');
    canvas.width = 1840;
    canvas.height = 640;
        
    document.body.appendChild(canvas);
    new Game(canvas).start();
});