// @flow
import superagent from "superagent";
import * as _ from "ramda";
import type {
  RMLRestClient,
  RMLCreate,
  RMLRead,
  RMLUpdate,
  RMLDelete
} from "redux-manager-lib/crud-rest-api.flow";
import * as adapters from "./rest-client-adapters-blog-post";

export type AdaptedPostWithoutId = {
  title: string,
  content: SlateContent,
  excerpt: string,
  featuredImage: string
};

export type AdaptedPost = {
  id: number | string
} & AdaptedPostWithoutId;

type AdaptedPostId = $PropertyType<AdaptedPost, "id">;
type SlateContent = Object;

/**
 * Client Instance Type
 * ====================
 *
 * RMLCreate<ExpectsPayload, EntryShape, ErrorShape>
 * RMLRead<ExpectsPayload, EntryShape, ErrorShape>
 * RMLUpdate<ExpectsPayload, EntryShape, ErrorShape>
 * RMLDelete<ExpectsPayload, IdType, ErrorShape>
 */
type RestClientInstance = {
  create: RMLCreate<AdaptedPostWithoutId, AdaptedPost, Error>,
  read: RMLRead<?AdaptedPostId, AdaptedPost, Error>,
  update: RMLUpdate<AdaptedPost | Array<AdaptedPost>, AdaptedPost, Error>,
  delete: RMLDelete<AdaptedPostId | Array<AdaptedPostId>, AdaptedPostId, Error>
};

const ROOT = "http://localhost:3000";

/**
 * Creating
 */
const create = function create(payload) {
  return superagent
    .post(ROOT + "/posts")
    .send(payload)
    .then(adapters.normalizeAndWrapOne)
    .catch(
      _.pipe(
        adapters.adaptErrorForReact,
        Promise.reject
      )
    );
};

/**
 * Reading
 */

const readOne = function(id) {
  return superagent
    .get(`$PROOT}/posts/${id}`)
    .then(adapters.normalizeAndWrapOne);
};

const readAll = function readAll() {
  return superagent.get(`${ROOT}/posts`).then(adapters.normalizeAndWrapMany);
};

const read = function read(id) {
  return id ? readOne(id) : readAll();
};

/**
 * Updating
 */

function updateSome(entries) {
  return Promise.all(
    entries.map(ent => {
      return superagent.patch(`${ROOT}/posts/${ent.id}`).send(ent);
    })
  ).then(() => {
    let byId = entries.reduce((acc, ent) => {
      return _.assoc(ent.id, ent, acc);
    }, {});

    return {
      byId
    };
  });
}

function updateOne(entry) {
  return superagent
    .patch(`${ROOT}/posts/${entry.id}`)
    .send(entry)
    .then(() => {
      return {
        byId: {
          [entry.id]: entry
        }
      };
    });
}

const update = function update(entry) {
  let promise = Array.isArray(entry) ? updateSome(entry) : updateOne(entry);
  return promise.catch(error => {
    return Promise.reject(adapters.adaptErrorForReact(error));
  });
};

/**
 * Deleting
 */

function deleteSome(ids) {
  return Promise.all(
    ids.map(id => {
      return superagent.del(`${ROOT}/posts/${id}`);
    })
  ).then(() => {
    return {
      ids
    };
  });
}

function deleteOne(id) {
  return superagent.del(`${ROOT}/posts/${id}`).then(() => {
    return { id };
  });
}

const _delete = function _delete(ids) {
  return Array.isArray(ids) ? deleteSome(ids) : deleteOne(ids);
};

/**
 * The Whole Client
 */

const client: RMLRestClient & RestClientInstance = {
  create,
  read,
  update,
  delete: _delete
};

export default client;
