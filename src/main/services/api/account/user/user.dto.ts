export interface ModuleDTO {
    commit: string;
    repository: string;
    title: string;
    version: string;
}

export interface ServerDTO {
    module: ModuleDTO;
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
    communities: CommunityDTO[];
}
