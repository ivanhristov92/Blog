import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { Paper } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import RichText from "./rich-text/rich-text";
import { Value } from "slate";
import { initialValue } from "./rich-text/serializers";

export default class NewBlogPostForm extends React.Component {
  state = {
    title: "",
    content: Value.fromJSON(initialValue) //Value.fromJSON(initialValue)
  };

  componentDidUpdate(prevProps) {
    if (prevProps.createState !== this.props.createState) {
      if (this.props.createState === "SUCCESS") {
        this.resetState();
      }
    }
  }

  resetState = () => {
    this.setState({
      title: "",
      content: Value.fromJSON(initialValue)
    });
  };
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

  create = () => {
    let payload = {
      content: JSON.stringify(this.state.content.toJSON()),
      title: this.state.title
    };
    console.log(JSON.stringify(this.state.content.toJSON()));
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
          <div className={"create-button-wrapper"}>
            <Button variant="contained" color="primary" onClick={this.create}>
              Create
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.props.onCancel}
            >
              Cancel
            </Button>
          </div>
          {this.renderErrors()}
        </Paper>
      </div>
    );
  }

  renderErrors = () => {
    if (!this.props.error) return null;
    let messages = Object.entries(this.props.error.messages || {});

    return messages.map(([key, list]) => {
      return (
        <div className={"error-messages-wrapper"}>
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
