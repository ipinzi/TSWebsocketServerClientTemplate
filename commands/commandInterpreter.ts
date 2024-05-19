import {IServerCommand, SomeCommand} from './commands';

export class CommandInterpreter {
    private commands: Map<string, IServerCommand>;

    constructor() {
        this.commands = new Map<string, IServerCommand>();

        // Load all commands here
        this.commands.set("JOIN_ROOM", new SomeCommand());
    }

    public interpret(cmd: string): void {
        const command = this.commands.get(cmd);
        if (command) {
            command.Execute();
        } else {
            console.log(`Command ${cmd} not found`);
        }
    }
}