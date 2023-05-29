import type {DevopsServer} from 'src/models/devops-server';
import type {ProjectType} from 'src/types/ProjectType';

export class GlobalState {
  editor: {
    supportedLocales: string[];
    resources: Record<string, Record<string, string>>;

    devopsServer?: DevopsServer;
    projectId?: string;
    repositoryId?: string;
    projectType?: ProjectType;
  };

  devops: {
    servers: DevopsServer[];
  };

  figma: {
    apiKey?: string;
  };
}
