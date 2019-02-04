export interface buttons {
    activate: boolean,
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean,
    menu: boolean,
    attack: boolean,
    inventory: boolean
}

export class ButtonHandler {
    public oButtons : buttons;
} 