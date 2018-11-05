import {Entity, model, property, hasMany} from '@loopback/repository';
import {PostsTags} from "./";

@model()
export class Tag extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  title: string;

  @hasMany(() => PostsTags)
  tags?: PostsTags[];

  constructor(data?: Partial<Tag>) {
    super(data);
  }
}
