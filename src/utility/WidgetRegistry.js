import axiosSling from "./AxiosSling";

const serviceUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001";
const widgetRegistry = {};

async function initializeWidgetRegistry() {
  if (Object.keys(widgetRegistry).length === 0) {
    // Initialize registry if empty
    try {
      console.log(
        `${serviceUrl}/v1/frontend/getWidgets`,
        "${serviceUrl}/v1/frontend/getWidgets"
      );

      const response = await axiosSling.post(
        `${serviceUrl}/v1/frontend/getWidgets`,
        { size: 1000 } // To be updated. This is a temporary fix to fetch all widgets
      );

      // Extracting the widgets array from the response
      const widgets = response.data?.widgets?.widgets || [];

      // Assuming setWidgets is a function that updates the widget registry
      setWidgets(widgets);
    } catch (error) {
      console.error("Error fetching widgets from the database:", error.message);
    }
  }
}
export async function registerWidget(name, component, options = {}) {
  await initializeWidgetRegistry(); // Ensure registry is initialized before proceeding

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
  } = options;

  const widgetKey = key; // Use name as the unique key

  const widgetData = {
    name,
    description,
    type,
    key,
    icon,
    ownership,
    props,
    availableToAllPages,
    config,
    requiredProps,
  };
 
  if (widgetRegistry[widgetKey]) {
    console.warn(`Widget with name ${name} is already registered. Updating...`);

    // Update the existing widget
    try {
      //TODO - rEmove the commented code later
      await axiosSling.put(`${serviceUrl}/v1/frontend/updateWidgetByKey`, {
        key,
        widget: widgetData,
      });
      widgetRegistry[widgetKey] = { component, metadata: widgetData };
    } catch (err) {
      console.error("Error updating widget metadata:", err);
    }
  } else {
    // Create a new widget
    widgetRegistry[widgetKey] = { component, metadata: widgetData };

    try {
      const response = await axiosSling.post(
        `${serviceUrl}/v1/frontend/widgets`,
        widgetData
      );
      widgetRegistry[widgetKey]._id = response.data._id; // Store the ID from the response
    } catch (err) {
      console.error("Error saving widget metadata:", err.message);
    }
  }
}

// This function is used to update the widget registry with the widgets fetched from the database
export function setWidgets(widgets) {
  widgets.forEach((widget) => {
    widgetRegistry[widget.key] = widget;
  });
}

export function getAllWidgets() {
  return widgetRegistry;
}

export default {
  fetchWidgetsFromDB: initializeWidgetRegistry, // Optional if you want to expose it separately
  registerWidget,
  setWidgets,
  getAllWidgets,
};
