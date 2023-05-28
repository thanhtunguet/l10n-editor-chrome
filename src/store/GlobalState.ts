import type {DevopsServer} from 'src/models/devops-server';

export class GlobalState {
  editor: {
    supportedLocales: string[];
    resources: Record<string, Record<string, string>>;

    devopsServer?: DevopsServer;
    projectId?: string;
    repositoryId?: string;
    projectType?: 'flutter' | 'react';
  };

  devops: {
    servers: DevopsServer[];
  };
}
