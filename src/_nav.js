export default {
  items: [
    {
      name: "Programme View",
      url: "/dashboard",
      icon: "icon-calendar"
    },
    {
      name: "Projects",
      url: "/projects",
      icon: "icon-list",
      children: [
        {
          name: "New",
          url: "/projects/new",
          icon: "icon-plus"
        },
        {
          name: "Dashboard",
          url: "/projects/dashboard",
          icon: "icon-speedometer"
        }
      ]
    },
    {
      name: "Settings",
      url: "/settings",
      icon: "icon-settings"
    }
  ]
};
