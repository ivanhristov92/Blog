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

      describe("[OPERATION]", () => {
        it("[CALLS] the error handler function", done => {
          let errHandler = {
            errHandler() {}
          };
          sinon.spy(errHandler, "errHandler");
          let client = clientFactory(errHandler.errHandler);
          let invalidPayload = {};
          client.create(invalidPayload).catch(err => {
            assert.notEqual(errHandler.errHandler.getCall(0), null);
            done();
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
});

describe("[OPERATION]", () => {});
