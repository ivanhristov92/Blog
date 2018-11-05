import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Category} from './category.model';

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
    type: 'number',
    id: true,
  })
  id?: number;


  @belongsTo(() => Category)
  categoryId: string;

  constructor(data?: Partial<Post>) {
    super(data);
  }
}
