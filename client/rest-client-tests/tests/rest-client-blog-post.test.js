// @flow

import clientFactory from "../../src/model-blog-post/rest-client-blog-post";
import type {
  ExpectedPayloads,
  RestClientInstance
} from "../../src/model-blog-post/rest-client-blog-post";
import { describe, beforeEach, it } from "mocha";
import * as _ from "ramda";
var assert = require("assert");
const sinon = require("sinon");
const testRestClientInstance = require("redux-manager-lib/test/crud-rest-api");

const wipeOutEntries = () => {};
testRestClientInstance(clientFactory);

describe("[RUNTIME SIGNATURE]", () => {
  let mock: $PropertyType<ExpectedPayloads, "create"> = {
    title: "test",
    excerpt: "some excerpt",
    content: {},
    featuredImage: ""
  };

  describe("create", function() {
    beforeEach(wipeOutEntries);

    let client = clientFactory();

    describe("single create", () => {
      describe("[EXPECTS]", () => {
        describe("[ACCEPTS]", () => {
          describe("[CORRECT TYPE] single object as payload", () => {
            it("a payload of a single object, as described in the type definition", done => {
              client.create(mock).then(response => {
                done();
              });
            });
          });
        });
      });

      describe("[RETURNS]", () => {
        describe("when payload is valid", () => {
          it("[CORRECT TYPE] a payload of a single object, as described in the type definition", done => {
            client.create(mock).then(response => {
              assert.equal(typeof response, "object");
              assert.equal(typeof response.byId, "object");
              assert.equal(Object.keys(response.byId).length, 1);
              done();
            });
          });
          it("[CORRECT VALUE]", done => {
            client.create(mock).then(response => {
              let ids = Object.keys(response.byId);
              let id = ids[0];
              assert.equal(ids.length, 1);
              assert.deepEqual({ ...mock, id }, response.byId[id]);
              done();
            });
          });
        });

        describe("when payload is NOT valid", () => {
          it("[CORRECT TYPE] a rejected promise", done => {
            let invalidPayload = {};
            client.create(invalidPayload).catch(err => {
              done();
            });
          });
          it("[CORRECT TYPE] rejects an object with a 'messages' property", done => {
            let invalidPayload = {};
            client.create(invalidPayload).catch(err => {
              assert.equal(err.hasOwnProperty("messages"), true);
              done();
            });
          });
          it("[CORRECT TYPE] rejects an object with an 'error' property", done => {
            let invalidPayload = {};
            client.create(invalidPayload).catch(err => {
              assert.equal(err.hasOwnProperty("error"), true);
              done();
            });
          });
        });
      });
    });
  });

  describe("read", () => {
    describe("single read", () => {
      const client = clientFactory();

      describe("[EXPECTS]", () => {
        it("[ACCEPTS] a number as id", done => {
          client
            .create(mock)
            .then(({ byId }) => {
              let entry = Object.values(byId)[0];
              return client.read(Number(entry.id));
            })
            .then(entry => {
              done();
            });
        });
        it("[ACCEPTS][] a string as id", done => {
          client
            .create(mock)
            .then(({ byId }) => {
              let entry = Object.values(byId)[0];
              return client.read(entry.id + "");
            })
            .then(entry => {
              done();
            });
        });
      });

      describe("[RETURNS]", () => {
        it("[CORRECT TYPE]", done => {
          client
            .create(mock)
            .then(({ byId }) => {
              let entry = Object.values(byId)[0];
              return client.read(entry.id + "");
            })
            .then(entries => {
              assert.equal(typeof entries.byId, "object");
              done();
            });
        });

        it("[CORRECT VALUE]", done => {
          let id;

          client
            .create(mock)
            .then(({ byId }) => {
              let entry = Object.values(byId)[0];
              id = entry.id;
              return client.read(entry.id + "");
            })
            .then(entries => {
              assert.equal(entries.byId.hasOwnProperty(id), true);
              assert.deepEqual(entries.byId[id], { ...mock, id });
              done();
            });
        });
      });
    });

    describe("multiple read", () => {
      const client = clientFactory();

      describe("[EXPECTS]", () => {
        it("[ACCEPTS] undefined", done => {
          client
            .create(mock)
            .then(({ byId }) => {
              return client.read(undefined);
            })
            .then(entry => {
              done();
            });
        });
      });

      describe("[RETURNS]", () => {
        it("[CORRECT TYPE]", done => {
          Promise.all([mock, mock].map(client.create))
            .then(responses => {
              return client.read();
            })
            .then(responseFromRead => {
              assert.equal(typeof responseFromRead.byId, "object");
              done();
            });
        });

        it("[CORRECT VALUE]", done => {
          let idOne, idTwo;

          Promise.all([mock, mock].map(client.create))
            .then(([resOne, resTwo]) => {
              idOne = Object.values(resOne.byId)[0].id;
              idTwo = Object.values(resTwo.byId)[0].id;
              return client.read();
            })
            .then(responseFromRead => {
              assert.equal(responseFromRead.byId.hasOwnProperty(idOne), true);
              assert.equal(responseFromRead.byId.hasOwnProperty(idTwo), true);
              assert.deepEqual(responseFromRead.byId[idOne], {
                ...mock,
                id: idOne
              });
              assert.deepEqual(responseFromRead.byId[idTwo], {
                ...mock,
                id: idTwo
              });
              done();
            });
        });
      });
    });
  });

  describe("update", () => {
    let client = clientFactory();

    describe("single update", () => {
      describe("[EXPECTS]", () => {
        it("[ACCEPTS] an object", done => {
          client
            .create(mock)
            .then(({ byId }) => {
              let entry = Object.values(byId)[0];
              return client.update({ ...entry, title: "edited" });
            })
            .then(() => {
              done();
            });
        });
      });
      describe("[RETURNS]", () => {
        it("[CORRECT TYPE]", done => {
          client
            .create(mock)
            .then(({ byId }) => {
              let entry = Object.values(byId)[0];
              return client.update({ ...entry, title: "edited" });
            })
            .then(response => {
              assert.equal(typeof response.byId, "object");
              assert.equal(Object.values(response.byId).length, 1);
              done();
            });
        });
        it("[CORRECT VALUE]", done => {
          client
            .create(mock)
            .then(({ byId }) => {
              let entry = Object.values(byId)[0];
              return client.update({ ...entry, title: "edited" });
            })
            .then(response => {
              let entry = Object.values(response.byId)[0];
              assert.equal(entry.title, "edited");
              done();
            });
        });
      });
    });

    describe("multiple update", () => {
      describe("[EXPECTS]", () => {
        it("[ACCEPTS] an array of objects", done => {
          Promise.all([mock, mock].map(client.create))
            .then(([respOne, respTwo]) => {
              let entryOne = Object.values(respOne.byId)[0];
              let entryTwo = Object.values(respTwo.byId)[0];
              return client.update([
                { ...entryOne, title: "edit1" },
                { ...entryTwo, title: "edit2" }
              ]);
            })
            .then(() => {
              done();
            });
        });
      });
      describe("[RETURNS]", () => {
        it("[CORRECT TYPE]", done => {
          Promise.all([mock, mock].map(client.create))
            .then(([respOne, respTwo]) => {
              let entryOne = Object.values(respOne.byId)[0];
              let entryTwo = Object.values(respTwo.byId)[0];
              return client.update([
                { ...entryOne, title: "edit1" },
                { ...entryTwo, title: "edit2" }
              ]);
            })

            .then(response => {
              assert.equal(typeof response.byId, "object");
              assert.equal(Object.values(response.byId).length, 2);
              done();
            });
        });
        it("[CORRECT VALUE]", done => {
          Promise.all([mock, mock].map(client.create))
            .then(([respOne, respTwo]) => {
              let entryOne = Object.values(respOne.byId)[0];
              let entryTwo = Object.values(respTwo.byId)[0];
              return client.update([
                { ...entryOne, title: "edit1" },
                { ...entryTwo, title: "edit2" }
              ]);
            })

            .then(response => {
              let entry1 = Object.values(response.byId)[0];
              let entry2 = Object.values(response.byId)[1];
              assert.equal(entry1.title, "edit1");
              assert.equal(entry2.title, "edit2");
              done();
            });
        });
      });
    });
  });

  describe("delete", () => {
    let client = clientFactory();

    describe("single delete", () => {
      describe("[EXPECTS]", () => {
        it("[ACCEPTS] an id", done => {
          Promise.all([mock, mock].map(client.create))
            .then(([respOne, respTwo]) => {
              let idOne = Object.keys(respOne.byId)[0];
              return client.delete(idOne);
            })

            .then(response => {
              done();
            });
        });
      });
      describe("[RETURNS]", () => {
        it("[CORRECT TYPE]", done => {
          Promise.all([mock, mock].map(client.create))
            .then(([respOne, respTwo]) => {
              let idOne = Object.keys(respOne.byId)[0];
              return client.delete(idOne);
            })

            .then(response => {
              assert.notEqual(typeof response.id, "undefined");
              done();
            });
        });
        it("[CORRECT VALUE]", done => {
          let id;
          Promise.all([mock, mock].map(client.create))
            .then(([respOne, respTwo]) => {
              id = Object.keys(respOne.byId)[0];
              return client.delete(id);
            })

            .then(response => {
              assert.equal(response.id, id);
              done();
            });
        });
      });
    });

    describe("multiple delete", () => {
      describe("[EXPECTS]", () => {
        it("[ACCEPTS] an array of ids", done => {
          Promise.all([mock, mock].map(client.create))
            .then(([respOne, respTwo]) => {
              let idOne = Object.keys(respOne.byId)[0];
              let idTwo = Object.keys(respOne.byId)[1];
              return client.delete([idOne, idTwo]);
            })

            .then(response => {
              done();
            });
        });
      });
      describe("[RETURNS]", () => {
        it("[CORRECT TYPE]", done => {
          Promise.all([mock, mock].map(client.create))
            .then(([respOne, respTwo]) => {
              let idOne = Object.keys(respOne.byId)[0];
              let idTwo = Object.keys(respOne.byId)[1];
              return client.delete([idOne, idTwo]);
            })

            .then(response => {
              assert.notEqual(typeof response.ids, "undefined");
              done();
            });
        });
        it("[CORRECT VALUE]", done => {
          let ids;
          Promise.all([mock, mock].map(client.create))
            .then(([respOne, respTwo]) => {
              ids = [
                Object.keys(respOne.byId)[0],
                Object.keys(respOne.byId)[1]
              ];
              return client.delete(ids);
            })

            .then(response => {
              assert.deepEqual(response.ids, ids);
              done();
            });
        });
      });
    });
  });
});

describe("[OPERATION]", () => {});
