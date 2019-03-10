import { Game } from './src/game';
import { KeyStateChange, KeyStateChanger } from './src/key_state_changer';

window.addEventListener('load', () => {
    var canvas = document.createElement('canvas');
    canvas.width = 1840;
    canvas.height = 640;
    var keyStateChanger = new KeyStateChanger();
    var game = new Game(canvas, keyStateChanger);

    var keyStream = new ReadableStream<KeyStateChange>({
        start: controller => {
            window.addEventListener('keydown', ev => controller.enqueue({ key: ev.key, newState: true }));
            window.addEventListener('keyup', ev => controller.enqueue({ key: ev.key, newState: false }));
        }
    });
    var reader = keyStream.getReader();
    var responder = (result: ReadableStreamReadResult<KeyStateChange>) => {
        if (result.value.newState) {
            keyStateChanger.down(result.value.key);
        } else {
            keyStateChanger.up(result.value.key);
        }
        reader.read().then(responder);        
    };
    reader.read().then(responder);

    document.body.appendChild(canvas);
    game.start();
});