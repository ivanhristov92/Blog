import React from "react";
import TextField from "@material-ui/core/TextField";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import { Paper } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import RichText from "./rich-text/rich-text";
import { Value } from "slate";
import placeholder from "../images/placeholder.jpg";

const initialEditorValue = {
  document: {
    nodes: [
      {
        object: "block",
        type: "paragraph",
        nodes: [{ object: "text", leaves: [{ text: "" }] }]
      }
    ]
  }
};

const defaultState = Object.freeze({
  title: "",
  content: Value.fromJS(initialEditorValue),
  featuredImage: "",
  excerpt: ""
});

export default class EditBlogPostForm extends React.Component {
  state = defaultState;

  setStateToFirstEntry = () => {
    if (this.props.entries.length === 1) {
      let entry = this.props.entries[0];
      this.setState({
        title: entry.title,
        content: Value.fromJSON(JSON.parse(this.props.entries[0].content)),
        featuredImage: entry.featuredImage,
        excerpt: entry.excerpt
      });
    }
  };

  resetState = () => {
    this.setState(defaultState);
  };

  componentDidMount() {
    this.setStateToFirstEntry();
  }

  componentDidUpdate(prevProps) {
    if (this.props.entries.length === 1 && prevProps.entries.length !== 1) {
      this.setStateToFirstEntry();
    } else if (
      this.props.entries.length !== 1 &&
      prevProps.entries.length === 1
    ) {
      this.resetState();
    }
  }

  ///////////////////////
  // ____Rich Text______
  ///////////////////////
  onContentChange = ({ value }) => {
    this.setState({ content: value });
  };

  // ==== Rich Text ====
  ///////////////////////

  ///////////////////////
  // ___Title Field_____
  ///////////////////////
  onTitleChange = e => {
    this.setState({
      title: e.target.value
    });
  };
  // === Title Field ====
  ///////////////////////

  ///////////////////////
  // Excerpt Field_____
  ///////////////////////
  handleExcerptChange = e => {
    this.setState({
      excerpt: e.target.value
    });
  };
  // === Excerpt Field ====
  ///////////////////////

  edit = () => {
    let payload = {
      content: JSON.stringify(this.state.content.toJSON()),
      title: this.state.title,
      featuredImage: this.state.featuredImage,
      excerpt: this.state.excerpt
    };
    this.props.onSubmit(payload);
  };

  render() {
    return (
      <div className="new-post-form-wrapper">
        <div className={"new-post-title-wrapper"}>
          <TextField
            id="outlined-full-width"
            label="Post Title"
            value={this.state.title}
            onChange={this.onTitleChange}
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
            onChange={this.onContentChange}
            onKeyDown={this.onContentKeyDown}
            renderNode={this.renderNode}
            renderMark={this.renderMark}
            value={this.state.content}
          />
        </Paper>
        <div className={"create-button-wrapper"}>
          <Button variant="contained" color="primary" onClick={this.edit}>
            Edit
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={this.props.onCancelEdit}
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
            this.featuredImage = el;
          }}
          onChange={e => {
            for (const file of e.target.files) {
              const reader = new FileReader();
              const [mime] = file.type.split("/");
              if (mime !== "image") continue;

              reader.addEventListener("load", () => {
                this.setState({ featuredImage: reader.result });
              });

              reader.readAsDataURL(file);
            }
            return;
          }}
        />
        <hr style={{ margin: "40px 0" }} />
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              this.featuredImage.click();
            }}
          >
            Featured Image
          </Button>
        </div>
        <div className={"featured-image-and-excerpt-wrapper"}>
          <span className={"featured-image-wrapper"}>
            <>
              <img
                src={this.state.featuredImage}
                alt=""
                style={{ maxWidth: 500 }}
              />
              {this.state.featuredImage && (
                <div style={{ background: "white", textAlign: "right" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      this.setState({
                        featuredImage: defaultState.featuredImage
                      });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </>
          </span>

          <TextField
            className={"excerpt-field"}
            id="outlined-full-width"
            label="Excerpt"
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
        <hr style={{ margin: "40px 0" }} />

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

  isInErrors = input => {
    if (!this.props.error) return false;
    return (this.props.error.messages || {}).hasOwnProperty(input);
  };
}
