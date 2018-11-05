import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  del,
  requestBody,
} from '@loopback/rest';
import {Category, Post} from '../models';
import {CategoryRepository} from '../repositories';

export class CategoryPostsControllerController {
  constructor(
    @repository(CategoryRepository)
    public categoryRepository : CategoryRepository,
  ) {}


    @get('/categories/{id}/posts')
    async getRelatedPosts(
        @param.path.string('id') categoryId: typeof Category.prototype.title,
    ): Promise<Post[]> {
        return await this.categoryRepository.posts(categoryId).find();
    }
}
