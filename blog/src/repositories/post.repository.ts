import {DefaultCrudRepository, juggler, HasManyRepositoryFactory, repository, BelongsToAccessor} from '@loopback/repository';
import {Post, Category, PostsTags} from '../models';
import {CategoryRepository} from "./category.repository";
import {BlogDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {PostsTagsRepository} from "./posts-tags.repository";
import {AnyObject, Count, DataObject, Options} from "@loopback/repository/src/common-types";
import {Where} from "@loopback/repository/src/query";
import {ensurePromise} from "@loopback/repository";
import {EntityNotFoundError} from "@loopback/repository";

export class PostRepository extends DefaultCrudRepository<
  Post,
  typeof Post.prototype.id
> {
    public readonly category: BelongsToAccessor<
        Category,
        typeof Post.prototype.id
        >;


    public readonly tags: HasManyRepositoryFactory<
        PostsTags,
        typeof Post.prototype.id
        >;


    constructor(
    @inject('datasources.blog') dataSource: BlogDataSource,
    @repository.getter('CategoryRepository')
        categoryRepositoryGetter: Getter<CategoryRepository>,

    @repository.getter('PostsTagsRepository')
        postsTagsRepositoryGetter: Getter<PostsTagsRepository>,
      ) {
        super(Post, dataSource);
            this.category = this._createBelongsToAccessorFor(
                'categoryId',
                categoryRepositoryGetter,
            );

            this.tags = this._createHasManyRepositoryFactoryFor(
                'tags',
                postsTagsRepositoryGetter,
            );
      }

    updateAll(data: DataObject<Post>,
              where?: Where<Post>,
              options?: Options,): Promise<any>;

    async updateAll(
        data: DataObject<Post>,
        where?: Where<Post>,
        options?: Options,
    ): Promise<any> {
        where = where || {};
        //@ts-ignore
        if(!data.title.length ){
            //@ts-ignore
            return new TypeError("Title cannot be empty")
        }
        const result = await ensurePromise(
            this.modelClass.updateAll(where, data, options),
        );
        return {count: result && result.count};
    }


    async updateById(
        id: typeof Post.prototype.id,
        data: DataObject<Post>,
        options?: Options,
    ): Promise<void> {
        //@ts-ignore
        if(!data.title.length ){
            //@ts-ignore
            return new TypeError("Title cannot be empty")
        }

        const idProp = this.modelClass.definition.idName();
        const where = {} as Where<Post>;
        (where as AnyObject)[idProp] = id;
        const result = await this.updateAll(data, where, options);
        if (result.count === 0) {
            throw new EntityNotFoundError(this.entityClass, id);
        }
    }


}
