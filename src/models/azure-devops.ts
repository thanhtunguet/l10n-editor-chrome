import {Field, Model, MomentField, ObjectField} from 'react3l';
import type {Moment} from 'moment';

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
  lastUpdateTime: Moment;
}

export class AzureRepo extends Model {
  @Field(String)
  id: string = '';

  @Field(String)
  name: string = '';

  @Field(String)
  url: string = '';

  @ObjectField(AzureProject)
  project: AzureProject;

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

export class GitObject extends Model {
  @Field(String)
  objectId: string = '';

  @Field(String)
  gitObjectType: string = 'blob'; // "blob", "tree"

  @Field(String)
  commitId: string = '';

  @Field(String)
  path: string = '';

  @Field(Boolean)
  isFolder: boolean = false;

  @Field(String)
  url: string = '';
}
