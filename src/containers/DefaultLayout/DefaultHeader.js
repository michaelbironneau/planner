import React, { Component } from "react";
import { Nav, NavItem, NavLink } from "reactstrap";
import PropTypes from "prop-types";
import "./styles.scss";

import {
  AppAsideToggler,
  AppNavbarBrand,
  AppSidebarToggler
} from "@coreui/react";
import { Button } from "reactstrap";
import firebase from "firebase";

const propTypes = {
  children: PropTypes.node
};

const defaultProps = {};

class DefaultHeader extends Component {
  constructor(props) {
    super(props);
    this.signOut = this.signOut.bind(this);
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  signOut() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.context.router.history.push("login");
      });
  }

  render() {
    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppSidebarToggler className="d-md-down-none" display="lg" />

        <Nav className="d-md-down-none" navbar>
          <NavItem className="px-3 nav-primary">
            <NavLink href="#/projects/my-board">My Board</NavLink>
          </NavItem>
          <NavItem className="px-3">
            <NavLink href="#/team">Team</NavLink>
          </NavItem>
          <NavItem className="px-3">
            <NavLink href="#/projects">Projects</NavLink>
          </NavItem>
          <NavItem className="px-3">
            <NavLink href="#/settings">Settings</NavLink>
          </NavItem>
        </Nav>
        <Nav className="ml-auto" navbar />
        <Button outline className="mr-1" onClick={() => this.signOut()}>
          <i className="fa fa-sign-out mr-1" />Sign out
        </Button>
        {/*<AppAsideToggler className="d-md-down-none" />*/}
        {/*<AppAsideToggler className="d-lg-none" mobile />*/}
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
