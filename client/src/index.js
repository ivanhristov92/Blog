import React from "react";
import ReactDOM from "react-dom";

import { Provider } from "react-redux";
import BlogApp from "./app";
import store from "./store";

import { attachAnUnexpectedErrorLogger } from "redux-manager-lib";

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <BlogApp />
      </Provider>
    );
  }
}

attachAnUnexpectedErrorLogger();
document.addEventListener("unexpectedruntimeerror", reduxManagerLibError => {
  alert("Unexpected Runtime Error - Check the console");
});

ReactDOM.render(<App />, document.getElementById("app"));
