// @flow

import React from "react";
import EditBlogPostForm from "../../components/update-post-form";
import connect from "react-redux/es/connect/connect";
import BlogPostModel from "../../model-blog-post/model-blog-post";
import { bindActionCreators } from "redux";
import type {
  RestClientInstance,
  AdaptedPost
} from "../../model-blog-post/rest-client-blog-post";
import type { RMLOperationState } from "redux-manager-lib/crud-reducer.flow";
import { Prompt } from "react-router-dom";

type Props = {
  post: AdaptedPost,
  stateOfUpdate: RMLOperationState,
  stateOfDelete: RMLOperationState,
  match: Object,
  history: Object,

  readPost: $PropertyType<RestClientInstance, "read">,
  updatePost: $PropertyType<RestClientInstance, "update">,
  deletePost: $PropertyType<RestClientInstance, "delete">
};

type State = {
  entryContentHasChanged: boolean
};

class _PostDetailsPage extends React.Component<Props, State> {
  state = {
    entryContentHasChanged: false
  };

  componentWillMount() {
    this.props.readPost(this.props.match.params.id);
  }

  componentDidUpdate(prevProps) {
    if (this.operationIsSuccessful("stateOfDelete", prevProps)) {
      this.setEntryContentHasChanged(false, () => this.props.history.push("/"));
    } else if (this.operationIsSuccessful("stateOfUpdate", prevProps)) {
      this.setEntryContentHasChanged(false, () => this.props.history.push("/"));
    }
  }

  render() {
    return (
      <>
        <Prompt when={this.state.entryContentHasChanged} message={"update"} />

        <EditBlogPostForm
          key={2}
          entries={this.props.post ? [this.props.post] : []}
          cancelEditing={() => {
            this.props.history.push("/");
          }}
          updatePost={payload => {
            this.props.updatePost({
              ...payload,
              id: Number(this.props.match.params.id)
            });
          }}
          deletePost={() => this.props.deletePost(this.props.match.params.id)}
          onEntryContentChange={changed =>
            this.setState({
              entryContentHasChanged: changed
            })
          }
        />
      </>
    );
  }

  operationIsSuccessful = (operation, prevProps) => {
    if (prevProps[operation] === this.props[operation]) {
      return false;
    }
    return this.props[operation] === "SUCCESS";
  };

  setEntryContentHasChanged = (value: boolean, cb = () => {}) => {
    this.setState(
      {
        entryContentHasChanged: value
      },
      cb
    );
  };
}
const PostDetailsPage = connect(
  function mapStateToProps(state, props) {
    return {
      post: BlogPostModel.selectors.getOne(state, props.match.params.id),
      stateOfDelete: BlogPostModel.selectors.getOperationStates(state).delete,
      stateOfUpdate: BlogPostModel.selectors.getOperationStates(state).update
    };
  },
  function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        readPost: BlogPostModel.actionCreators.read,
        updatePost: BlogPostModel.actionCreators.update,
        deletePost: BlogPostModel.actionCreators.delete
      },
      dispatch
    );
  }
)(_PostDetailsPage);

export default PostDetailsPage;
