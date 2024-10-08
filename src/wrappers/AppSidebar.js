import React from "react";
import Hidden from "@material-ui/core/Hidden";
import Drawer from "@material-ui/core/Drawer";
import clsx from "clsx";
import Card from "@material-ui/core/Card";
import { Box } from "@material-ui/core";
import useStyles from "./AppsContainer/index.style";
import { makeStyles } from "@material-ui/core/styles";

const AppSidebar = (props) => {
  const {
    isAppDrawerOpen,
    footer,
    navStyle,
    fullView,
    style,
    sidebarContent,
    children,

    muiWidths,
  } = props;

  const classes = useStyles({ footer, navStyle, fullView });
  const useStylesBase = makeStyles({
    root: {
      ...style,
    },
  });
  const classesBase = useStylesBase();
  const className = clsx(classes.appsSidebar, classesBase.root);

  return (
    <Box className={className} {...muiWidths}>
      <Hidden lgUp>
        <Drawer
          open={isAppDrawerOpen}
          onClose={(ev) => {}}
          classes={{
            paper: clsx(classes.appSidebarDrawer),
          }}
          style={{ position: "absolute" }}
        >
          {sidebarContent || children}
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Card>{sidebarContent || children}</Card>
      </Hidden>
    </Box>
  );
};

export default AppSidebar;
