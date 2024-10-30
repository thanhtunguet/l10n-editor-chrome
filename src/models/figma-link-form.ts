import {Field, Model} from 'react3l';

export class FigmaLinkForm extends Model {
  @Field(String)
  figmaLink: string = '';
}
