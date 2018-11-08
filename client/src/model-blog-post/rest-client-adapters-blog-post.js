import { pathOr } from "ramda";
import { normalize, schema } from "normalizr";

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

export function normalizeAndWrapOne(response) {
  const normalizedData = normalize(response.body, post);
  return { byId: normalizedData.entities.post };
}

export function normalizeAndWrapMany(response) {
  const normalizedData = normalize(response.body, arrayOfPosts);
  return { byId: normalizedData.entities.post };
}

/**
 * Error Adapter
 */
export function adaptErrorForReact(error) {
  if (
    pathOr("", ["response", "body", "error", "name"], error) ===
    "ValidationError"
  ) {
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
  return error;
}
