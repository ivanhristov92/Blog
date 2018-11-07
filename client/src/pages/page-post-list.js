import React from "react";
import { compose, pick, values } from "ramda";
import { Value } from "slate";
import ModelEntriesList from "../components/model-entries-list";
import BlogPostModel from "../model-blog-post/model-blog-post";
import EditBlogPostForm from "../components/edit-post-form";
import connect from "react-redux/es/connect/connect";
import { bindActionCreators } from "redux";
import Plain from "slate-plain-serializer";

import Typography from "@material-ui/core/Typography";

import DeletePromptDialog from "../components/delete-prompt-dialog";
import PostPreviewGrid from "../components/post-preview-grid";

class _PostListPage extends React.Component {
  state = {
    /* Keeps track of the selected table rows */
    selected: [],
    /* Flag for bulk editing */
    openEdit: false,
    /* Flag for showing a list of the selected
     * table rows bellow the table
     */
    preview: false,
    /* Flags the beginning of bulk/single delete */
    deleteInitiated: false
  };

  componentWillMount() {
    this.props.readPosts();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selected !== this.state.selected) {
      this.cancelBulkEdit();
    }
  }

  // NAVIGATION
  navigateToPost = id => {
    this.props.history.push(`/posts/${id}`);
  };

  navigateToSelectedPost = () => {
    let itemIndex = this.state.selected[0].index;
    let item = this.props.allPosts[itemIndex];
    let id = item.id;
    this.navigateToPost(id);
  };

  // SELECTION
  handleRowSelectionChange = (current, allSelected) => {
    this.setState({
      selected: allSelected
    });
  };

  // PREVIEW GRID - grid view of selected posts
  togglePreview = () => {
    this.setState({
      preview: !this.state.preview
    });
  };

  // EDITING
  handleEditClicked = () => {
    if (this.state.selected.length === 1) {
      this.navigateToSelectedPost();
    } else {
      this.toggleBulkEdit();
    }
  };
  toggleBulkEdit = () => {
    this.setState({ openEdit: !this.state.openEdit });
  };
  cancelBulkEdit = () => {
    this.setState({ openEdit: false });
  };

  doBulkEdit = data => {
    let payload = this.mapSelectedToEntries().map(entry => {
      return {
        ...entry,
        ...data
      };
    });
    this.props.updatePosts(payload);
  };

  // DELETING
  initiateBulkDelete = () => {
    this.setState({
      deleteInitiated: true
    });
  };

  cancelDelete = () => {
    this.setState({
      deleteInitiated: false
    });
  };

  closeDialogAndDoDelete = () => {
    this.setState(
      {
        deleteInitiated: false
      },
      () =>
        this.props.deletePosts(this.mapSelectedToEntries().map(ent => ent.id))
    );
  };

  render() {
    let fields = ["id", "title", "content"];
    let data = this.getData();

    return (
      <>
        <div id={"model-wrapper"}>
          <ModelEntriesList
            modelName={BlogPostModel.MODEL_NAME}
            rowsSelected={this.state.selected.map(s => s.index)}
            fields={fields}
            data={data}
            onRowsSelect={this.handleRowSelectionChange}
            onEditClicked={this.handleEditClicked}
            editing={this.state.openEdit}
            onDeleteClick={this.initiateBulkDelete}
            createButtonLinksTo={"/posts/new"}
            onPreviewClick={this.togglePreview}
            preview={this.state.preview}
          />
        </div>
        {this.state.openEdit && (
          <>
            <Typography variant="h4" color="inherit">
              <h4 style={{ textAlign: "center" }}>Bulk Editing</h4>
            </Typography>
            <EditBlogPostForm
              entries={this.mapSelectedToEntries()}
              onCancelEdit={this.cancelBulkEdit}
              onSubmit={this.doBulkEdit}
            />
          </>
        )}

        {!this.state.openEdit &&
          this.state.preview &&
          this.state.selected.length && (
            <PostPreviewGrid
              entries={this.mapSelectedToEntries()}
              navigateToPost={this.navigateToPost}
            />
          )}

        <DeletePromptDialog
          open={this.state.deleteInitiated}
          message={`${this.state.selected.length} / ${
            this.props.allPosts.length
          } entries selected. Are you sure you want to delete them?`}
          onCancel={this.cancelDelete}
          onContinue={this.closeDialogAndDoDelete}
        />
      </>
    );
  }

  getData = () => {
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
    return data;
  };

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
