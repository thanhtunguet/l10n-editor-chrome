import {Field, Model} from 'react3l';

export class LocalizationRecord extends Model {
  @Field(String)
  key!: string;

  @Field(String)
  vi!: string;

  @Field(String)
  en!: string;
}
