import React from "react";
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

import type { Props as EntryListProps } from "../components/model-entries-list";

type SlateContent = Object;

type AdaptedPostFromServer = {
  title: string,
  content: SlateContent,
  excerpt: string,
  featuredImage: string,
  id: number
};

type State = {
  selectedEntryIndexes: Array<number>,
  selectedEntries: Array<AdaptedPostFromServer>,
  bulkEditSectionOpen: boolean,
  previewGridSectionOpen: boolean,
  bulkDeleteInitiated: boolean
};

type Props = {
  allPosts: Array<AdaptedPostFromServer>,
  readPosts: Function,
  updatePosts: Function,
  deletePosts: Function,
  history: Object
};

const ENTRY_LIST_COLUMNS = ["id", "title", "content"];

class _PostListPage extends React.Component {
  props: Props;

  state: State = {
    /** Keeps track of the selected table rows */
    selectedEntryIndexes: [],

    /** Derive from props.allPosts and
     * state.selectedEntryIndexes */
    selectedEntries: [],

    /** Flag for bulk editing */
    bulkEditSectionOpen: false,

    /** Flag for showing a list of the selected
     * table rows bellow the table
     */
    previewGridSectionOpen: false,

    /** Flags the beginning of bulk/single delete */
    bulkDeleteInitiated: false
  };

  static getDerivedStateFromProps(props, state) {
    return {
      ...state,
      selectedEntries: state.selectedEntryIndexes.map(tableRowIndex => {
        return props.allPosts[tableRowIndex];
      })
    };
  }

  componentDidMount() {
    this.props.readPosts();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedEntryIndexes !== this.state.selectedEntryIndexes) {
      this.cancelBulkEdit();
    }
  }

  /**
   * NAVIGATION
   */
  navigateToPost = id => {
    this.props.history.push(`/posts/${id}`);
  };

  navigateToSelectedPost = () => {
    let item = this.state.selectedEntries[0];
    let id = item.id;
    this.navigateToPost(id);
  };

  navigateToNewPost = () => {
    this.props.history.push("/posts/new");
  };

  /**
   * SELECTION
   */
  handleRowSelectionChange = (current, allSelected) => {
    this.setState({
      selectedEntryIndexes: allSelected.map(_.prop("dataIndex"))
    });
  };

  /**
   * PREVIEW GRID - grid view of selected posts
   */
  togglePreviewSection = () => {
    this.setState({
      previewGridSectionOpen: !this.state.previewGridSectionOpen
    });
  };

  /**
   * EDITING
   */
  navigateToPostOrToggleBulkEditSection = () => {
    if (this.state.selectedEntryIndexes.length === 1) {
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
    const addNewData = _.merge(_.__, data);
    let payload = _.map(addNewData, this.state.selectedEntries);
    this.props.updatePosts(payload);
  };

  /**
   * DELETING
   */
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
        this.props.deletePosts(_.map(_.prop("id"), this.state.selectedEntries))
    );
  };

  /**
   * RENDER
   */
  render() {
    let data = this.adaptPostsForEntryList(
      this.props.allPosts,
      ENTRY_LIST_COLUMNS
    );

    return (
      <div className={"page-container"}>
        <ModelEntriesList
          modelName={BlogPostModel.MODEL_NAME}
          data={data}
          fields={ENTRY_LIST_COLUMNS}
          rowsSelected={this.state.selectedEntryIndexes}
          isEditing={this.state.bulkEditSectionOpen}
          isPreview={this.state.previewGridSectionOpen}
          onCreateClicked={this.navigateToNewPost}
          onRowsSelect={this.handleRowSelectionChange}
          onEditClicked={this.navigateToPostOrToggleBulkEditSection}
          onDeleteClick={this.initiateBulkDelete}
          onPreviewClick={this.togglePreviewSection}
        />
        {this.state.bulkEditSectionOpen && (
          <>
            <Typography variant="h4" color="inherit">
              <h4 className={"bulk-edit-title"}>Bulk Editing</h4>
            </Typography>
            <EditBlogPostForm
              entries={this.state.selectedEntries}
              onCancelEdit={this.cancelBulkEdit}
              onSubmit={this.doBulkEdit}
            />
          </>
        )}

        {!this.state.bulkEditSectionOpen &&
          this.state.previewGridSectionOpen &&
          this.state.selectedEntryIndexes.length && (
            <PostPreviewGrid
              entries={this.state.selectedEntries}
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
      </div>
    );
  }

  /**
   * Helpers
   */
  adaptPostsForEntryList = (
    allPosts: typeof Props.allPosts,
    fields: Array<string>
  ): typeof EntryListProps.entries => {
    let transform = _.map(
      _.compose(
        _.values,
        _.evolve({ content: fromJSONToPlain }),
        _.pick(fields)
      )
    );

    return transform(allPosts);
  };
}

/**
 * Connect With Redux
 */

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
