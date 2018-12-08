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
  Label
} from "reactstrap";

class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderResourceTable() {
    return (
      <div>
        <Table responsive hover>
          <thead>
            <tr>
              <th scope="col">Resource</th>
              <th scope="col" colspan="6" className="center-text">
                Man-days (by week #)
              </th>
            </tr>
            <tr>
              <th>&nbsp;</th>
              <th>11</th>
              <th>12</th>
              <th>13</th>
              <th>14</th>
              <th>15</th>
              <th>16</th>
            </tr>
          </thead>
        </Table>
        <span class="pull-right">
          <strong>Total: 0 man-days</strong>
        </span>
      </div>
    );
  }

  renderCostsTable() {
    return (
      <div>
        <Table responsive hover>
          <thead>
            <tr>
              <th scope="col">Activity</th>
              <th scope="col" colspan="6" className="center-text">
                Internal Costs (by week #)
              </th>
            </tr>
            <tr>
              <th>&nbsp;</th>
              <th>11</th>
              <th>12</th>
              <th>13</th>
              <th>14</th>
              <th>15</th>
              <th>16</th>
            </tr>
          </thead>
        </Table>
        <span class="pull-right">
          <strong>Total: £0</strong>
        </span>
        <Table responsive hover>
          <thead>
            <tr>
              <th scope="col">Activity</th>
              <th scope="col" colspan="6" className="center-text">
                External Costs (by week #)
              </th>
            </tr>
            <tr>
              <th>&nbsp;</th>
              <th>11</th>
              <th>12</th>
              <th>13</th>
              <th>14</th>
              <th>15</th>
              <th>16</th>
            </tr>
          </thead>
        </Table>
        <span class="pull-right">
          <strong>Total: £0</strong>
        </span>
      </div>
    );
  }

  render() {
    return (
      <Container>
        <Card>
          <CardHeader>
            <Form inline>
              <Label>
                <i className="fa fa-bars" />
                &nbsp;Project Card &nbsp;
              </Label>
              <Input type="select">
                <option>A</option>
              </Input>
            </Form>
          </CardHeader>

          <CardBody>
            <h4 className="text-center">Scheduling</h4>
            <p>Start:</p>
            <p>Finish:</p>
            <h4 className="text-center">Costs</h4>
            {this.renderCostsTable()}
            <h4 className="text-center">Resources</h4>
            {this.renderResourceTable()}
          </CardBody>
        </Card>
      </Container>
    );
  }
}

export default Projects;
