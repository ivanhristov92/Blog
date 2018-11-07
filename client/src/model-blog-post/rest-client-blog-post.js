import superagent from "superagent";
import { normalize, schema } from "normalizr";

import { pathOr } from "ramda";

const ROOT = "http://localhost:3000";

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

export default {
  create(payload) {
    return superagent
      .post(ROOT + "/posts")
      .send(payload)
      .then(response => {
        return shape(response);
      })
      .catch(function(response) {
        let adaptedError = adaptErrorForReact(response);
        return Promise.reject(adaptedError);
      });
    function shape(response) {
      const normalizedData = normalize(response.body, post);
      return { byId: normalizedData.entities.post };
    }
  },
  read(id) {
    if (id) {
      return superagent.get(ROOT + "/posts/" + id).then(response => {
        const normalizedData = normalize(response.body, post);
        return {
          byId: normalizedData.entities.post
        };
      });
    }

    return superagent.get(ROOT + "/posts").then(response => {
      return shape(response);
    });
    function shape(response) {
      const normalizedData = normalize(response.body, arrayOfPosts);
      return {
        byId: normalizedData.entities.post
      };
    }
  },
  update(entry) {
    if (Array.isArray(entry)) {
      return Promise.all(
        entry.map(ent => {
          return superagent.patch(ROOT + "/posts/" + ent.id).send(ent);
        })
      )
        .then(responses => {
          let byId = entry.reduce((acc, ent) => {
            return {
              ...acc,
              [ent.id]: ent
            };
          }, {});

          return {
            byId
          };
        })
        .catch(error => {
          return Promise.reject(adaptErrorForReact(error));
        });
    }

    return superagent
      .patch(ROOT + "/posts/" + entry.id)
      .send(entry)
      .then(response => {
        return {
          byId: {
            [entry.id]: entry
          }
        };
      })
      .catch(error => {
        return Promise.reject(adaptErrorForReact(error));
      });
  },

  delete(ids) {
    if (Array.isArray(ids)) {
      return Promise.all(
        ids.map(id => {
          return superagent.del(ROOT + `/posts/${id}`);
        })
      ).then((...responses) => {
        return {
          ids: ids
        };
      });
    }

    return superagent.del(ROOT + `/posts/${ids}`).then(() => {
      let id = ids;
      return { id };
    });
  }
};

function adaptErrorForReact(error) {
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
