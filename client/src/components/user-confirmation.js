import React from "react";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Button from "@material-ui/core/Button/Button";
import ReactDOM from "react-dom";

class CustomConfirmation extends React.Component {
  state = {
    open: true
  };

  refuse = () => {
    this.setState(
      {
        open: false
      },
      () => {
        this.props.callback(false);
      }
    );
  };

  confirm = () => {
    this.setState(
      {
        open: false
      },
      () => {
        this.props.callback(true);
      }
    );
  };

  render() {
    return (
      <div>
        <Dialog
          open={this.state.open}
          onClose={() => {}}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Changes</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You've made some changes. They will be lost if not saved. Do you
              still want to continue?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.refuse} color="primary">
              Cancel
            </Button>
            <Button onClick={this.confirm} color="secondary">
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const getConfirmation = function EY(message, callback) {
  const confirmationNode = document.getElementById("confirmationNode");
  ReactDOM.render(
    <CustomConfirmation
      callback={result => {
        ReactDOM.unmountComponentAtNode(confirmationNode);
        callback(result);
      }}
    />,
    confirmationNode
  );
};

export default getConfirmation;
