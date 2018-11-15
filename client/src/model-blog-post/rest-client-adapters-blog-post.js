// @flow
import { pathOr, evolve } from "ramda";
import { normalize, schema } from "normalizr";
import type { NormalizedData } from "redux-manager-lib/crud-rest-api.flow";

/**
 * Raw Types - what the server provides
 */
type RawPost = {
  title: string,
  content: string,
  id: number,
  featuredImage: string,
  excerpt: string
};

/**
 * Adapted Types - what the app expects
 */
export type AdaptedPost = {
  title: string,
  content: SlateContent,
  excerpt: string,
  featuredImage: string,
  id: number | string
};
type SlateContent = Object;

export type AdaptedError = {
  error: Object,
  messages: { [fieldName: $Keys<AdaptedPost>]: Array<string> }
};

/**
 * Normalization Schemas
 */
const postSchema = new schema.Entity(
  "post",
  {},
  {
    processStrategy: (entity: RawPost, parent, key): AdaptedPost => {
      return {
        title: entity.title,
        content: JSON.parse(entity.content),
        id: entity.id,
        featuredImage: entity.featuredImage,
        excerpt: entity.excerpt
      };
    }
  }
);
const arrayOfPosts = [postSchema];

/**
 * Post Adapters
 */
const postAdapters = {
  stringifyContentOnly: evolve({ content: c => JSON.stringify(c) }),
  normalizeOne: (post: RawPost): NormalizedData<AdaptedPost> => {
    const normalizedData = normalize(post, postSchema);
    return normalizedData.entities.post;
  },
  normalizeMany: (posts: Array<RawPost>): NormalizedData<AdaptedPost> => {
    const normalizedData = normalize(posts, arrayOfPosts);
    return normalizedData.entities.post;
  }
};
export { postAdapters };

/**
 * Error Adapters
 */
export function adaptErrorForReact(error: Error): AdaptedError {
  let name = pathOr("", ["response", "body", "error", "name"], error);

  let messages;
  if (name === "PayloadTooLargeError") {
    messages = {
      "*": pathOr("", ["response", "body", "error", "message"], error)
    };
  } else {
    messages = pathOr(
      "",
      ["response", "body", "error", "details", "messages"],
      error
    );
  }

  return {
    error: error,
    messages
  };
}
