import { Game } from './src/game';

window.addEventListener('load', () => {
    var canvas = document.createElement('canvas');
    canvas.width = 1840;
    canvas.height = 640;
    var game = new Game(canvas);

    // var keyStream = new Event('key_input');
    // window.addEventListener('key_input', ev => {
    //     console.log('test');
    // });
    // window.dispatchEvent(keyStream);

    var s = new ReadableStream({
        start: controller => {
            window.setInterval(() => controller.enqueue('FUUUUK UUUU'), 1000);
        }
    });
    s.getReader().read().then(result => console.log(result.value));

    // var keyStream = new ReadableStream<string>({
    //     start(controller: ReadableStreamDefaultController<string>) {
    //         console.log('Created key stream. Attaching listener...');
    //         window.addEventListener('keydown', ev => {
    //             console.log('Key pressed');
    //             // const cameraMoveDelta = 0.1;
    //             // const lightMoveDelta = 0.5;

    //             controller.enqueue(ev.key);

    //             // // Camera movement
    //             // if (ev.key == 'w') game.moveCameraPosition(0, cameraMoveDelta);
    //             // if (ev.key == 's') game.moveCameraPosition(0, -cameraMoveDelta);
    //             // if (ev.key == 'a') game.moveCameraPosition(cameraMoveDelta, 0);
    //             // if (ev.key == 'd') game.moveCameraPosition(-cameraMoveDelta, 0);
        
    //             // // Light source movement
    //             // if (ev.key == 'ArrowUp')    game.moveLightPosition(0, -lightMoveDelta);
    //             // if (ev.key == 'ArrowDown')  game.moveLightPosition(0, lightMoveDelta);
    //             // if (ev.key == 'ArrowLeft')  game.moveLightPosition(-lightMoveDelta, 0);
    //             // if (ev.key == 'ArrowRight') game.moveLightPosition(lightMoveDelta, 0);
    //         });
    //     }
    // });
    // keyStream.getReader().read().then(result => {
    //     var key = <string>result.value;
    //     if (key) {
    //         alert(`Key received ${key}`);
    //     }
    // });
    document.body.appendChild(canvas);
    game.start();
});