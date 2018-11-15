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
import { dispatchAnUnexpectedErrorEvent } from "redux-manager-lib/index";
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

/**
 * Creating
 */

export default function clientFactory(customErrorHandler) {
  let errorHandler = customErrorHandler || dispatchAnUnexpectedErrorEvent;

  function create(payload) {
    return ifErrorEmitGlobally(
      () => {
        const execute = () => _createOne(payload);
        const executeAndAdaptError = addErrorAdapter(execute);
        return executeAndAdaptError();
      },
      {
        method: isArray(payload) ? "createMany" : "createOne",
        payload
      }
    );
  }

  function _createOne(payload) {
    return superagent
      .post(ROOT + "/posts")
      .send(postAdapters.stringifyContentOnly(payload))
      .then(response => ({
        byId: postAdapters.normalizeOne(response.body)
      }));
  }

  /**
   * Reading
   */

  function read(id) {
    return ifErrorEmitGlobally(
      () => {
        let execute = id ? () => _readOne(id) : _readAll;
        const executeAndAdaptError = addErrorAdapter(execute);
        return executeAndAdaptError();
      },
      {
        method: id ? "readOne" : "readAll",
        id
      }
    );
  }
  function _readOne(id) {
    return superagent.get(`${ROOT}/posts/${id}`).then(response => {
      return {
        byId: postAdapters.normalizeOne(response.body)
      };
    });
  }

  function _readAll() {
    return superagent.get(`${ROOT}/posts`).then(response => ({
      byId: postAdapters.normalizeMany(response.body)
    }));
  }

  /**
   * Updating
   */
  function update(entry) {
    return ifErrorEmitGlobally(
      () => {
        let operation = isArray(entry) ? _updateSome : _updateOne;
        const execute = () => operation(entry);
        const executeAndAdaptError = addErrorAdapter(execute);
        return executeAndAdaptError();
      },
      {
        method: isArray(entry) ? "updateSome" : "updateOne",
        entry
      }
    );
  }

  function _updateSome(entries) {
    return Promise.all(
      entries.map(ent => {
        let adaptedEntry = postAdapters.stringifyContentOnly(ent);
        return superagent.patch(`${ROOT}/posts/${ent.id}`).send(adaptedEntry);
      })
    ).then(() => {
      let byId: Object = entries.reduce(
        (acc, ent) => _.assoc(ent.id, ent, acc),
        {}
      );

      return {
        byId
      };
    });
  }

  function _updateOne(entry) {
    return superagent
      .patch(`${ROOT}/posts/${entry.id}`)
      .send(postAdapters.stringifyContentOnly(entry))
      .then(() => ({
        byId: {
          [entry.id]: entry
        }
      }));
  }

  /**
   * Deleting
   */
  function _delete(ids) {
    return ifErrorEmitGlobally(
      () => {
        let operation = isArray(ids) ? _deleteSome : _deleteOne;
        const execute = () => operation(ids);
        const executeAndAdaptError = addErrorAdapter(execute);
        return executeAndAdaptError();
      },
      {
        method: isArray(ids) ? "deleteSome" : "deleteOne",
        ids
      }
    );
  }

  function _deleteSome(ids) {
    return Promise.all(
      ids.map(id => superagent.del(`${ROOT}/posts/${id}`))
    ).then(
      (): Object => ({
        ids
      })
    );
  }

  function _deleteOne(id) {
    return superagent.del(`${ROOT}/posts/${id}`).then(() => ({
      id
    }));
  }

  /**
   * The Whole Client
   */

  const client: RestClientInstance = {
    create,
    read,
    update,
    delete: _delete
  };
  return client;
  // export default client;

  /**
   * Helpers
   */

  function ifErrorEmitGlobally(possiblyUnsafeOperation, details) {
    return new Promise((resolve, reject) => {
      return possiblyUnsafeOperation()
        .then(resolve)
        .catch(reject);
    }).catch(e => {
      !e.error.status && errorHandler(e, details);
      return Promise.reject(e);
    });
  }
  function rejectPromise(value) {
    return Promise.reject(value);
  }
  function isArray(value) {
    return Array.isArray(value);
  }
  function addErrorAdapter(func) {
    return function() {
      return func().catch(
        _.pipe(
          adapters.adaptErrorForReact,
          rejectPromise
        )
      );
    };
  }
}
