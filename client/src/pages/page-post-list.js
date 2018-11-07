import React from "react";
import { compose, pick, values } from "ramda";
import ModelEntriesList from "../components/model-entries-list";
import BlogPostModel from "../model-blog-post/model-blog-post";
import EditBlogPostForm from "../components/edit-post-form";
import connect from "react-redux/es/connect/connect";
import { bindActionCreators } from "redux";
import { fromJSONToPlain } from "../components/rich-text/serializers";

import Typography from "@material-ui/core/Typography";

import DeletePromptDialog from "../components/delete-prompt-dialog";
import PostPreviewGrid from "../components/post-preview-grid";

import * as _ from "ramda";

type State = {
  selectedEntries: Array<number>
};

class _PostListPage extends React.Component {
  state: State = {
    /* Keeps track of the selected table rows */
    selectedEntries: [],

    /* Flag for bulk editing */
    bulkEditSectionOpen: false,

    /* Flag for showing a list of the selected
     * table rows bellow the table
     */
    previewGridSectionOpen: false,

    /* Flags the beginning of bulk/single delete */
    bulkDeleteInitiated: false
  };

  componentWillMount() {
    this.props.readPosts();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedEntries !== this.state.selectedEntries) {
      this.cancelBulkEdit();
    }
  }

  // NAVIGATION
  navigateToPost = id => {
    this.props.history.push(`/posts/${id}`);
  };

  navigateToSelectedPost = () => {
    let itemIndex = this.state.selectedEntries[0];
    let item = this.props.allPosts[itemIndex];
    let id = item.id;
    this.navigateToPost(id);
  };

  // SELECTION
  handleRowSelectionChange = (current, allSelected) => {
    this.setState({
      selectedEntries: allSelected.map(_.prop("dataIndex"))
    });
  };

  // PREVIEW GRID - grid view of selected posts
  togglePreview = () => {
    this.setState({
      previewGridSectionOpen: !this.state.previewGridSectionOpen
    });
  };

  // EDITING
  handleEditClicked = () => {
    if (this.state.selectedEntries.length === 1) {
      this.navigateToSelectedPost();
    } else {
      this.toggleBulkEdit();
    }
  };
  toggleBulkEdit = () => {
    this.setState({ bulkEditSectionOpen: !this.state.bulkEditSectionOpen });
  };
  cancelBulkEdit = () => {
    this.setState({ bulkEditSectionOpen: false });
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
      bulkDeleteInitiated: true
    });
  };

  cancelDelete = () => {
    this.setState({
      bulkDeleteInitiated: false
    });
  };

  closeDialogAndDoDelete = () => {
    this.setState(
      {
        bulkDeleteInitiated: false
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
            rowsSelected={this.state.selectedEntries}
            fields={fields}
            data={data}
            onRowsSelect={this.handleRowSelectionChange}
            onEditClicked={this.handleEditClicked}
            editing={this.state.bulkEditSectionOpen}
            onDeleteClick={this.initiateBulkDelete}
            createButtonLinksTo={"/posts/new"}
            onPreviewClick={this.togglePreview}
            preview={this.state.previewGridSectionOpen}
          />
        </div>
        {this.state.bulkEditSectionOpen && (
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

        {!this.state.bulkEditSectionOpen &&
          this.state.previewGridSectionOpen &&
          this.state.selectedEntries.length && (
            <PostPreviewGrid
              entries={this.mapSelectedToEntries()}
              navigateToPost={this.navigateToPost}
            />
          )}

        <DeletePromptDialog
          open={this.state.bulkDeleteInitiated}
          message={`${this.state.selectedEntries.length} / ${
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
            content: fromJSONToPlain(obj.content)
          };
        },
        pick(fields)
      )
    );
    return data;
  };

  // Helper methods /////

  mapSelectedToEntries = () => {
    return this.state.selectedEntries.map(index => {
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
