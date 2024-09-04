import React from "react";
import Box from "@material-ui/core/Box";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import { getAllWidgets } from "../../utility/WidgetRegistry";
import Wrappers from "../../wrappers/index";
import ErrorBoundary from "../../utility/ErrorBoundary";

const RenderTree = (props) => {
  const { ComponentBlocks, Blocks } = props;
  const Widgets = getAllWidgets();

  const NodeTypeMap = {
    componentBlock: ComponentBlocks,
    widget: Widgets,
    block: Blocks,
  };

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
      Widget Error: {error} - Please check the configuration of "{key}"
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
                  if (NodeTypeMap?.["widget"]?.[key]?.component) {
                    CellComponent = NodeTypeMap?.["widget"]?.[key]?.component;
                  } else {
                    CellComponent = Blocks[key];
                    if (type) {
                      CellComponent = NodeTypeMap[type][key];
                    }
                  }

                  if (!CellComponent) {
                    console.warn(`Component still not found for ${key}`);
                    console.log(JSON.stringify(rows), "rows");
                  }

                  if (CellComponent) {
                    console.log(
                      `Type of CellComponent for ${key}:`,
                      typeof CellComponent
                    );

                    console.log(`Component found for ${key}`, CellComponent);

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
                    `Error rendering widget/component "${key}":`,
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
  Blocks: PropTypes.object.isRequired,
};

export default RenderTree;
