import React from "react";
import NewBlogPostForm from "../components/new-post-form";
import connect from "react-redux/es/connect/connect";
import BlogPostModel from "../model-blog-post/model-blog-post";
import { bindActionCreators } from "redux";

class _NewPostPage extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.createState !== prevProps.createState) {
      if (this.props.createState === "SUCCESS") {
        this.props.history.push("/");
      }
    }
  }

  render() {
    return (
      <NewBlogPostForm
        onSubmit={this.props.createPost}
        onCancel={() => {
          this.props.history.push("/");
        }}
      />
    );
  }
}
const NewPostPage = connect(
  function mapStateToProps(state) {
    return {
      postsError: BlogPostModel.selectors.getError(state),
      createState: BlogPostModel.selectors.getOperationStates(state).create
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
