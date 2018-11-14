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
import { dispatchAnUnexpectedErrorEvent } from "redux-manager-lib";
import * as adapters from "./rest-client-adapters-blog-post";
import { postAdapters } from "./rest-client-adapters-blog-post";
import type {
  AdaptedError,
  AdaptedPost
} from "./rest-client-adapters-blog-post";
export type { AdaptedPost, AdaptedError };

export type AdaptedPostWithoutId = $Diff<AdaptedPost, { id: any }>;
type AdaptedPostId = $PropertyType<AdaptedPost, "id">;

/**
 * Client Instance Type
 * ====================
 *
 * RMLCreate, RMLRead, RMLUpdate

   type RMLCreate<ExpectsPayload, EntryShape, ErrorShape> = (
    payload: ExpectsPayload
   ) => Promise<RMLNormalizedDataInWrapper<EntryShape> | ErrorShape>

 * RMLDelete

   type RMLDelete<ExpectsPayload, IdType, ErrorShape> = (
    payload: ExpectsPayload
   ) => Promise<{ ids: Array<IdType> } | { id: IdType } | ErrorShape>
 */

export type RestClientInstance = RMLRestClient & {
  create: RMLCreate<
    $PropertyType<ExpectedPayloads, "create">,
    AdaptedPost,
    AdaptedError
  >,
  read: RMLRead<
    ?$PropertyType<ExpectedPayloads, "read">,
    AdaptedPost,
    AdaptedError
  >,
  update: RMLUpdate<
    $PropertyType<ExpectedPayloads, "update">,
    AdaptedPost,
    AdaptedError
  >,
  delete: RMLDelete<
    $PropertyType<ExpectedPayloads, "delete">,
    AdaptedPostId,
    AdaptedError
  >
};

export type ExpectedPayloads = {
  create: AdaptedPostWithoutId,
  read: AdaptedPostId,
  update: AdaptedPost | Array<AdaptedPost>,
  delete: AdaptedPostId | Array<AdaptedPostId>
};

const ROOT = "http://localhost:3000/api";
let errorHandlerFunction: Function = dispatchAnUnexpectedErrorEvent;
export function setCustomErrorHandler(customErrorHandler: Function) {
  errorHandlerFunction = customErrorHandler;
}
/**
 * Creating
 */
const create = function create(payload) {
  return superagent
    .post(ROOT + "/posts")
    .send(postAdapters.stringifyContentOnly(payload))
    .then(response => {
      try {
        return {
          byId: postAdapters.normalizeOne(response.body)
        };
      } catch (err) {
        errorHandlerFunction(err, {
          method: "create",
          response,
          payload
        });
        throw err;
      }
    })
    .catch(
      _.pipe(
        adapters.adaptErrorForReact,
        Promise.reject.bind(Promise)
      )
    );
};

/**
 * Reading
 */

const readOne = function(id) {
  return superagent.get(`${ROOT}/posts/${id}`).then(response => {
    try {
      return {
        byId: postAdapters.normalizeOne(response.body)
      };
    } catch (err) {
      errorHandlerFunction(err, {
        method: "readOne",
        response,
        arguments: { id }
      });
      throw err;
    }
  });
};

const readAll = function readAll() {
  return superagent.get(`${ROOT}/posts`).then(response => {
    try {
      return {
        byId: postAdapters.normalizeMany(response.body)
      };
    } catch (err) {
      errorHandlerFunction(err, { method: "readAll", response });
      throw err;
    }
  });
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
      let adaptedEntry = postAdapters.stringifyContentOnly(ent);
      return superagent.patch(`${ROOT}/posts/${ent.id}`).send(adaptedEntry);
    })
  ).then(() => {
    try {
      let byId: Object = entries.reduce((acc, ent) => {
        return _.assoc(ent.id, ent, acc);
      }, {});

      return {
        byId
      };
    } catch (err) {
      errorHandlerFunction(err, {
        method: "updateSome",
        arguments: { entries }
      });
      throw err;
    }
  });
}

function updateOne(entry) {
  return superagent
    .patch(`${ROOT}/posts/${entry.id}`)
    .send(postAdapters.stringifyContentOnly(entry))
    .then(() => {
      try {
        return {
          byId: {
            [entry.id]: entry
          }
        };
      } catch (err) {
        errorHandlerFunction(err, {
          method: "updateOne",
          arguments: { entry }
        });
        throw err;
      }
    });
}

const update = function update(entry) {
  let promise = Array.isArray(entry) ? updateSome(entry) : updateOne(entry);
  return promise.catch(
    _.pipe(
      adapters.adaptErrorForReact,
      Promise.reject.bind(Promise)
    )
  );
};

/**
 * Deleting
 */

function deleteSome(ids) {
  return Promise.all(
    ids.map(id => {
      return superagent.del(`${ROOT}/posts/${id}`);
    })
  ).then(
    (): Object => {
      try {
        return {
          ids
        };
      } catch (err) {
        errorHandlerFunction(err, {
          method: "deleteSome",
          arguments: { ids }
        });
        throw err;
      }
    }
  );
}

function deleteOne(id) {
  return superagent.del(`${ROOT}/posts/${id}`).then(() => {
    try {
      return { id };
    } catch (err) {
      errorHandlerFunction(err, {
        method: "deleteOne",
        arguments: { id }
      });
      throw err;
    }
  });
}

const _delete = function _delete(ids) {
  return Array.isArray(ids) ? deleteSome(ids) : deleteOne(ids);
};

/**
 * The Whole Client
 */

const client: RestClientInstance = {
  create,
  read,
  update,
  delete: _delete
};

export default client;
