import React from "react";
import AppBar from "./components/app-bar";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import PostListPage from "./pages/page-post-list";
import NewPostPage from "./pages/page-new-post";
import PostDetailsPage from "./pages/page-update-post";
import getConfirmation from "./components/user-confirmation";
import Breadcrumbs from "./components/breadcrumbs";
import "./styles/general.css";

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
