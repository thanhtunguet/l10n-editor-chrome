import {Field, Model} from 'react3l';

export class FigmaConfig extends Model {
  @Field(String)
  figmaApiKey: string;
}
