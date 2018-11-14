// @flow

import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { Paper } from "@material-ui/core";
import RichText from "../../components/rich-text/rich-text";
import { Value } from "slate";
import { sampleValue } from "../../components/rich-text/serializers";
import { Prompt } from "react-router-dom";
import * as _ from "ramda";
import placeholder from "../../images/placeholder.jpg";
import type {
  AdaptedPostWithoutId,
  AdaptedError
} from "../../model-blog-post/rest-client-blog-post";

type Props = {
  createPost: Function,
  cancelCreating: Function,
  error?: ?AdaptedError,
  stateOfCreate: string,
  onEntryContentChange: Function
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

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.stateOfCreate !== this.props.stateOfCreate) {
      if (this.props.stateOfCreate === "SUCCESS") {
        this.setStateDefaults();
      }
    }
    if (prevState !== this.state) {
      if (this.props.onEntryContentChange) {
        this.props.onEntryContentChange(this.entryContentHasChanged());
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
    let payload: AdaptedPostWithoutId = _.evolve(
      { content: content => content.toJSON() },
      this.state
    );
    this.props.createPost(payload);
  };

  render() {
    return (
      <div className="new-post-form-wrapper">
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
      </div>
    );
  }

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

    return () => {
      let richTextHasChanges = compareRichTextStates(this.state, defaultState);
      let somePropertiesHaveChanges = compareAllButRichTextStates(
        this.state,
        defaultState
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
}
