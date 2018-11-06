import React from "react";
import { compose, pick, values } from "ramda";
import { Value } from "slate";
import ModelEntriesList from "../components/model-entries-list";
import BlogPostModel from "../model-blog-post/model-blog-post";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button/Button";
import EditBlogPostForm from "../components/edit-post-form";
import connect from "react-redux/es/connect/connect";
import { bindActionCreators } from "redux";
import Plain from "slate-plain-serializer";

class _PostListPage extends React.Component {
  state = {
    selected: [],
    openEdit: false
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selected !== this.state.selected) {
      this.setState({ openEdit: false });
    }
  }

  componentWillMount() {
    this.props.readPosts();
  }

  onRowsSelect = (current, selected) => {
    this.setState({
      selected
    });
  };

  onEditClicked = () => {
    if (this.state.selected.length === 1) {
    }

    this.setState({
      openEdit: true
    });
  };

  onDelete = () => {
    this.props.deletePosts(this.mapSelectedToEntries().map(ent => ent.id));
  };

  render() {
    let fields = ["id", "title", "content"];
    let data = this.props.allPosts.map(
      compose(
        values,
        obj => {
          return {
            ...obj,
            content: Plain.serialize(Value.fromJSON(JSON.parse(obj.content)))
          };
        },
        pick(fields)
      )
    );
    console.log(data);
    return (
      <>
        <div id={"model-wrapper"}>
          <ModelEntriesList
            modelName={BlogPostModel.MODEL_NAME}
            fields={fields}
            data={data}
            onRowsSelect={this.onRowsSelect}
            onEditClick={() => {
              if (this.state.selected.length === 1) {
                let itemIndex = this.state.selected[0].index;
                let item = this.props.allPosts[itemIndex];
                let id = item.id;
                this.props.history.push(`/posts/${id}`);
              } else {
                this.setState({ openEdit: true });
              }
            }}
            onDeleteClick={this.onDelete}
          />
        </div>
        <div className={"create-button-wrapper"}>
          <Link to={`/posts/new`}>
            <Button variant="contained" color="primary">
              Create
            </Button>
          </Link>
        </div>

        {this.state.openEdit && (
          <EditBlogPostForm
            entries={this.mapSelectedToEntries()}
            onCancelEdit={() => {
              this.setState({ openEdit: false });
            }}
            onSubmit={data => {
              let payload = this.mapSelectedToEntries().map(entry => {
                return {
                  ...entry,
                  ...data
                };
              });
              this.props.updatePosts(payload);
            }}
          />
        )}
      </>
    );
  }

  // Helper methods /////

  mapSelectedToEntries = () => {
    return this.state.selected.map(({ index }) => {
      return this.props.allPosts[index];
    });
  };
}

const PostListPage = connect(
  function mapStateToProps(state) {
    return {
      allPosts: BlogPostModel.selectors.getAll(state),
      postsError: BlogPostModel.selectors.getError(state),
      deleteState: BlogPostModel.selectors.getOperationStates(state).delete,
      createState: BlogPostModel.selectors.getOperationStates(state).create
    };
  },
  function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        readPosts: BlogPostModel.actionCreators.read,
        updatePosts: BlogPostModel.actionCreators.update,
        deletePosts: BlogPostModel.actionCreators.delete
      },
      dispatch
    );
  }
)(_PostListPage);

export default PostListPage;
