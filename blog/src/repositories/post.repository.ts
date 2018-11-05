import {DefaultCrudRepository, juggler, HasManyRepositoryFactory, repository, BelongsToAccessor} from '@loopback/repository';
import {Post, Category} from '../models';
import {CategoryRepository} from "./category.repository";
import {BlogDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';

export class PostRepository extends DefaultCrudRepository<
  Post,
  typeof Post.prototype.id
> {
    public readonly category: BelongsToAccessor<
        Category,
        typeof Post.prototype.id
        >;


    constructor(
    @inject('datasources.blog') dataSource: BlogDataSource,
    @repository.getter('CategoryRepository')
        categoryRepositoryGetter: Getter<CategoryRepository>,
  ) {
    super(Post, dataSource);
        this.category = this._createBelongsToAccessorFor(
            'categoryId',
            categoryRepositoryGetter,
        );
  }
}
