import {Entity, model, property} from '@loopback/repository';
import {Post} from "./post.model";

@model()
export class PostsTags extends Entity {
  @property({
    type: 'number',
    required: true,
  })
  postId: number;

  @property({
    type: 'string',
    required: true,
  })
  tagId: string;

  @property({
      type: 'number',
      id: true,
      required: true,
  })
  id: number;


  constructor(data?: Partial<PostsTags>) {
    super(data);
  }
}
