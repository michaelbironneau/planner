import * as React from "react";
import { Component } from "react";
import {
  Card,
  Container,
  Form,
  FormGroup,
  CardHeader,
  CardBody,
  Table,
  Input,
  Button,
  Label,
  Alert
} from "reactstrap";

import { connect } from "react-redux";
import {
  getProjects,
  getProjectKPIs,
  getTaskDisplayName
} from "../../store/selectors";
import ReactToPrint from "react-to-print";

import * as moment from "moment";

const round = number => {
  console.log(0.01 * Math.round(number * 100));
  return 0.01 * Math.round(number * 100);
};

function weeksInYear(year) {
  return Math.max(
    moment(new Date(year, 11, 31)).isoWeek(),
    moment(new Date(year, 11, 31 - 7)).isoWeek()
  );
}

const weeksInRange = (start, finish) => {
  if (!start || !finish) return [];
  if (start.week() >= finish.week()) {
    //straddling two years.
    const lastWeekNumber = weeksInYear(start.year());
    const weeksInFirstYear = Array.from(
      { length: lastWeekNumber - start.week() + 1 },
      (v, k) => k + start.week()
    );
    const weeksInSecondYear = Array.from(
      { length: finish.week() },
      (v, k) => k + 1
    );
    return [...weeksInFirstYear, ...weeksInSecondYear];
  }
  return Array.from(
    { length: finish.week() - start.week() + 1 },
    (v, k) => k + start.week()
  );
};

const mapStateToProps = state => {
  return {
    projects: getProjects(state),
    getProjectKPIs: projectID => getProjectKPIs(state, projectID),
    getTaskDisplayName: taskID => getTaskDisplayName(state, taskID)
  };
};

class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectId: null
    };
    this.changeProject = this.changeProject.bind(this);
  }

  changeProject(e) {
    this.setState({
      ...this.state,
      projectId: e.target.value
    });
  }

  reduceStats(stats, weekNumber, key) {
    let ret = 0;
    stats.forEach(stat => {
      stat.stats.forEach(s => {
        if (weekNumber === null || s.weekStart === weekNumber) ret += s[key];
      });
    });
    return round(ret);
  }

  reduceStatsByOwner(stats, weekNumber, ownerText, key) {
    let ret = 0;
    stats.forEach(stat => {
      if (ownerText != null && stat.owner.text !== ownerText) return;
      stat.stats.forEach(s => {
        if (weekNumber != null && s.weekStart !== weekNumber) return;
        ret += s[key];
      });
    });
    return round(ret);
  }

  getDistinctOwners(stats) {
    const owners = {};
    stats.stats.forEach(stat => {
      if (!owners[stat.owner.text]) owners[stat.owner.text] = true;
    });
    return Object.keys(owners);
  }

  renderUnassignedWarning(stats) {
    const unassigned = stats.stats.find(
      stat => stat.owner.text === "Unassigned"
    );
    if (unassigned) {
      return (
        <Alert color="warning">
          This project has unassigned tasks. The internal cost has been
          calculated based on the mean rate of the team.
        </Alert>
      );
    } else {
      return "";
    }
  }

  renderResourceTable(stats) {
    const start = moment(stats.scheduling.start);
    const finish = moment(stats.scheduling.finish);
    return (
      <div>
        <Table responsive hover>
          <thead>
            <tr>
              <th scope="col">Resource</th>
              <th scope="col" colSpan={6} className="center-text">
                Man-days (by week #)
              </th>
            </tr>
            <tr>
              <th>&nbsp;</th>
              {weeksInRange(start, finish).map(weekNumber => {
                return <th key={weekNumber}>{weekNumber}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {this.getDistinctOwners(stats).map(ownerName => {
              return (
                <tr key={ownerName}>
                  <td>{ownerName}</td>
                  {weeksInRange(start, finish).map(weekNumber => {
                    return (
                      <td key={weekNumber}>
                        {this.reduceStatsByOwner(
                          stats.stats,
                          weekNumber,
                          ownerName,
                          "apportionedDuration"
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr style={{ borderTop: "2px solid darkgrey" }}>
              <td className="text-right">
                <em>Subtotals</em>
              </td>
              {weeksInRange(start, finish).map(weekNumber => {
                return (
                  <td key={weekNumber}>
                    <strong>
                      {this.reduceStatsByOwner(
                        stats.stats,
                        weekNumber,
                        null,
                        "apportionedDuration"
                      )}
                    </strong>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </Table>
        <span className="pull-right">
          <strong>
            Total:{" "}
            {this.reduceStatsByOwner(
              stats.stats,
              null,
              null,
              "apportionedDuration"
            )}{" "}
            man-days
          </strong>
        </span>
      </div>
    );
  }

  renderCostsTable(stats) {
    const start = moment(stats.scheduling.start);
    const finish = moment(stats.scheduling.finish);
    return (
      <div>
        <Table responsive hover>
          <thead>
            <tr>
              <th scope="col">Activity</th>
              <th scope="col" colSpan={6} className="center-text">
                Internal Costs (by week #)
              </th>
            </tr>
            <tr>
              <th>&nbsp;</th>
              {weeksInRange(start, finish).map(weekNumber => {
                return <th key={weekNumber}>{weekNumber}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {stats.stats.map(task => {
              return (
                <tr key={task.name}>
                  <td>{task.name}</td>
                  {weeksInRange(start, finish).map(weekNumber => {
                    return (
                      <td key={weekNumber}>
                        £
                        {round(
                          (
                            task.stats.find(
                              s => s.weekStart === weekNumber
                            ) || { internalCost: 0 }
                          ).internalCost
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr style={{ borderTop: "2px solid darkgrey" }}>
              <td className="text-right">
                <em>Subtotals</em>
              </td>
              {weeksInRange(start, finish).map(weekNumber => {
                return (
                  <td key={weekNumber}>
                    <strong>
                      £
                      {this.reduceStats(
                        stats.stats,
                        weekNumber,
                        "internalCost"
                      )}
                    </strong>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </Table>
        <span className="pull-right">
          <strong>
            Total: £{this.reduceStats(stats.stats, null, "internalCost")}
          </strong>
        </span>
        <br />
        <br />
        <br />
        <Table responsive hover>
          <thead>
            <tr>
              <th scope="col">Activity</th>
              <th scope="col" colSpan={6} className="center-text">
                External Costs (by week #)
              </th>
            </tr>
            <tr>
              <th>&nbsp;</th>
              {weeksInRange(start, finish).map(weekNumber => {
                return <th key={weekNumber}>{weekNumber}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {stats.stats.map(task => {
              return (
                <tr key={task.name}>
                  <td>{task.name}</td>
                  {weeksInRange(start, finish).map(weekNumber => {
                    return (
                      <td key={weekNumber}>
                        £
                        {round(
                          (
                            task.stats.find(
                              s => s.weekStart === weekNumber
                            ) || { externalCost: 0 }
                          ).externalCost
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr style={{ borderTop: "2px solid darkgrey" }}>
              <td className="text-right">
                <em>Subtotals</em>
              </td>
              {weeksInRange(start, finish).map(weekNumber => {
                return (
                  <td key={weekNumber}>
                    <strong>
                      £
                      {this.reduceStats(
                        stats.stats,
                        weekNumber,
                        "externalCost"
                      )}
                    </strong>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </Table>
        <span className="pull-right">
          <strong>
            Total: £{this.reduceStats(stats.stats, null, "externalCost")}
          </strong>
        </span>
        <br />
        <br />
        <br />
      </div>
    );
  }

  renderEmptyTable() {
    return <p>Please select a project from the dropdown.</p>;
  }

  renderNonemptyTable() {
    const stats = this.props.getProjectKPIs(this.state.projectId);
    return (
      <div>
        <h1>Project Name</h1>
        <h4 className="text-center">Scheduling</h4>
        <p>Start:&nbsp;{moment(stats.scheduling.start).calendar()}</p>
        <p>
          Finish (estimate):&nbsp;{moment(stats.scheduling.finish).calendar()}
        </p>
        <h4 className="text-center">Costs</h4>
        {this.renderUnassignedWarning(stats)}
        {this.renderCostsTable(stats)}
        <h4 className="text-center">Resources</h4>
        {this.renderResourceTable(stats)}
      </div>
    );
  }

  renderPrintableContent() {
    return (
      <Container>
        <Card>
          <CardHeader>
            <Form inline>
              <Label>
                <i className="fa fa-bars" />
                &nbsp;Project Card &nbsp;
              </Label>
              <Input type="select" onChange={e => this.changeProject(e)}>
                <option key="none" value={null}>
                  Select Project
                </option>
                {this.props.projects.map(project => {
                  return (
                    <option key={project.id} value={project.id}>
                      {this.props.getTaskDisplayName(project.id)}
                    </option>
                  );
                })}
              </Input>
            </Form>
          </CardHeader>

          <CardBody>
            {this.state.projectId
              ? this.renderNonemptyTable()
              : this.renderEmptyTable()}
          </CardBody>
        </Card>
      </Container>
    );
  }

  render() {
    return (
      <div>
        <ReactToPrint
          trigger={() => (
            <Button outline color="primary" className="pull-right">
              <i className="fa fa-print" />
              &nbsp;Print
            </Button>
          )}
          content={() => this.componentRef}
        />
        <div ref={el => (this.componentRef = el)}>
          {this.renderPrintableContent()}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Projects);
