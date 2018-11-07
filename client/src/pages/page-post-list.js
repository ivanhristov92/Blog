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
  selectedEntries: Array<number>,
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

const ENTRY_LIST_FIELDS = ["id", "title", "content"];

class _PostListPage extends React.Component {
  props: Props;

  state: State = {
    /** Keeps track of the selected table rows */
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

  componentWillMount() {
    this.props.readPosts();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedEntries !== this.state.selectedEntries) {
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
    let itemIndex = this.state.selectedEntries[0];
    let item = this.props.allPosts[itemIndex];
    let id = item.id;
    this.navigateToPost(id);
  };

  /**
   * SELECTION
   */
  handleRowSelectionChange = (current, allSelected) => {
    this.setState({
      selectedEntries: allSelected.map(_.prop("dataIndex"))
    });
  };

  /**
   * PREVIEW GRID - grid view of selected posts
   */
  togglePreview = () => {
    this.setState({
      previewGridSectionOpen: !this.state.previewGridSectionOpen
    });
  };

  /**
   * EDITING
   */
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
    let payload = this.mapSelectedIndexesToEntries().map(entry => {
      return {
        ...entry,
        ...data
      };
    });
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
        this.props.deletePosts(
          this.mapSelectedIndexesToEntries().map(ent => ent.id)
        )
    );
  };

  /**
   * RENDER
   */
  render() {
    let data = this.adaptPostsForEntryList(
      this.props.allPosts,
      ENTRY_LIST_FIELDS
    );

    return (
      <>
        <div id={"model-wrapper"}>
          <ModelEntriesList
            modelName={BlogPostModel.MODEL_NAME}
            rowsSelected={this.state.selectedEntries}
            fields={ENTRY_LIST_FIELDS}
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
              entries={this.mapSelectedIndexesToEntries()}
              onCancelEdit={this.cancelBulkEdit}
              onSubmit={this.doBulkEdit}
            />
          </>
        )}

        {!this.state.bulkEditSectionOpen &&
          this.state.previewGridSectionOpen &&
          this.state.selectedEntries.length && (
            <PostPreviewGrid
              entries={this.mapSelectedIndexesToEntries()}
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

  mapSelectedIndexesToEntries = (): typeof Props.allPosts => {
    return this.state.selectedEntries.map(index => {
      return this.props.allPosts[index];
    });
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
