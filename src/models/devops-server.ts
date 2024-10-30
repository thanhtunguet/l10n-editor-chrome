import {Field, Model} from 'react3l';

export class DevopsServer extends Model {
  @Field(Number)
  id!: number;

  @Field(String)
  name!: string;

  @Field(String)
  url!: string;
}
