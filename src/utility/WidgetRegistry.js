import axiosSling from "./AxiosSling";

const serviceUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001";
const widgetRegistry = {};

let initializingPromise = null;

const isBrowser = typeof window !== "undefined"; // Check if running in a browser

const initializeWidgetRegistry = async () => {
  if (isBrowser) {
    const cachedWidgets = localStorage.getItem("widgetRegistry");

    if (cachedWidgets && Object.keys(widgetRegistry).length === 0) {
      // If widgets are found in cache, populate the in-memory widgetRegistry
      Object.assign(widgetRegistry, JSON.parse(cachedWidgets));
      console.log("Loaded widgets from cache:", widgetRegistry);
    }
  }

  if (Object.keys(widgetRegistry).length === 0) {
    if (!initializingPromise) {
      initializingPromise = (async () => {
        try {
          const response = await axiosSling.post(
            `${serviceUrl}/v1/frontend/getWidgets`,
            { size: 1000 } // Fetch all widgets
          );

          const widgets = response.data?.widgets?.widgets || [];
          setWidgets(widgets);

          if (isBrowser) {
            // Cache the widgetRegistry in localStorage only in the browser
            localStorage.setItem(
              "widgetRegistry",
              JSON.stringify(widgetRegistry)
            );
          }
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

const compareProps = (props1, props2) => {
  if (props1.length !== props2.length) return false;

  return props1.every((prop1, index) => {
    const prop2 = props2[index];

    // Compare all individual keys within props
    const sameName = prop1.name === prop2.name;
    const samePropType = prop1.propType === prop2.propType;
    const sameDataType = prop1.dataType === prop2.dataType;

    // Compare default values (they can be string or number)
    const sameDefault = prop1.default == prop2.default; // Loose comparison for mixed types

    // Compare options (if they exist)
    let sameOptions = true;
    if (prop1.options && prop2.options) {
      if (prop1.options.length !== prop2.options.length) return false;

      sameOptions = prop1.options.every((option1, optionIndex) => {
        const option2 = prop2.options[optionIndex];
        return (
          option1.value === option2.value && option1.label === option2.label
        );
      });
    }

    return (
      sameName && samePropType && sameDataType && sameDefault && sameOptions
    );
  });
};

export const registerWidget = async (name, component, options = {}) => {
  await initializeWidgetRegistry();

  const {
    description,
    ownership,
    key,
    icon,
    props,
    availableToAllPages,
    config,
    type = "widget", // Default to 'widget', but can be 'block' or 'component'
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
    component, // Dynamically registering the component here
  };

  if (widgetRegistry[widgetKey]) {
    const existingWidget = widgetRegistry[widgetKey];

    let isDifferent =
      description !== existingWidget.description ||
      icon !== existingWidget.icon ||
      name !== existingWidget.name ||
      type !== existingWidget.type;
    console.log(isDifferent, "isDifferent - l1", widgetKey);

    isDifferent = !compareProps(props, existingWidget.props);

    console.log(isDifferent, "isDifferent - l2", widgetKey);

    if (isDifferent) {
      try {
        await axiosSling.put(`${serviceUrl}/v1/frontend/updateWidgetByKey`, {
          key,
          widget: widgetData,
        });
        if (isBrowser) {
          localStorage.removeItem("widgetRegistry"); // Clear cache if widget is updated (browser only)
        }
      } catch (err) {
        console.error("Error updating widget:", err);
      }
    } else {
      console.log(`Widget ${name} is already up to date.`);
    }
  } else {
    console.log("doesnt exist wnew widget widgetRegistry[widgetKey]");
    widgetData["ownership"] = "private";
    if (!widgetData.icon) {
      widgetData.icon = "widgets";
    }
    try {
      await axiosSling.post(`${serviceUrl}/v1/frontend/widgets`, widgetData);
      if (isBrowser) {
        localStorage.removeItem("widgetRegistry"); // Clear cache if a new widget is added (browser only)
      }
    } catch (err) {
      console.error("Error saving widget:", err);
    }
  }

  widgetRegistry[widgetKey] = widgetData;
  console.log(`Registered widget: ${widgetKey}`, widgetRegistry[widgetKey]);

  if (isBrowser) {
    // Update localStorage cache after registration (browser only)
    localStorage.setItem("widgetRegistry", JSON.stringify(widgetRegistry));
  }
};

export const setWidgets = (widgets) => {
  widgets.forEach((widget) => {
    if (!widgetRegistry[widget.key]) {
      widgetRegistry[widget.key] = { ...widget };
      console.log(
        `Registered widget: ${widget.key}`,
        widgetRegistry[widget.key]
      );
    }
  });
};

export const getAllWidgets = (type = null) => {
  if (type) {
    // Filter the registry based on type (widget, block, component)
    const filteredWidgets = Object.values(widgetRegistry).filter(
      (widget) => widget.type === type
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
