import React, { useEffect, useState } from "react";
import Box from "@material-ui/core/Box";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import { getAllWidgets } from "../../utility/WidgetRegistry";
import Wrappers from "../../wrappers/index";
import ErrorBoundary from "../../utility/ErrorBoundary";
import CircularProgress from "@material-ui/core/CircularProgress";
import Skeleton from "@material-ui/lab/Skeleton";

const DefaultErrorComponent = ({ error, key }) => (
  <Box
    border={1}
    borderColor="red"
    padding={2}
    margin={1}
    color="red"
    key={key}
  >
    Widget/Block Error: {error} - Please check the configuration of "{key}"
  </Box>
);

const RenderTree = (props) => {
  const [widgets, setWidgets] = useState({});
  const [blocks, setBlocks] = useState({});
  const [components, setComponents] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state

  const NodeTypeMap = {
    component: components,
    componentBlock: components,
    widget: widgets,
    block: blocks,
  };

  useEffect(() => {
    const fetchWidgets = async () => {
      const fetchedWidgets = getAllWidgets();
      console.log("Fetched Widgets (client-side):", fetchedWidgets);

      const fetchedBlocks = {};
      const fetchedWidgetsOnly = {};
      const fetchedComponents = {};

      for (const key in fetchedWidgets) {
        const widgetType = fetchedWidgets[key].type;

        if (widgetType === "block") {
          fetchedBlocks[key] = fetchedWidgets[key];
        } else if (widgetType === "component") {
          fetchedComponents[key] = fetchedWidgets[key];
        } else {
          fetchedWidgetsOnly[key] = fetchedWidgets[key];
        }
      }

      setBlocks(fetchedBlocks);
      setWidgets(fetchedWidgetsOnly);
      setComponents(fetchedComponents);
      setLoading(false); // Set loading to false after fetching
    };

    fetchWidgets();
  }, []);

  const { layout } = props;
  const tree = layout?.root;
  const elements = [];

  if (loading || !tree) {
    return (
      <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
        <CircularProgress />
        {/* <Skeleton variant="rect" width={210} height={118} /> */}
      </Box>
    );
  }

  const processRows = (rows) => {
    return rows?.map(({ cells, config }) => {
      const Wrapper = config?.wrapper
        ? Wrappers[config.wrapper]
        : Wrappers.DefaultContent;
      if (Wrapper) {
        return (
          <Wrapper key={`${config.wrapper}-${Math.random()}`}>
            {cells?.map((cell, index) => {
              const { rows, key, payload, type } = cell;
              const { muiWidths, props: widgetProps, muiHidden } = payload;

              let CellComponent = null;

              try {
                if (NodeTypeMap[type]?.[key]?.component) {
                  CellComponent = NodeTypeMap[type]?.[key]?.component;
                } else {
                  CellComponent = blocks[key];
                  if (type) {
                    CellComponent = NodeTypeMap[type]?.[key];
                  }
                }

                if (
                  typeof CellComponent === "object" &&
                  CellComponent?.component
                ) {
                  CellComponent = CellComponent.component;
                }

                if (!CellComponent) {
                  console.warn(
                    `Component still not found for ${key}`,
                    NodeTypeMap,
                    type,
                    key,
                    "type - key"
                  );
                } else {
                  console.log(`Component found for ${key}`, CellComponent);
                }

                if (CellComponent) {
                  let RenderedComponent;

                  // Handle Symbol(react.forward_ref) by rendering it properly
                  console.log("RenderedComponent - pre", CellComponent);

                  if (
                    typeof CellComponent === "object" &&
                    CellComponent.$$typeof === Symbol.for("react.forward_ref")
                  ) {
                    console.log("RenderedComponent - 0", RenderedComponent);

                    RenderedComponent = React.isValidElement(CellComponent)
                      ? React.cloneElement(CellComponent, {
                          parentProps: props,
                          widgetProps: widgetProps,
                          key: key,
                          payload: payload,
                        })
                      : React.createElement(CellComponent, {
                          parentProps: props,
                          widgetProps: widgetProps,
                          key: key,
                          payload: payload,
                        }); // Use React.createElement for cases where it's not an element yet

                    console.log("RenderedComponent - 2", RenderedComponent);
                  } else {
                    RenderedComponent = (
                      <ErrorBoundary key={index}>
                        <CellComponent
                          parentProps={props}
                          widgetProps={widgetProps}
                          key={key}
                          payload={payload}
                        />
                      </ErrorBoundary>
                    );
                  }

                  if (muiHidden) {
                    return (
                      <Hidden {...muiHidden} key={index}>
                        <Grid item display={"flex"} flex={1} {...muiWidths}>
                          {RenderedComponent}
                        </Grid>
                      </Hidden>
                    );
                  }

                  return (
                    <Grid
                      item
                      display={"flex"}
                      flex={1}
                      {...muiWidths}
                      key={index}
                    >
                      {RenderedComponent}
                    </Grid>
                  );
                }
              } catch (error) {
                console.error(`Error rendering widget/block "${key}":`, error);
                return (
                  <Grid
                    item
                    display={"flex"}
                    flex={1}
                    {...muiWidths}
                    key={index}
                  >
                    <DefaultErrorComponent error={error.message} key={key} />
                  </Grid>
                );
              }

              if (rows) {
                if (muiHidden) {
                  return (
                    <Hidden {...muiHidden} key={index}>
                      <Grid
                        item
                        {...muiWidths}
                        display={"flex"}
                        flexDirection={"column"}
                        justifyContent={"center"}
                        alignItems={"center"}
                      >
                        <Box
                          spacing={2}
                          justifyContent={"center"}
                          width={"auto"}
                        >
                          {processRows(rows)}
                        </Box>
                      </Grid>
                    </Hidden>
                  );
                }
                return (
                  <Grid
                    item
                    {...muiWidths}
                    display={"flex"}
                    flexDirection={"column"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    key={index}
                  >
                    <Box spacing={2} justifyContent={"center"} width={"auto"}>
                      {processRows(rows)}
                    </Box>
                  </Grid>
                );
              }

              return null;
            })}
          </Wrapper>
        );
      }
    });
  };

  return (
    <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
      {Object.keys(tree)?.map((section) => {
        const rows = tree[section].rows;
        elements.push(...processRows(rows));
        return null;
      })}
      {elements}
    </Box>
  );
};

RenderTree.propTypes = {
  layout: PropTypes.object,
  ComponentBlocks: PropTypes.object.isRequired,
  Blocks: PropTypes.object.isRequired,
  Widgets: PropTypes.object,
};

export default RenderTree;
