import React from "react";
import EditBlogPostForm from "../components/edit-post-form";
import connect from "react-redux/es/connect/connect";
import BlogPostModel from "../model-blog-post/model-blog-post";
import { bindActionCreators } from "redux";

class _PostDetailsPage extends React.Component {
  componentWillMount() {
    console.log(this.props.match.params.id);
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
        onCancelEdit={() => {
          this.props.history.push("/");
        }}
        onEdit={payload => {
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
