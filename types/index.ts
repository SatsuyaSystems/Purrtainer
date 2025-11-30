export interface Endpoint {
    Id: number;
    Name: string;
    Type: number; // 1 = Docker, 2 = Agent, etc.
    URL: string;
    GroupId: number;
    PublicURL: string;
    Status: number; // 1 = Up, 2 = Down
    Snapshots: any[];
    // Add other fields as needed from the API docs
}

export interface Container {
    Id: string;
    Names: string[];
    Image: string;
    ImageID: string;
    Command: string;
    Created: number;
    Ports: any[];
    Labels: any;
    State: string; // e.g., "running", "exited"
    Status: string; // e.g., "Up 2 hours"
    HostConfig: any;
    NetworkSettings: any;
    Mounts: any[];
}

export interface Stack {
    Id: number;
    Name: string;
    Type: number; // 1 = Compose, 2 = Swarm
    EndpointId: number;
    SwarmId: string;
    Status: number; // 1 = Active, 2 = Inactive
    CreationDate: number;
    CreatedBy: string;
    UpdateDate: number;
    UpdatedBy: string;
    // Add other fields as needed
}
