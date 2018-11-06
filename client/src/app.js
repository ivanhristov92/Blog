import React from "react";
import AppBar from "./components/app-bar";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PostListPage from "./pages/page-post-list";
import NewPostPage from "./pages/page-new-post";
import PostDetailsPage from "./pages/page-update-post";
import "./styles/general.css";

export default class App extends React.Component {
  render() {
    return (
      <Router>
        <>
          <AppBar />
          <Switch>
            <Route
              exact
              path={"/"}
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
