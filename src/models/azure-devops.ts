import type {Moment} from 'moment';
import {Field, Model, MomentField, ObjectField} from 'react3l';

export class AzureProject extends Model {
  @Field(String)
  id: string = '';

  @Field(String)
  name: string = '';

  @Field(String)
  url: string = '';

  @Field(String)
  state: string = '';

  @Field(Number)
  revision: number = 0;

  @Field(String)
  visibility: string = '';

  @MomentField()
  lastUpdateTime!: Moment;
}

export class AzureRepo extends Model {
  @Field(String)
  id: string = '';

  @Field(String)
  name: string = '';

  @Field(String)
  url: string = '';

  @ObjectField(AzureProject)
  project: AzureProject = new AzureProject();

  @Field(String)
  defaultBranch: string = '';

  @Field(Number)
  size: number = 0;

  @Field(String)
  remoteUrl: string = '';

  @Field(String)
  sshUrl: string = '';

  @Field(String)
  webUrl: string = '';
}

export enum GitObjectType {
  Blob = 'blob',
  Tree = 'tree',
}

export class GitObject extends Model {
  @Field(String)
  objectId: string = '';

  @Field(String)
  gitObjectType: GitObjectType = GitObjectType.Blob;

  @Field(String)
  commitId: string = '';

  @Field(String)
  path: string = '';

  @Field(Boolean)
  isFolder: boolean = false;

  @Field(String)
  url: string = '';
}
