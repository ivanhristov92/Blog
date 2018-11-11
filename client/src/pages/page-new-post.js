// @flow
import React from "react";
import NewBlogPostForm from "../components/new-post-form";
import connect from "react-redux/es/connect/connect";
import BlogPostModel from "../model-blog-post/model-blog-post";
import { bindActionCreators } from "redux";
import type { RMLOperationState } from "redux-manager-lib/crud-reducer.flow";
import type {
  RestClientInstance,
  AdaptedError
} from "../model-blog-post/rest-client-blog-post";

type Props = {
  postsError: ?AdaptedError,
  stateOfCreate: RMLOperationState,
  createPost: $PropertyType<RestClientInstance, "create">,
  history: Object
};

class _NewPostPage extends React.Component<Props> {
  /**
   * On successful create, navigate to 'home'
   */
  componentDidUpdate(prevProps) {
    if (this.props.stateOfCreate !== prevProps.stateOfCreate) {
      if (this.props.stateOfCreate === "SUCCESS") {
        this.props.history.push("/");
      }
    }
  }

  render() {
    return (
      <NewBlogPostForm
        createPost={this.props.createPost}
        cancelCreating={() => {
          this.props.history.push("/");
        }}
        stateOfCreate={this.props.stateOfCreate}
        error={this.props.postsError}
      />
    );
  }
}

/**
 * Connect With Redux
 */

const NewPostPage = connect(
  function mapStateToProps(state) {
    return {
      postsError: BlogPostModel.selectors.getError(state),
      stateOfCreate: BlogPostModel.selectors.getOperationStates(state).create
    };
  },
  function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        createPost: BlogPostModel.actionCreators.create
      },
      dispatch
    );
  }
)(_NewPostPage);

export default NewPostPage;
