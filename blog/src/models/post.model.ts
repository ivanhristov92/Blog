import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Category, PostsTags} from './';

@model()
export class Post extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
  })
  content?: string;


    @property({
        type: 'string',
    })
    featuredImage?: string;


    @property({
        type: 'string',
    })
    excerpt?: string;


    @property({
    type: 'number',
    id: true,
  })
  id?: number;


  @belongsTo(() => Category)
  categoryId: string;

  @hasMany(() => PostsTags)
  tags?: PostsTags[];

  constructor(data?: Partial<Post>) {
    super(data);
  }
}
