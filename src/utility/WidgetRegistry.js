import axiosSling from "./AxiosSling";

const serviceUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001";
const widgetRegistry = {};

let initializingPromise = null;

const initializeWidgetRegistry = async () => {
  if (Object.keys(widgetRegistry).length === 0) {
    if (!initializingPromise) {
      initializingPromise = (async () => {
        try {
          const response = await axiosSling.post(
            `${serviceUrl}/v1/frontend/getWidgets`,
            { size: 1000 } // Temporary fix to fetch all widgets
          );

          const widgets = response.data?.widgets?.widgets || [];
          setWidgets(widgets);
        } catch (error) {
          console.error(
            "Error fetching widgets from the database:",
            error.message
          );
        } finally {
          initializingPromise = null;
        }
      })();
    }
    await initializingPromise;
  }
};

export const registerWidget = async (name, component, options = {}) => {
  await initializeWidgetRegistry();

  const {
    description,
    ownership,
    type,
    key,
    icon,
    props,
    availableToAllPages,
    config,
    requiredProps,
    widgetType = "widget", // Default to 'widget', but can be 'block' or 'component'
  } = options;

  const widgetKey = key;

  const widgetData = {
    name,
    description,
    type,
    key: widgetKey,
    icon,
    ownership,
    props,
    availableToAllPages,
    config,
    requiredProps,
    component, // Dynamically registering the component here
    widgetType, // Added widgetType to differentiate between widget, block, and component
  };

  // Update the registry with the latest component and data
  widgetRegistry[widgetKey] = widgetData;
  console.log(widgetRegistry[widgetKey], 'widgetRegistry[widgetKey]', key);

  if (widgetRegistry[widgetKey]) {
    const existingWidget = widgetRegistry[widgetKey];

    const isDifferent =
      description !== existingWidget.description ||
      icon !== existingWidget.icon ||
      name !== existingWidget.name ||
      JSON.stringify(props) !== JSON.stringify(existingWidget.props) ||
      type !== existingWidget.type ||
      JSON.stringify(requiredProps) !== JSON.stringify(existingWidget.requiredProps) ||
      widgetType !== existingWidget.widgetType;

    if (isDifferent) {
      try {
        await axiosSling.put(`${serviceUrl}/v1/frontend/updateWidgetByKey`, {
          key,
          widget: widgetData,
        });
      } catch (err) {
        console.error("Error updating widget:", err);
      }
    } else {
      console.log(`Widget ${name} is already up to date.`);
    }
  } else {
    try {
      await axiosSling.post(`${serviceUrl}/v1/frontend/widgets`, widgetData);
    } catch (err) {
      console.error("Error saving widget:", err);
    }
  }
};

export const setWidgets = (widgets) => {
  widgets.forEach((widget) => {
    if (!widgetRegistry[widget.key]) {
      widgetRegistry[widget.key] = { ...widget };
      console.log(`Registered widget: ${widget.key}`, widgetRegistry[widget.key]);
    }
  });
};

export const getAllWidgets = (type = null) => {
  if (type) {
    // Filter the registry based on widgetType (widget, block, component)
    const filteredWidgets = Object.values(widgetRegistry).filter(
      (widget) => widget.widgetType === type
    );
    console.log(`Returning ${type} widgets:`, filteredWidgets);
    return filteredWidgets;
  }
  console.log("Returning all registered widgets:", widgetRegistry);
  return widgetRegistry;
};

export default {
  fetchWidgetsFromDB: initializeWidgetRegistry,
  registerWidget,
  setWidgets,
  getAllWidgets,
};
