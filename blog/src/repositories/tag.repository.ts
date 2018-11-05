import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Tag} from '../models';
import {BlogDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class TagRepository extends DefaultCrudRepository<
  Tag,
  typeof Tag.prototype.title
> {
  constructor(
    @inject('datasources.blog') dataSource: BlogDataSource,
  ) {
    super(Tag, dataSource);
  }
}
