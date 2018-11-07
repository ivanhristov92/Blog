import React from "react";
import ReactDOM from "react-dom";

import { Provider } from "react-redux";
import BlogApp from "./app";
import store from "./store";

import "./global-error-handling";

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <BlogApp />
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
