import React from "react";
import ReactDOM from "react-dom";
import AppBar from "./components/app-bar";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { withRouter } from "react-router";
import PostListPage from "./pages/page-post-list";
import NewPostPage from "./pages/page-new-post";
import PostDetailsPage from "./pages/page-update-post";
import "./styles/general.css";
import Typography from "@material-ui/core/Typography";

import * as _ from "ramda";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Button from "@material-ui/core/Button/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";

class _Breadcrumbs extends React.Component {
  render() {
    let noEmpty = this.props.location.pathname.split("/").filter(s => s !== "");
    let allBreadcrumbs = _.prepend("", noEmpty);

    const constructPath = index => {
      if (index === 0) {
        return "/";
      } else {
        return _.take(index + 1, allBreadcrumbs).reduce((acc, br, i) => {
          if (i === 0) {
            return acc;
          } else {
            return acc + br + "/";
          }
        }, "/");
      }
    };

    let links = allBreadcrumbs.map((e, i) => {
      let to = constructPath(i);
      console.log("to", to);
      return <Link to={to}>{e || "home"} / </Link>;
    });

    return (
      <div key={this.props.location.pathname} style={{ padding: 20 }}>
        <Typography variant="body1" color="inherit">
          {links}
        </Typography>
      </div>
    );
  }
}

const Breadcrumbs = withRouter(_Breadcrumbs);

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

export default class App extends React.Component {
  render() {
    return (
      <Router getUserConfirmation={getConfirmation}>
        <>
          <AppBar />
          <Breadcrumbs />
          <Switch>
            <Route
              exact
              path={"/"}
              render={props => <PostListPage {...props} />}
            />
            <Route
              exact
              path={"/posts"}
              render={props => <PostListPage {...props} />}
            />
            <Route
              exact
              path={"/posts/new"}
              render={props => <NewPostPage {...props} />}
            />
            <Route
              exact
              path={"/posts/:id/"}
              render={props => <PostDetailsPage {...props} />}
            />
          </Switch>
        </>
      </Router>
    );
  }
}
