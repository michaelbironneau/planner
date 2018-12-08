import React, { Component } from "react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Button
} from "reactstrap";
import { getUsers, getUserWorkload } from "../../store/selectors";
import { connect } from "react-redux";
import * as moment from "moment";

const today = moment("2017-04-03");

const mapStateToProps = state => {
  const getUserWorkloadForDates = (start, finish) => {
    const users = getUsers(state);
    const workload = getUserWorkload(state, moment(start), moment(finish));
    for (let i = 0; i < users.length; i++) {
      users[i].workload = workload[users[i].id];
    }
    return users;
  };

  return {
    getUsers: getUserWorkloadForDates
  };
};

function getColorForWorkload(workload) {
  if (!workload) return "text-success";
  if (workload <= 3) {
    return "text-success";
  } else if (workload > 3 && workload <= 5) {
    return "text-warning";
  } else {
    return "text-danger";
  }
}

function UserRow(props) {
  const user = props.user;
  const userLink = `#/users/${user.id}`;

  return (
    <tr key={user.id.toString()}>
      <th scope="row">{user.id}</th>
      <td>{user.text}</td>
      <td className={"text-center " + getColorForWorkload(user.workload)}>
        {user.workload || 0}&nbsp;days
      </td>
      <td>£{user.rate}/day</td>
    </tr>
  );
}

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      weekStart: moment(today).startOf("week")
    };
    this.renderWeekNumber = this.renderWeekNumber.bind(this);
    this.incrementWeekstart = this.incrementWeekstart.bind(this);
  }

  incrementWeekstart(delta) {
    this.setState({
      ...this.state,
      weekStart: moment(this.state.weekStart)
        .clone()
        .add(delta, "week")
    });
  }

  renderWeekNumber() {
    const weekNumber = moment(this.state.weekStart).week();
    if (weekNumber === moment(today).week()) {
      return `This week`;
    } else {
      return `Week #${weekNumber}`;
    }
  }

  render() {
    const userList = this.props.getUsers(
      moment(this.state.weekStart),
      moment(this.state.weekStart).add(1, "week")
    );

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <i className="fa fa-users" /> Team
              </CardHeader>
              <CardBody>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Name</th>
                      <th scope="col" className="text-center">
                        <p>Workload</p>
                        <p>
                          <Button
                            outline
                            size="sm"
                            onClick={() => this.incrementWeekstart(-1)}
                          >
                            &lt;
                          </Button>
                          <span
                            style={{
                              fontSize: "0.8em",
                              paddingLeft: "5px",
                              paddingRight: "5px"
                            }}
                          >
                            {this.renderWeekNumber()}
                          </span>
                          <Button
                            outline
                            size="sm"
                            onClick={() => this.incrementWeekstart(1)}
                          >
                            &gt;
                          </Button>
                        </p>
                      </th>
                      <th scope="col">Rate</th>
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
