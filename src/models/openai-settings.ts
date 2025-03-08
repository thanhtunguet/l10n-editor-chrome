import {Field, Model} from 'react3l';

export class OpenAISettings extends Model {
  @Field(String)
  public baseUrl: string;

  @Field(String)
  public apiKey: string;

  @Field(String)
  public model: string;

  @Field(String)
  public systemPrompt: string;

  constructor(
    baseUrl: string,
    apiKey: string,
    model: string,
    systemPrompt: string,
  ) {
    super();
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
    this.systemPrompt = systemPrompt;
  }
}
