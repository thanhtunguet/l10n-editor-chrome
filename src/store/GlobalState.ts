import type {DevopsServer} from 'src/models/devops-server';

export class GlobalState {
  editor: {
    supportedLocales: string[];
    resources: Record<string, Record<string, string>>;
  };

  devops: {
    servers: DevopsServer[];
  };
}
