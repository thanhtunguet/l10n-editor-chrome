import {Field, Model} from 'react3l';

export class ExtensionSettings extends Model {
  @Field(String)
  figmaApiKey: string = '';

  @Field(String)
  reactPath: string = '';

  @Field(String)
  flutterPath: string = '';
}
