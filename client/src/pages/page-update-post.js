// @flow

import React from "react";
import EditBlogPostForm from "../components/edit-post-form";
import connect from "react-redux/es/connect/connect";
import BlogPostModel from "../model-blog-post/model-blog-post";
import { bindActionCreators } from "redux";
import type {
  RestClientInstance,
  AdaptedPost
} from "../model-blog-post/rest-client-blog-post";
import type { RMLOperationState } from "redux-manager-lib/crud-reducer.flow";

type Props = {
  post: AdaptedPost,
  deleteState: RMLOperationState,
  updateState: RMLOperationState,
  match: Object,
  history: Object,

  readPost: $PropertyType<RestClientInstance, "read">,
  updatePost: $PropertyType<RestClientInstance, "update">,
  deletePost: $PropertyType<RestClientInstance, "delete">
};

class _PostDetailsPage extends React.Component<Props> {
  componentWillMount() {
    this.props.readPost(this.props.match.params.id);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.deleteState !== this.props.deleteState) {
      if (this.props.deleteState === "SUCCESS") {
        this.props.history.push("/");
      }
    } else if (prevProps.updateState !== this.props.updateState) {
      if (this.props.updateState === "SUCCESS") {
        this.props.history.push("/");
      }
    }
  }

  render() {
    return (
      <EditBlogPostForm
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
      />
    );
  }
}
const PostDetailsPage = connect(
  function mapStateToProps(state, props) {
    return {
      post: BlogPostModel.selectors.getOne(state, props.match.params.id),
      deleteState: BlogPostModel.selectors.getOperationStates(state).delete,
      updateState: BlogPostModel.selectors.getOperationStates(state).update
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
