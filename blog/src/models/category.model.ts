import {Entity, model, property, hasMany} from '@loopback/repository';
import {Post} from "./post.model";

@model()
export class Category extends Entity {
  @property({
    type: 'string',
      id: true,
      required: true,

  })
  title: string;

    @hasMany(() => Post)
    posts?: Post[];

  constructor(data?: Partial<Category>) {
    super(data);
  }
}
