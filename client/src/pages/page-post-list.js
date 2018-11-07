import React from "react";
import { compose, pick, values } from "ramda";
import { Value } from "slate";
import ModelEntriesList from "../components/model-entries-list";
import BlogPostModel from "../model-blog-post/model-blog-post";
import EditBlogPostForm from "../components/edit-post-form";
import connect from "react-redux/es/connect/connect";
import { bindActionCreators } from "redux";
import Plain from "slate-plain-serializer";
import { html } from "../components/rich-text/serializers";

import Card from "../components/card";

class _PostListPage extends React.Component {
  state = {
    selected: [],
    openEdit: false,
    preview: false
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

    let dataForPreview = this.mapSelectedToEntries().map(obj => {
      return html.serialize(Value.fromJSON(JSON.parse(obj.content)));
    });
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
        {this.state.preview &&
          this.state.selected.length === 1 && (
            <div>
              <Card
                title={this.mapSelectedToEntries()[0].title}
                content={dataForPreview}
              />
            </div>
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
