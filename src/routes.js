import React from "react";
import Loadable from "react-loadable";

import DefaultLayout from "./containers/DefaultLayout";
import NewProject from "./views/NewProject/NewProject";
import MyBoard from "./views/MyBoard/MyBoard";
import Task from "./views/Task/Task";
import Projects from "./views/Projects/Projects";

function Loading() {
  return <div>Loading...</div>;
}

const Dashboard = Loadable({
  loader: () => import("./views/Dashboard"),
  loading: Loading
});

const Users = Loadable({
  loader: () => import("./views/Users/Users"),
  loading: Loading
});

const User = Loadable({
  loader: () => import("./views/Users/User"),
  loading: Loading
});

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: "/", exact: true, name: "Home", component: DefaultLayout },
  { path: "/dashboard", name: "Programme View", component: Dashboard },
  { path: "/team", exact: true, name: "Team", component: Users },
  { path: "/projects", exact: true, name: "Projects", component: Projects },
  {
    path: "/projects/new",
    exact: true,
    name: "New Project",
    component: NewProject
  },
  {
    path: "/projects/my-board",
    exact: true,
    name: "My Board",
    component: MyBoard
  },
  {
    path: "/tasks/:id",
    exact: true,
    name: "Task view",
    component: Task
  },
  { path: "/users/:id", exact: true, name: "User Details", component: User }
];

export default routes;
