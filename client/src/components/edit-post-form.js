// @flow

import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { Paper } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import RichText from "./rich-text/rich-text";
import { Value } from "slate";
import placeholder from "../images/placeholder.jpg";
import { Prompt } from "react-router-dom";

import * as _ from "ramda";
import type { AdaptedPostFromServer } from "../pages/page-post-list";
import { emptyValue } from "./rich-text/serializers";

type Props = {
  entries: Array<AdaptedPostFromServer>,
  updatePost: Function,
  cancelEditing: Function,
  deletePost: Function
};

type State = {
  title: string,
  content: Object,
  featuredImage: string,
  excerpt: string
};

const defaultState: State = Object.freeze({
  title: "",
  content: Value.fromJS(emptyValue),
  featuredImage: "",
  excerpt: ""
});

const getValuesOfEntry = (entry: AdaptedPostFromServer) =>
  _.evolve({ content: Value.fromJSON }, entry);

export default class EditBlogPostForm extends React.Component<Props, State> {
  featuredImageRef: Object;

  constructor(props: Props) {
    super(props);

    if (props.entries.length === 1) {
      let entry = props.entries[0];
      this.state = getValuesOfEntry(entry);
    } else {
      this.state = defaultState;
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.goingToOneEntry(prevProps)) {
      this.setStateToFirstEntry();
    } else if (this.movingAwayFromOneEntry(prevProps)) {
      this.setStateDefaults();
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
  handleContentChange = ({ value }) => {
    this.setState({ content: value });
  };

  /**
   * Title
   */
  handleTitleChange = e => {
    this.setState({
      title: e.target.value
    });
  };

  /**
   * Excerpt
   */
  handleExcerptChange = e => {
    this.setState({
      excerpt: e.target.value
    });
  };

  /**
   * Featured Image
   */
  handleFeaturedImageChange = e => {
    for (const file of e.target.files) {
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
    const formatContent = content => JSON.stringify(content.toJSON());
    let payload = _.evolve({ content: formatContent }, this.state);
    this.props.updatePost(payload);
  };

  render() {
    return (
      <div className="new-post-form-wrapper">
        <Prompt when={this.entryContentHasChanged()} message={location => {}} />

        <div className={"new-post-title-wrapper"}>
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
          />
        </div>
        <Paper>
          <RichText
            onChange={this.handleContentChange}
            value={this.state.content}
          />
        </Paper>
        <div className={"create-button-wrapper"}>
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
              onClick={this.props.deletePost}
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

  renderErrors = () => {
    if (!this.props.error) return null;
    let messages = Object.entries(this.props.error.messages || {});

    return messages.map(([key, list]) => {
      return (
        <div>
          {list.map(l => {
            return (
              <Chip
                label={key + " " + l}
                color="secondary"
                variant="outlined"
              />
            );
          })}
        </div>
      );
    });
  };

  isInErrors = input => {
    if (!this.props.error) return false;
    return (this.props.error.messages || {}).hasOwnProperty(input);
  };

  /**
   * Helpers
   */
  movingAwayFromOneEntry = prevProps => {
    return this.props.entries.length !== 1 && prevProps.entries.length === 1;
  };

  goingToOneEntry = prevProps => {
    return this.props.entries.length === 1 && prevProps.entries.length !== 1;
  };
}
