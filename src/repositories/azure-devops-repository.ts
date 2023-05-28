import {Model, ObjectList, Repository} from 'react3l';
import {AzureProject, AzureRepo, GitObject} from 'src/models/azure-devops';
import type {Observable} from 'rxjs';
import {map} from 'rxjs';
import type {AxiosRequestConfig, AxiosResponse} from 'axios';
import type {DevopsServer} from 'src/models/devops-server';

class AzureProjectResponse extends Model {
  @ObjectList(AzureProject)
  value: AzureProject[];
}

class AzurerRepositoryResponse extends Model {
  @ObjectList(AzureRepo)
  value: AzureRepo[];
}

class AzureGitObjectResponse extends Model {
  @ObjectList(GitObject)
  value: GitObject[];
}

export class AzureDevopsRepository extends Repository {
  constructor(baseUrl: string) {
    super();
    this.baseURL = baseUrl;

    this.http.interceptors.request.use(this.requestInterceptor);
  }

  projects(): Observable<AzureProjectResponse> {
    return this.http
      .get('/_apis/projects')
      .pipe(
        Repository.responseMapToModel<AzureProjectResponse>(
          AzureProjectResponse,
        ),
      );
  }

  repositories(projectId: string): Observable<AzurerRepositoryResponse> {
    return this.http
      .get(`/${projectId}/_apis/git/repositories`)
      .pipe(
        Repository.responseMapToModel<AzurerRepositoryResponse>(
          AzurerRepositoryResponse,
        ),
      );
  }

  gitObjects(
    projectId: string,
    repositoryId: string,
  ): Observable<AzureGitObjectResponse> {
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
  }

  read = async (
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

  private async requestInterceptor(
    config: AxiosRequestConfig,
  ): Promise<AxiosRequestConfig> {
    config.params = Object.assign(config.params ?? {}, {
      'api-version': '6.0-preview',
    });
    return config;
  }

  getLatestCommitId(repositoryId: string): Observable<string> {
    return this.http.get(`/_apis/git/repositories/${repositoryId}/items`).pipe(
      Repository.responseMapToModel<AzureGitObjectResponse>(
        AzureGitObjectResponse,
      ),
      map((gitResponse) => gitResponse.value[0].commitId),
    );
  }

  updateFiles(
    repositoryId: string,
    latestCommitId: string,
    filesContents: Record<string, string>,
  ): Observable<void> {
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
  }
}
