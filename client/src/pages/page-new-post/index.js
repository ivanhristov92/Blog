// @flow
import React from "react";
import NewBlogPostForm from "./new-post-form";
import connect from "react-redux/es/connect/connect";
import BlogPostModel from "../../model-blog-post/model-blog-post";
import { bindActionCreators } from "redux";
import type { RMLOperationState } from "redux-manager-lib/crud-reducer.flow";
import type {
  RestClientInstance,
  AdaptedError
} from "../../model-blog-post/rest-client-blog-post";
import { Prompt } from "react-router-dom";

type Props = {
  postsError: ?AdaptedError,
  stateOfCreate: RMLOperationState,
  createPost: $PropertyType<RestClientInstance, "create">,
  history: Object
};

type State = {
  entryContentHasChanged: boolean
};

class _NewPostPage extends React.Component<Props, State> {
  state = {
    entryContentHasChanged: false
  };

  /**
   * On successful create, navigate to 'home'
   */
  componentDidUpdate(prevProps, prevState) {
    if (this.props.stateOfCreate !== prevProps.stateOfCreate) {
      if (this.props.stateOfCreate === "SUCCESS") {
        this.setState(
          {
            entryContentHasChanged: false
          },
          () => this.props.history.push("/")
        );
      }
    }
  }

  render() {
    return (
      <>
        <Prompt when={this.state.entryContentHasChanged} message={"ddd"} />

        <NewBlogPostForm
          createPost={this.props.createPost}
          cancelCreating={() => {
            this.props.history.push("/");
          }}
          stateOfCreate={this.props.stateOfCreate}
          error={this.props.postsError}
          onEntryContentChange={changed =>
            this.setState({ entryContentHasChanged: changed })
          }
        />
      </>
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
