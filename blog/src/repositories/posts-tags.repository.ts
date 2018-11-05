import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {PostsTags} from '../models';
import {BlogDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class PostsTagsRepository extends DefaultCrudRepository<
  PostsTags,
  typeof PostsTags.prototype.id
> {
  constructor(
    @inject('datasources.blog') dataSource: BlogDataSource,
  ) {
    super(PostsTags, dataSource);
  }
}
