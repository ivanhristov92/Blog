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

  render() {
    return (
      <div>
        <Dialog
          open={this.state.open}
          onClose={() => {}}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You've made some changes. They will be lost if not saved. Do you
              still want to continue?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState(
                  {
                    open: false
                  },
                  () => {
                    this.props.callback(false);
                  }
                );
              }}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                this.setState(
                  {
                    open: false
                  },
                  () => {
                    this.props.callback(true);
                  }
                );
              }}
              color="secondary"
            >
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const getConfirmation = (message, callback) => {
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
