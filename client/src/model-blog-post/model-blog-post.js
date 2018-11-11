import {
  actionTypesFactory,
  actionCreatorsFactory,
  reducerFactory,
  selectorsFactory,
  bindSelectorsToState
} from "redux-manager-lib/index";
import moduleRestApi from "./rest-client-blog-post";

const MODEL_NAME = "BlogPost";

const actionTypes = actionTypesFactory(MODEL_NAME);

const restApi = moduleRestApi;

const actionCreators = actionCreatorsFactory(actionTypes, restApi);

const reducer = reducerFactory(actionTypes);

const selectors = bindSelectorsToState("blog", selectorsFactory());

const ModelBlogPost = {
  actionTypes,
  restApi,
  actionCreators,
  reducer,
  selectors,
  MODEL_NAME
};

export default ModelBlogPost;
