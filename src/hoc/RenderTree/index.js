import React, { useEffect, useState } from "react";
import Box from "@material-ui/core/Box";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import { getAllWidgets } from "../../utility/WidgetRegistry";
import Wrappers from "../../wrappers/index";
import ErrorBoundary from "../../utility/ErrorBoundary";

const RenderTree = (props) => {
  const {
    Components: directComponents,
    Widgets: directWidgets,
    Blocks: directBlocks,
  } = props;
  const [widgets, setWidgets] = useState({});
  const [blocks, setBlocks] = useState({}); // State to hold blocks
  const [components, setComponents] = useState({}); // State to hold components

  const NodeTypeMap = {
    component: components,
    componentBlock: components, // TODO: Remove this once we clean componentBlock from the code and database. This is only a fall back for old componentBlocks 
    widget: widgets,
    block: blocks, // Use dynamically fetched blocks here
  };

  useEffect(() => {
    // This will only run on the client side
    const fetchWidgets = async () => {
      const fetchedWidgets = getAllWidgets(); // Fetch widgets, blocks, and components (client-side only)
      console.log("Fetched Widgets (client-side):", fetchedWidgets);

      const fetchedBlocks = {}; // Object to store blocks
      const fetchedWidgetsOnly = {}; // Object to store widgets
      const fetchedComponents = {}; // Object to store components

      // Filter fetched widgets into blocks, widgets, and components based on type
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

      setBlocks(fetchedBlocks); // Set fetched blocks
      setWidgets(fetchedWidgetsOnly); // Set fetched widgets
      setComponents(fetchedComponents); // Set fetched components
    };

    fetchWidgets();
  }, []);

  console.log("Directly passed components:", directComponents);
  console.log("Fetched components:", components);

  const { layout } = props;
  const tree = layout?.root;
  const elements = [];

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

  const processRows = (rows) => {
    return rows?.map(({ cells, config }) => {
      if (config?.wrapper) {
        const Wrapper = Wrappers[config.wrapper];
        if (Wrapper) {
          return (
            <Wrapper key={config.wrapper}>
              {cells?.map((cell, index) => {
                const { rows, key, payload, type } = cell;
                const { muiWidths, props: widgetProps, muiHidden } = payload;

                let CellComponent = null;

                try {
                  // Determine if it's a widget, block, or componentBlock
                  if (NodeTypeMap[type]?.[key]?.component) {
                    CellComponent = NodeTypeMap[type]?.[key]?.component;
                  } else {
                    CellComponent = blocks[key]; // Use dynamic blocks
                    if (type) {
                      CellComponent = NodeTypeMap[type]?.[key];
                    }
                  }

                  // Handle blocks
                  if (
                    typeof CellComponent === "object" &&
                    CellComponent?.component
                  ) {
                    CellComponent = CellComponent.component;
                  }

                  if (!CellComponent) {
                    console.warn(`Component still not found for ${key}`, NodeTypeMap, type, key, 'type - key');
                  } else {
                    console.log(`Component found for ${key}`, CellComponent);
                  }

                  if (CellComponent) {
                    const RenderedComponent = (
                      <ErrorBoundary key={index}>
                        <CellComponent
                          parentProps={props}
                          widgetProps={widgetProps}
                          key={key}
                          payload={payload}
                        />
                      </ErrorBoundary>
                    );

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
                  console.error(
                    `Error rendering widget/block "${key}":`,
                    error
                  );
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
      }
      return null;
    });
  };

  return (
    <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
      {Object.keys(tree).map((section) => {
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
  Blocks: PropTypes.object.isRequired, // Optional, as we are now fetching blocks dynamically
  Widgets: PropTypes.object, // Widgets can be passed too
};

export default RenderTree;
