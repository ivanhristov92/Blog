import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './blog.datasource.json';

export class BlogDataSource extends juggler.DataSource {
  static dataSourceName = 'blog';

  constructor(
    @inject('datasources.config.blog', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
