import React from "react";
import AppBar from "./components/app-bar";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { withRouter } from "react-router";
import PostListPage from "./pages/page-post-list";
import NewPostPage from "./pages/page-new-post";
import PostDetailsPage from "./pages/page-update-post";
import "./styles/general.css";
import Typography from "@material-ui/core/Typography";

import * as _ from "ramda";

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

export default class App extends React.Component {
  render() {
    return (
      <Router>
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
