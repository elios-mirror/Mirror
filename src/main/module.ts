export interface Module {

    readonly name: string;
    readonly version: string;

    init(): void;
}