import {DefaultCrudRepository, juggler, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {Category, Post} from '../models';
import {BlogDataSource} from '../datasources';
import {PostRepository} from './';
import {inject, Getter} from '@loopback/core';

export class CategoryRepository extends DefaultCrudRepository<
    Category,
  typeof Category.prototype.title
> {

    public readonly posts: HasManyRepositoryFactory<
        Post,
        typeof Category.prototype.title
        >;



  constructor(
    @inject('datasources.blog') dataSource: BlogDataSource,
    @repository.getter(PostRepository)
        getPostRepository: Getter<PostRepository>,
  ) {
    super(Category, dataSource);

      this.posts = this._createHasManyRepositoryFactoryFor(
          'posts',
          getPostRepository,
      );
  }
}
