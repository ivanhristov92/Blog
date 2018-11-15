// @flow

import React from "react";
import PostEntriesList from "./post-entries-list";
import BlogPostModel from "../../model-blog-post/model-blog-post";
import EditBlogPostForm from "../../components/update-post-form";
import connect from "react-redux/es/connect/connect";
import { bindActionCreators } from "redux";
import Typography from "@material-ui/core/Typography";
import DeletePromptDialog from "../../components/delete-prompt-dialog";
import PostPreviewGrid from "./post-preview-grid";
import type { RMLOperationState } from "redux-manager-lib/crud-reducer.flow";
import * as _ from "ramda";
import type { Props as EntryListProps } from "./post-entries-list";

import type {
  AdaptedPost,
  RestClientInstance,
  AdaptedError
} from "../../model-blog-post/rest-client-blog-post";

type State = {
  selectedEntryIndexes: Array<number>,
  selectedEntries: Array<AdaptedPost>,
  bulkUpdateSectionOpen: boolean,
  previewGridSectionOpen: boolean,
  bulkDeleteInitiated: boolean
};

type Props = {
  allPosts: Array<AdaptedPost>,
  readPosts: $PropertyType<RestClientInstance, "read">,
  postsError: ?AdaptedError,
  updatePosts: $PropertyType<RestClientInstance, "update">,
  stateOfUpdate: RMLOperationState,
  deletePosts: $PropertyType<RestClientInstance, "delete">,
  history: Object
};

const ENTRY_LIST_COLUMNS = ["id", "title", "excerpt"];

const changes = {
  cancelBulkUpdate: { bulkUpdateSectionOpen: false },
  toggleBulkUpdate: state => ({
    bulkUpdateSectionOpen: !state.bulkUpdateSectionOpen
  }),
  cancelBulkDelete: { bulkDeleteInitiated: false },

  initiateBulkDelete: { bulkDeleteInitiated: true },
  deselectEntries: { selectedEntryIndexes: [] },
  togglePreviewGrid: state => ({
    previewGridSectionOpen: !state.previewGridSectionOpen
  })
};

class _PostListPage extends React.Component<Props, State> {
  state = {
    /** Keeps track of the selected table rows */
    selectedEntryIndexes: [],

    /** Derive from props.allPosts and
     * state.selectedEntryIndexes */
    selectedEntries: [],

    /** Flag for bulk editing */
    bulkUpdateSectionOpen: false,

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
      selectedEntries: _.map(
        tableRowIndex => props.allPosts[tableRowIndex],
        state.selectedEntryIndexes
      )
    };
  }

  componentDidMount() {
    this.props.readPosts();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.stateOfUpdate !== this.props.stateOfUpdate) {
      if (this.props.stateOfUpdate === "SUCCESS") {
        this.applyChanges([changes.cancelBulkUpdate]);
      }
    }
    if (
      this.state.selectedEntryIndexes.length === 1 &&
      this.state.bulkUpdateSectionOpen
    ) {
      this.applyChanges([changes.cancelBulkUpdate]);
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
   * EDITING
   */
  navigateToPostOrToggleBulkUpdateSection = () => {
    if (this.state.selectedEntryIndexes.length === 1) {
      this.navigateToSelectedPost();
    } else {
      this.applyChanges([changes.toggleBulkUpdate]);
    }
  };

  doBulkUpdate = data => {
    const addNewData = _.merge(_.__, data);
    let payload = _.map(addNewData, this.state.selectedEntries);
    this.props.updatePosts(payload);
  };

  /**
   * DELETING
   */

  confirmDelete = () => {
    let idsOfPostsToDelete = _.map(_.prop("id"), this.state.selectedEntries);
    this.applyChanges([changes.cancelBulkDelete, changes.deselectEntries], () =>
      this.props.deletePosts(idsOfPostsToDelete)
    );
  };

  /**
   * RENDER
   */
  render() {
    let entriesForList = this.adaptPostsForEntryList(
      this.props.allPosts,
      ENTRY_LIST_COLUMNS
    );

    return (
      <div className={"page-container post-list-page-wrapper"}>
        <div />

        <PostEntriesList
          title={BlogPostModel.MODEL_NAME}
          entries={entriesForList}
          columns={ENTRY_LIST_COLUMNS}
          rowsSelected={this.state.selectedEntryIndexes}
          isEditingActive={this.state.bulkUpdateSectionOpen}
          isPreviewingActive={this.state.previewGridSectionOpen}
          onCreateClicked={this.navigateToNewPost}
          onRowsSelected={this.handleRowSelectionChange}
          onEditClicked={this.navigateToPostOrToggleBulkUpdateSection}
          onDeleteClicked={this.applyChangesF([changes.initiateBulkDelete])}
          onPreviewClicked={this.applyChangesF([changes.togglePreviewGrid])}
        />
        {this.state.bulkUpdateSectionOpen &&
          this.state.selectedEntryIndexes.length && (
            <>
              <Typography variant="h4" color="inherit">
                <h4 className={"bulk-edit-title"}>Bulk Editing</h4>
              </Typography>
              <EditBlogPostForm
                key={1}
                entries={this.state.selectedEntries}
                error={this.props.postsError}
                cancelEditing={this.applyChangesF([changes.cancelBulkUpdate])}
                updatePost={this.doBulkUpdate}
              />
            </>
          )}

        {!this.state.bulkUpdateSectionOpen &&
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
          onCancel={this.applyChangesF([changes.cancelBulkDelete])}
          onContinue={this.confirmDelete}
        />
      </div>
    );
  }

  /**
   * Helpers
   */
  adaptPostsForEntryList = (
    allPosts: $PropertyType<Props, "allPosts">,
    fields: Array<string>
  ): $PropertyType<EntryListProps, "entries"> => {
    let transform = _.map(
      _.compose(
        _.values,
        _.pick(fields)
      )
    );

    return transform(allPosts);
  };

  applyChanges = (changes, cb = () => {}) => {
    let chs = _.reduce(
      (acc, curr) => {
        if (typeof curr === "function") {
          return _.merge(acc, curr(this.state));
        }
        return _.merge(acc, curr);
      },
      {},
      changes
    );
    this.setState(chs, cb);
  };

  applyChangesF = (changes, cb = () => {}) => {
    return () => this.applyChanges(changes, cb);
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
      stateOfUpdate: BlogPostModel.selectors.getOperationStates(state).update
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
