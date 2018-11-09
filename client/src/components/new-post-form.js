// @flow

import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { Paper } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import RichText from "./rich-text/rich-text";
import { Value } from "slate";
import { sampleValue } from "./rich-text/serializers";
import { Prompt } from "react-router-dom";
import * as _ from "ramda";
import placeholder from "../images/placeholder.jpg";
import type { AdaptedPostFromServer } from "../pages/page-post-list";
import type { AdaptedPostWithoutId } from "../model-blog-post/rest-client-blog-post";

type AdaptedError = {
  error: Object,
  messages: { [fieldName: string]: Array<string> }
};

type Props = {
  createPost: Function,
  cancelCreating: Function,
  error?: ?AdaptedError,
  stateOfCreate: string
};

type State = {
  title: string,
  content: Object,
  featuredImage: string,
  excerpt: string
};

const defaultState: State = Object.freeze({
  title: "",
  content: Value.fromJS(sampleValue),
  featuredImage: "",
  excerpt: ""
});

export default class NewBlogPostForm extends React.Component<Props, State> {
  featuredImageRef: Object;

  state = defaultState;

  componentDidUpdate(prevProps: Props) {
    if (prevProps.stateOfCreate !== this.props.stateOfCreate) {
      if (this.props.stateOfCreate === "SUCCESS") {
        this.setStateDefaults();
      }
    }
  }

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
   * Creating
   */
  createPost = () => {
    const formatContent = content => JSON.stringify(content.toJSON());
    let payload: AdaptedPostWithoutId = _.evolve(
      { content: formatContent },
      this.state
    );
    this.props.createPost(payload);
  };

  render() {
    return (
      <div className="new-post-form-wrapper">
        <Prompt
          when={this.entryContentHasChanged(defaultState)}
          message={location => {}}
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
          />
        </div>
        <Paper>
          <RichText
            onChange={this.handleContentChange}
            value={this.state.content}
          />
        </Paper>
        <div className={"action-button-wrapper"}>
          <Button variant="contained" color="primary" onClick={this.createPost}>
            Create
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={this.props.cancelCreating}
          >
            Cancel
          </Button>
        </div>
        {this.renderErrors()}
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

  /**
   * Helpers
   */
  entryContentHasChanged = (() => {
    function compareRichTextStates(state, defaultState) {
      return !_.equals(state.content.toJSON(), defaultState.content.toJSON());
    }

    function compareAllButRichTextStates(state, defaultState) {
      let properties = ["title", "excerpt", "featuredImage"];
      let valuesInState = _.pick(properties, state);
      let valuesInDefaultState = _.pick(properties, defaultState);
      return !_.equals(valuesInState, valuesInDefaultState);
    }

    return defaultEntry => {
      if (!defaultEntry || !this.state) {
        return false;
      }
      let richTextHasChanges = compareRichTextStates(this.state, defaultEntry);
      let somePropertiesHaveChanges = compareAllButRichTextStates(
        this.state,
        defaultEntry
      );
      return richTextHasChanges || somePropertiesHaveChanges;
    };
  })();

  isInErrors = input => {
    if (!this.props.error) return false;
    return (this.props.error.messages || {}).hasOwnProperty(input);
  };
}
