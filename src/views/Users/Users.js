import React, { Component } from "react";
import { Badge, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { getUsers, getUserWorkload } from "../../store/selectors";
import { connect } from "react-redux";
import usersData from "./UsersData";
import * as moment from "moment";

const mapStateToProps = state => {
  const users = getUsers(state);
  const workload = getUserWorkload(
    state,
    moment("2017-03-01T00:00:00Z"),
    moment("2018-04-10T00:00:00Z")
  );
  for (let i = 0; i < users.length; i++) {
    users[i].workload = workload[users[i].id];
  }
  console.log(users);
  return {
    users: users
  };
};

function UserRow(props) {
  const user = props.user;
  const userLink = `#/users/${user.id}`;

  const getBadge = status => {
    return status === "Active"
      ? "success"
      : status === "Inactive"
      ? "secondary"
      : status === "Pending"
      ? "warning"
      : status === "Banned"
      ? "danger"
      : "primary";
  };

  return (
    <tr key={user.id.toString()}>
      <th scope="row">
        <a href={userLink}>{user.id}</a>
      </th>
      <td>
        <a href={userLink}>{user.name}</a>
      </td>
      <td>{user.registered}</td>
      <td>{user.role}</td>
      <td>
        <Badge href={userLink} color={getBadge(user.status)}>
          {user.status}
        </Badge>
      </td>
    </tr>
  );
}

class Users extends Component {
  render() {
    const userList = usersData.filter(user => user.id < 10);

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify" /> Users{" "}
                <small className="text-muted">example</small>
              </CardHeader>
              <CardBody>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th scope="col">id</th>
                      <th scope="col">name</th>
                      <th scope="col">registered</th>
                      <th scope="col">role</th>
                      <th scope="col">status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((user, index) => (
                      <UserRow key={index} user={user} />
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Users);
