export interface KeyStateChange {
    key: string;
    newState: boolean
}

export class KeyStateChanger {
    private states: KeyStates;
    constructor() {
        this.states = {};
    }
    down(key: string) {
        this.states[key] = true;
    }
    up(key: string) {
        this.states[key] = false;
    }
    isDown(key: string) {
        return (this.states[key] == true);
    }
}

interface KeyStates {
    [key: string]: boolean;
}