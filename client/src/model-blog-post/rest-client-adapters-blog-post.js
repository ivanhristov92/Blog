// @flow
import { pathOr } from "ramda";
import { normalize, schema } from "normalizr";

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

export type AdaptedError = {
  error: Object,
  messages: { [fieldName: $Keys<AdaptedPost>]: Array<string> }
};

type SlateContent = Object;

/**
 * Normalization & Entry Adapter
 */
const post = new schema.Entity(
  "post",
  {},
  {
    // Optional. Just to show where data transformation
    // can be done
    processStrategy: (entity, parent, key) => {
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
const arrayOfPosts = [post];

export function normalizeAndWrapOne(response: { body: Array<any> }) {
  const normalizedData = normalize(response.body, post);
  return { byId: normalizedData.entities.post };
}

export function normalizeAndWrapMany(response: { body: any }) {
  const normalizedData = normalize(response.body, arrayOfPosts);
  return { byId: normalizedData.entities.post };
}

/**
 * Error Adapter
 */
export function adaptErrorForReact(error: Error): AdaptedError {
  let messages = pathOr(
    "",
    ["response", "body", "error", "details", "messages"],
    error
  );
  return {
    error: error,
    messages
  };
}
