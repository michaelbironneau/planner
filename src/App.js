import React, { Component } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import "./App.scss";
// Containers
import { DefaultLayout } from "./containers";
// Pages
import { Login, Page404, Page500, Register } from "./views/Pages";

import { fetchTasks, fetchLinks } from "./store/actions";
import { connect } from "react-redux";

// import { renderRoutes } from 'react-router-config';

class App extends Component {
  componentWillMount() {
    this.props.fetchTasks();
    this.props.fetchLinks();
  }

  render() {
    return (
      <HashRouter>
        <Switch>
          <Route exact path="/login" name="Login Page" component={Login} />
          <Route
            exact
            path="/register"
            name="Register Page"
            component={Register}
          />
          <Route exact path="/404" name="Page 404" component={Page404} />
          <Route exact path="/500" name="Page 500" component={Page500} />
          <Route path="/" name="Home" component={DefaultLayout} />
        </Switch>
      </HashRouter>
    );
  }
}

export default connect(
  () => {
    {
    }
  },
  { fetchTasks, fetchLinks }
)(App);
