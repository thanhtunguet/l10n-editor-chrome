import type {AxiosRequestConfig} from 'axios';
import {Model, ObjectList, Repository} from 'react3l';
import type {Observable} from 'rxjs';
import {map} from 'rxjs';
import {AzureProject, AzureRepo, GitObject} from 'src/models/azure-devops';
import type {DevopsServer} from 'src/models/devops-server';

class AzureProjectResponse extends Model {
  @ObjectList(AzureProject)
  public value: AzureProject[] = [];
}

class AzurerRepositoryResponse extends Model {
  @ObjectList(AzureRepo)
  public value: AzureRepo[] = [];
}

class AzureGitObjectResponse extends Model {
  @ObjectList(GitObject)
  public value: GitObject[] = [];
}

const requestInterceptor = async (
  config: AxiosRequestConfig,
): Promise<AxiosRequestConfig> => {
  config.params = Object.assign(config.params ?? {}, {
    'api-version': '6.0-preview',
  });
  return config;
};

export class AzureDevopsRepository extends Repository {
  public constructor(url: string) {
    super();
    this.baseURL = url;
    this.http.interceptors.request.use(requestInterceptor);
  }

  public readonly projects = (): Observable<AzureProjectResponse> => {
    return this.http
      .get('/_apis/projects')
      .pipe(
        Repository.responseMapToModel<AzureProjectResponse>(
          AzureProjectResponse,
        ),
      );
  };

  public readonly repositories = (
    projectId: string,
  ): Observable<AzurerRepositoryResponse> => {
    return this.http
      .get(`/${projectId}/_apis/git/repositories`)
      .pipe(
        Repository.responseMapToModel<AzurerRepositoryResponse>(
          AzurerRepositoryResponse,
        ),
      );
  };

  public readonly gitObjects = (
    projectId: string,
    repositoryId: string,
  ): Observable<AzureGitObjectResponse> => {
    return this.http
      .get(`/${projectId}/_apis/git/repositories/${repositoryId}/items`, {
        params: {
          recursionLevel: 'Full',
        },
      })
      .pipe(
        Repository.responseMapToModel<AzureGitObjectResponse>(
          AzureGitObjectResponse,
        ),
      );
  };

  public readonly read = async (
    devopsServer: DevopsServer,
    projectId: string,
    repositoryId: string,
    gitObject: GitObject,
  ): Promise<Record<string, string>> => {
    const response = await fetch(
      `${devopsServer.url}/${projectId}/_apis/git/repositories/${repositoryId}/blobs/${gitObject.objectId}`,
      {
        method: 'GET',
      },
    );
    return response.json();
  };

  public readonly getLatestCommitId = (
    repositoryId: string,
  ): Observable<string> => {
    return this.http.get(`/_apis/git/repositories/${repositoryId}/items`).pipe(
      Repository.responseMapToModel<AzureGitObjectResponse>(
        AzureGitObjectResponse,
      ),
      map((gitResponse) => gitResponse.value[0].commitId),
    );
  };

  public readonly updateFiles = (
    repositoryId: string,
    latestCommitId: string,
    filesContents: Record<string, string>,
  ): Observable<void> => {
    const changes = Object.entries(filesContents).map(([key, value]) => {
      return {
        changeType: 2,
        item: {
          path: key,
        },
        newContent: {
          contentType: 0,
          content: value,
        },
      };
    });
    return this.http
      .post(`/_apis/git/repositories/${repositoryId}/pushes`, {
        commits: [
          {
            changes: changes,
            comment: 'Update locales for project using tool',
          },
        ],
        refUpdates: [
          {
            name: 'refs/heads/main',
            oldObjectId: latestCommitId,
          },
        ],
      })
      .pipe(Repository.responseDataMapper<void>());
  };
}
