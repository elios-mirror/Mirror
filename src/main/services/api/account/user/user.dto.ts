export interface ModuleDTO {
    commit: string;
    repository: string;
    title: string;
    version: string;
    name: string;
}

export interface ServerDTO {
    module: ModuleDTO;
    name: string;
}

export interface CommunityDTO {
    id: string;
    name: string;
    logo: string;
    servers: ServerDTO[];
}

export default interface UserDTO {
    email: string;
    name: string;
    id: string;
    confirmed: boolean;
    communities: CommunityDTO[];
}
