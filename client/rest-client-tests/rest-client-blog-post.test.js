// @flow

import client from "../src/model-blog-post/rest-client-blog-post";
import type {
  AdaptedPost,
  AdaptedPostWithoutId
} from "../src/model-blog-post/rest-client-blog-post";
import { describe, beforeEach, it } from "mocha";
import * as _ from "ramda";
var assert = require("assert");
const testRestClientInstance = require("redux-manager-lib/test/crud-rest-api");

const restApiFactory = () => client;
const wipeOutEntries = () => {};
testRestClientInstance(restApiFactory);

describe("[RUNTIME SIGNATURE]", () => {
  describe("create", function() {
    describe("[EXPECTS]", () => {
      beforeEach(wipeOutEntries);

      it("[ACCEPTS]", done => {
        let mock: AdaptedPostWithoutId = {
          title: "test",
          excerpt: "some excerpt",
          content: {},
          featuredImage: ""
        };

        client.create(mock).then(response => done());
      });
    });

    // describe("[RETURNS]", () => {
    //   describe("[CORRECT TYPE]", () => {
    //     it(`the 'create' function must return a Promise`, () => {
    //       let restApi = restApiFactory();
    //       let promise = restApi.create([{ test: 1 }]);
    //
    //       assert.equal(
    //         typeof promise.then,
    //         "function",
    //         `$create does not return a Promise`
    //       );
    //     });
    //   });
    //
    //   describe(`[CORRECT TYPE] the resolved data must be normalized`, () => {
    //     it("[CORRECT VALUE] should return normalized data with 1 entry when 1 object is created", done => {
    //       let restApi = restApiFactory();
    //
    //       restApi.create([{ test: 1 }]).then(response => {
    //         assert.equal(typeof response.byId, "object");
    //         assert.equal(_.keys(response.byId).length, 1);
    //         done();
    //       });
    //     });
    //     it("[CORRECT VALUE] should return normalized data with 2 entry when 2 object is created", done => {
    //       let restApi = restApiFactory();
    //
    //       restApi.create([{ test: 1 }, { test: 2 }]).then(response => {
    //         assert.equal(typeof response.byId, "object");
    //         assert.equal(_.keys(response.byId).length, 2);
    //         done();
    //       });
    //     });
    //     it("[CORRECT VALUE] should return normalized data with 3 entry when 3 object is created", done => {
    //       let restApi = restApiFactory();
    //
    //       restApi
    //         .create([{ test: 1 }, { test: 2 }, { test: 3 }])
    //         .then(response => {
    //           assert.equal(typeof response.byId, "object");
    //           assert.equal(_.keys(response.byId).length, 3);
    //           done();
    //         });
    //     });
    //   });
    // });
  });
});

describe("[OPERATION]", () => {});
