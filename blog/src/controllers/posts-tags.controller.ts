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
import {PostsTags} from '../models';
import {PostsTagsRepository} from '../repositories';

export class PostsTagsController {
  constructor(
    @repository(PostsTagsRepository)
    public postsTagsRepository : PostsTagsRepository,
  ) {}

  @post('/posts-tags', {
    responses: {
      '200': {
        description: 'PostsTags model instance',
        content: {'application/json': {'x-ts-type': PostsTags}},
      },
    },
  })
  async create(@requestBody() postsTags: PostsTags): Promise<PostsTags> {
    return await this.postsTagsRepository.create(postsTags);
  }

  @get('/posts-tags/count', {
    responses: {
      '200': {
        description: 'PostsTags model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(PostsTags)) where?: Where,
  ): Promise<Count> {
    return await this.postsTagsRepository.count(where);
  }

  @get('/posts-tags', {
    responses: {
      '200': {
        description: 'Array of PostsTags model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': PostsTags}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(PostsTags)) filter?: Filter,
  ): Promise<PostsTags[]> {
    return await this.postsTagsRepository.find(filter);
  }

  @patch('/posts-tags', {
    responses: {
      '200': {
        description: 'PostsTags PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() postsTags: PostsTags,
    @param.query.object('where', getWhereSchemaFor(PostsTags)) where?: Where,
  ): Promise<Count> {
    return await this.postsTagsRepository.updateAll(postsTags, where);
  }

  @get('/posts-tags/{id}', {
    responses: {
      '200': {
        description: 'PostsTags model instance',
        content: {'application/json': {'x-ts-type': PostsTags}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<PostsTags> {
    return await this.postsTagsRepository.findById(id);
  }

  @patch('/posts-tags/{id}', {
    responses: {
      '204': {
        description: 'PostsTags PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() postsTags: PostsTags,
  ): Promise<void> {
    await this.postsTagsRepository.updateById(id, postsTags);
  }

  @del('/posts-tags/{id}', {
    responses: {
      '204': {
        description: 'PostsTags DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.postsTagsRepository.deleteById(id);
  }
}
