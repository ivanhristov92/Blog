// @flow
import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { Paper } from "@material-ui/core";
import RichText from "./rich-text/rich-text";
import { Value } from "slate";
import placeholder from "../images/placeholder.jpg";
import { Prompt } from "react-router-dom";

import * as _ from "ramda";
import type {
  AdaptedPost,
  AdaptedError
} from "../model-blog-post/rest-client-blog-post";
import { emptyValue } from "./rich-text/serializers";
import DeletePromptDialog from "./delete-prompt-dialog";

type Props = {
  entries: Array<AdaptedPost>,
  updatePost: Function,
  cancelEditing: Function,
  deletePost?: Function,
  error?: ?AdaptedError,
  onEntryContentChange?: Function
};

type State = {
  title: string,
  content: Object,
  featuredImage: string,
  excerpt: string,
  deleteModalOpen: boolean
};

const defaultState: State = Object.freeze({
  title: "",
  content: Value.fromJS(emptyValue),
  featuredImage: "",
  excerpt: "",
  deleteModalOpen: false
});

const changes = {
  closeDeleteModal: { deleteModalOpen: false },
  openDeleteModal: { deleteModalOpen: true }
};

const getValuesOfEntry = (entry: AdaptedPost) =>
  _.evolve({ content: Value.fromJSON }, entry);

export default class EditBlogPostForm extends React.Component<Props, State> {
  featuredImageRef: Object;

  constructor(props: Props) {
    super(props);

    if (props.entries.length === 1) {
      let entry = props.entries[0];
      this.state = {
        ...getValuesOfEntry(entry),
        deleteModalOpen: false
      };
    } else {
      this.state = defaultState;
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.goingToOneEntry(prevProps)) {
      this.setStateToFirstEntry();
    } else if (this.movingAwayFromOneEntry(prevProps)) {
      this.setStateDefaults();
    }

    if (prevState !== this.state) {
      if (this.props.onEntryContentChange) {
        this.props.onEntryContentChange(this.entryContentHasChanged());
      }
    }
  }

  /**
   * Syncing state and first entry
   */
  setStateToFirstEntry = () => {
    let entry = this.props.entries[0];
    let valuesOfEntry = getValuesOfEntry(entry);
    this.setState(valuesOfEntry);
  };

  setStateDefaults = () => {
    this.setState(defaultState);
  };

  /**
   * Rich Text
   */
  handleContentChange = ({ value }: { value: Value }) => {
    this.setState({ content: value });
  };

  /**
   * Title
   */
  handleTitleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    (e.currentTarget: HTMLInputElement);
    this.setState({
      title: e.currentTarget.value
    });
  };

  /**
   * Excerpt
   */
  handleExcerptChange = (e: SyntheticEvent<HTMLInputElement>) => {
    (e.currentTarget: HTMLInputElement);
    this.setState({
      excerpt: e.currentTarget.value
    });
  };

  /**
   * Featured Image
   */
  handleFeaturedImageChange = (e: SyntheticEvent<HTMLInputElement>) => {
    (e.currentTarget: HTMLInputElement);
    for (const file of e.currentTarget.files) {
      const reader = new FileReader();
      const [mime] = file.type.split("/");
      if (mime !== "image") continue;
      reader.addEventListener("load", () => {
        this.setState({ featuredImage: reader.result });
      });

      reader.readAsDataURL(file);
    }
  };

  openImageSelectionWindow = () => {
    this.featuredImageRef.click();
  };

  clearFeaturedImage = () => {
    this.setState({
      featuredImage: defaultState.featuredImage
    });
  };

  /**
   * Editing
   */
  updatePost = () => {
    let payload = _.evolve(
      { content: content => content.toJSON() },
      this.state
    );
    this.props.updatePost(payload);
  };

  /**
   * Deleting
   */
  confirmDelete = () => {
    this.applyChanges([changes.closeDeleteModal], this.props.deletePost);
  };

  render() {
    return (
      <div className="edit-post-form-wrapper">
        <DeletePromptDialog
          open={this.state.deleteModalOpen}
          message={`Are you sure you want to delete this post?`}
          onCancel={this.applyChangesF([changes.closeDeleteModal])}
          onContinue={this.confirmDelete}
        />

        <div className={"post-title-wrapper"}>
          <TextField
            id="outlined-full-width"
            label="Post Title"
            value={this.state.title}
            onChange={this.handleTitleChange}
            placeholder={"Post Title"}
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{
              shrink: true
            }}
            error={this.isInErrors("title")}
            helperText={this.getErrorMessageFor("title")}
          />
        </div>
        <Paper>
          <RichText
            onChange={this.handleContentChange}
            value={this.state.content}
          />
        </Paper>
        <div className={"action-button-wrapper"}>
          <Button variant="contained" color="primary" onClick={this.updatePost}>
            Edit
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={this.props.cancelEditing}
          >
            Cancel
          </Button>

          {this.props.deletePost && (
            <Button
              variant="contained"
              color="secondary"
              onClick={this.applyChangesF([changes.openDeleteModal])}
            >
              Delete
            </Button>
          )}
        </div>
        <input
          type={"file"}
          hidden
          ref={el => {
            this.featuredImageRef = el;
          }}
          onChange={this.handleFeaturedImageChange}
        />
        <hr />
        <div className={"featured-image-and-excerpt-wrapper"}>
          <span className={"featured-image-wrapper"}>
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={this.openImageSelectionWindow}
              >
                {this.state.featuredImage ? "Change Image" : "Featured Image"}
              </Button>
            </div>
            <img src={this.state.featuredImage || "/" + placeholder} alt="" />
            {this.state.featuredImage && (
              <div className={"delete-button-wrapper"}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={this.clearFeaturedImage}
                >
                  Delete
                </Button>
              </div>
            )}
          </span>
          <div className={"excerpt-field-wrapper"}>
            <div className={"equalizing-empty-element"} />
            <TextField
              id="outlined-full-width"
              className={"excerpt-field"}
              label="Excerpt"
              multiline={true}
              value={this.state.excerpt}
              onChange={this.handleExcerptChange}
              placeholder={"Post Excerpt"}
              margin="normal"
              variant="outlined"
              InputLabelProps={{
                shrink: true
              }}
            />
          </div>
        </div>
        <hr />
        <div />
      </div>
    );
  }

  entryContentHasChanged = (() => {
    function compareRichTextStates(state, defaultState) {
      return !_.equals(state.content.toJSON(), defaultState.content);
    }

    function compareAllButRichTextStates(state, defaultState) {
      let properties = ["title", "excerpt", "featuredImage"];
      let valuesInState = _.pick(properties, state);
      let valuesInDefaultState = _.pick(properties, defaultState);
      return !_.equals(valuesInState, valuesInDefaultState);
    }

    return () => {
      let firstEntry = this.props.entries[0];
      if (!firstEntry) {
        return false;
      }
      let richTextHasChanges = compareRichTextStates(this.state, firstEntry);
      let somePropertiesHaveChanges = compareAllButRichTextStates(
        this.state,
        firstEntry
      );

      return richTextHasChanges || somePropertiesHaveChanges;
    };
  })();

  isInErrors = (input: string) => {
    if (!this.props.error) return false;
    return (this.props.error.messages || {}).hasOwnProperty(input);
  };

  getErrorMessageFor = (input: string) => {
    try {
      return this.props.error.messages[input].join("; ");
    } catch {
      return "";
    }
  };

  /**
   * Helpers
   */
  movingAwayFromOneEntry = (prevProps: Props) => {
    return this.props.entries.length !== 1 && prevProps.entries.length === 1;
  };

  goingToOneEntry = (prevProps: Props) => {
    return this.props.entries.length === 1 && prevProps.entries.length !== 1;
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
