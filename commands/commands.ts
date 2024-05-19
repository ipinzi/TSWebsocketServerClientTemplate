export interface IServerCommand {
    Execute(): void;
}

export class SomeCommand implements IServerCommand {
    public Execute(): void {
        console.log('Executing SomeCommand');
        // Your command logic here
    }
}