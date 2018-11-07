import React from "react";
import { compose, pick, values } from "ramda";
import { Value } from "slate";
import ModelEntriesList from "../components/model-entries-list";
import BlogPostModel from "../model-blog-post/model-blog-post";
import EditBlogPostForm from "../components/edit-post-form";
import connect from "react-redux/es/connect/connect";
import { bindActionCreators } from "redux";
import Plain from "slate-plain-serializer";

import Card from "../components/card";
import GridList from "@material-ui/core/GridList/GridList";
import GridListTile from "@material-ui/core/GridListTile/GridListTile";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

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

  // SELECTION
  handleRowSelectionChange = (current, allSelected) => {
    this.setState({
      selected: allSelected
    });
  };

  // EDITING
  cancelBulkEdit = () => {
    this.setState({ openEdit: false });
  };

  // DELETING
  initiateBulkDelete = () => {
    this.setState({
      deleteInitiated: true
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
            rowsSelected={this.state.selected.map(s => s.index)}
            fields={fields}
            data={data}
            onRowsSelect={this.handleRowSelectionChange}
            onEditClicked={() => {
              if (this.state.selected.length === 1) {
                let itemIndex = this.state.selected[0].index;
                let item = this.props.allPosts[itemIndex];
                let id = item.id;
                this.props.history.push(`/posts/${id}`);
              } else {
                this.setState({ openEdit: !this.state.openEdit });
              }
            }}
            editing={this.state.openEdit}
            onDeleteClick={this.initiateBulkDelete}
            createButtonLinksTo={"/posts/new"}
            onPreviewClick={() => {
              this.setState({
                preview: !this.state.preview
              });
            }}
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
          </>
        )}

        {!this.state.openEdit &&
          this.state.preview &&
          this.state.selected.length && (
            <div>
              <GridList cellHeight={"auto"} cols={3}>
                {this.mapSelectedToEntries().map(entry => (
                  <GridListTile key={entry.id} cols={1}>
                    <Card
                      title={entry.title}
                      src={entry.featuredImage}
                      excerpt={entry.excerpt}
                      onActionAreaClicked={() => {
                        this.props.history.push(`/posts/${entry.id}`);
                      }}
                    />
                  </GridListTile>
                ))}
              </GridList>
            </div>
          )}

        <Dialog
          open={this.state.deleteInitiated}
          onClose={() => {}}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.state.selected.length} / {this.props.allPosts.length}{" "}
              entries selected. Are you sure you want to delete them?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({
                  deleteInitiated: false
                });
              }}
              color="primary"
            >
              Cancel
            </Button>
            <Button onClick={this.closeDialogAndDoDelete} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
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
