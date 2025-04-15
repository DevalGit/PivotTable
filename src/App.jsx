import React, { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Register the required module
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { RowGroupingModule, PivotModule } from "ag-grid-enterprise";
import TmpData from "./data.json";
// Register all community features
ModuleRegistry.registerModules([
  AllCommunityModule,
  RowGroupingModule,
  PivotModule,
]);

// Generate enhanced data with random values for carats and pcs if they don't exist
const generateEnhancedData = (rawData) => {
  return rawData.map((item) => {
    // Create a copy of the item
    const enhancedItem = { ...item };

    // Add carats if they don't exist (random number between 5-100)
    if (!enhancedItem.hasOwnProperty("carats")) {
      enhancedItem.carats = Math.floor(Math.random() * 95) + 5;
    }

    // Add pcs if they don't exist (random number between 10-500)
    if (!enhancedItem.hasOwnProperty("pcs")) {
      enhancedItem.pcs = Math.floor(Math.random() * 490) + 10;
    }

    return enhancedItem;
  });
};

// Enhance TmpData with random values for carats and pcs
const initialData = generateEnhancedData(TmpData);

// Add numeric fields to the columns array
const columns = [
  "department",
  "status",
  "location",
  "employees",
  "carats",
  "pcs",
];

const StatusCellRenderer = (params) => {
  const value = params.value || "0";

  const getIntensity = (val) => {
    // Convert to number if it's a string
    const numVal = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(numVal)) return 100;
    // Scale between 50-100 for visibility
    return Math.max(50, Math.min(100, 50 + (numVal / 10) * 50));
  };

  const intensity = getIntensity(value);
  const backgroundColor =
    params.colDef.headerName === "Completed"
      ? `rgba(40, 167, 69, ${intensity / 100})`
      : params.colDef.headerName === "In Progress"
      ? `rgba(0, 123, 255, ${intensity / 100})`
      : `rgba(255, 193, 7, ${intensity / 100})`;

  return (
    <div
      style={{
        backgroundColor,
        padding: "4px 8px",
        borderRadius: "4px",
        textAlign: "center",
        fontWeight: "bold",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {value}
    </div>
  );
};

// Draggable Field Component with improved styling
const DraggableField = ({ name, isNumeric }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "FIELD",
    item: { name, isNumeric },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        padding: "10px",
        margin: "5px",
        backgroundColor: isDragging
          ? "#e9ecef"
          : isNumeric
          ? "#e3f2fd"
          : "#f8f9fa", // Blue tint for numeric fields
        border: `1px solid ${isNumeric ? "#90caf9" : "#dee2e6"}`,
        borderRadius: "5px",
        textAlign: "center",
        cursor: "grab",
        opacity: isDragging ? 0.6 : 1,
        boxShadow: isDragging ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease-in-out",
        fontWeight: "500",
      }}
    >
      {name.toUpperCase()}
      {isNumeric && (
        <span
          style={{
            fontSize: "0.7rem",
            display: "block",
            marginTop: "2px",
            color: "#0d6efd",
          }}
        >
          (numeric)
        </span>
      )}
    </div>
  );
};

const DropZone = ({
  label,
  onDrop,
  currentValue,
  onRemove,
  acceptNumeric = true,
  onlyNumeric = false,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "FIELD",
    drop: (item) => {
      if (onlyNumeric && !item.isNumeric) {
        // Only accept numeric fields if configured that way
        return;
      }
      if (!acceptNumeric && item.isNumeric) {
        // Don't accept numeric fields if not configured to
        return;
      }
      onDrop(item.name);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        padding: "15px",
        border: `2px ${isOver ? "solid" : "dashed"} ${
          isOver ? "#0d6efd" : "#6c757d"
        }`,
        borderRadius: "8px",
        textAlign: "center",
        backgroundColor: isOver ? "rgba(13, 110, 253, 0.1)" : "#f8f9fa",
        minHeight: "80px",
        transition: "all 0.2s ease-in-out",
        boxShadow: isOver ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
        flex: 1,
      }}
    >
      <div style={{ marginBottom: "10px", fontWeight: "600" }}>{label}:</div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
        }}
      >
        {Array.isArray(currentValue) && currentValue.length > 0 ? (
          currentValue.map((field, index) => (
            <div
              key={index}
              style={{
                backgroundColor: onlyNumeric ? "#4caf50" : "#0d6efd",
                color: "white",
                padding: "8px 12px",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {field}
              <button
                onClick={() => onRemove(field)}
                style={{
                  background: "rgba(255,255,255,0.3)",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "10px",
                  padding: 0,
                }}
              >
                ✖
              </button>
            </div>
          ))
        ) : typeof currentValue === "string" && currentValue ? (
          <div
            style={{
              backgroundColor: onlyNumeric ? "#4caf50" : "#0d6efd",
              color: "white",
              padding: "8px 12px",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {currentValue}
            <button
              onClick={() => onRemove(currentValue)}
              style={{
                background: "rgba(255,255,255,0.3)",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "10px",
                padding: 0,
              }}
            >
              ✖
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#6c757d",
              color: "white",
              borderRadius: "5px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              fontWeight: "500",
              width: "100%",
            }}
          >
            {onlyNumeric ? "Drop numeric fields here" : "Drop a field here"}
          </div>
        )}
      </div>
    </div>
  );
};

// Pivot Table Component with AG Grid
export default function PivotTableAGGrid() {
  const [groupBy, setGroupBy] = useState([]); // Now an array for multi-field grouping
  const [subGroupBy, setSubGroupBy] = useState([]);
  const [valueFields, setValueFields] = useState([]); // New state for value fields
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [aggregationType, setAggregationType] = useState("sum");
  const [showAggregationMenu, setShowAggregationMenu] = useState(false);

  // Debug the enhanced data
  useEffect(() => {
    console.log("Enhanced initial data:", initialData);
  }, []);

  // Add this to your component (near the drag fields section)
  const AggregationMenu = () => (
    <div
      style={{
        position: "absolute",
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "8px",
        zIndex: 100,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {["sum", "avg", "count", "min", "max"].map((op) => (
        <div
          key={op}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            backgroundColor: aggregationType === op ? "#e9ecef" : "transparent",
            borderRadius: "4px",
          }}
          onClick={() => {
            setAggregationType(op);
            setShowAggregationMenu(false);
          }}
        >
          {op.toUpperCase()}
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    if (!valueFields.length || !groupBy.length) return;

    const buildSubGroupColumns = () => {
      const groupedStructure = {};

      // Step 1: Build nested object structure for subgroups
      initialData.forEach((item) => {
        let current = groupedStructure;
        subGroupBy.forEach((field, i) => {
          const value = item[field];
          if (!current[value]) {
            current[value] = i === subGroupBy.length - 1 ? null : {};
          }
          current = current[value];
        });
      });

      // If no subgroups, create a default "Values" group
      if (
        Object.keys(groupedStructure).length === 0 &&
        subGroupBy.length === 0
      ) {
        groupedStructure["Values"] = null;
      }

      // Step 2: Recursively build column definition
      const buildChildren = (node, path = []) => {
        return Object.entries(node).map(([key, value]) => {
          const newPath = [...path, key];
          if (value === null) {
            // Always nest valueFields inside leaf subgroup
            return {
              headerName: key.toUpperCase(),
              children: valueFields.map((valueField) => ({
                headerName: valueField.toUpperCase(),
                field: `${newPath.join("-")}-${valueField}`,
                cellRenderer: StatusCellRenderer,
                cellStyle: { padding: 0, backgroundColor: "#fde68a" },
                minWidth: 120,
                valueFormatter: (params) => {
                  if (params.value === undefined || params.value === null)
                    return "0";
                  return Number(params.value).toLocaleString();
                },
              })),
            };
          }
          return {
            headerName: key.toUpperCase(),
            children: buildChildren(value, newPath),
          };
        });
      };

      return buildChildren(groupedStructure);
    };

    // Step 3: Generate columnDefs including groupBy fields
    const cols = [
      ...groupBy.map((group) => ({
        headerName: group.toUpperCase(),
        field: group,
        pinned: "left",
        cellStyle: {
          fontWeight: "bold",
          backgroundColor: "#f8f9fa",
          borderRight: "1px solid #dee2e6",
        },
        minWidth: 150,
        maxWidth: 450,
        filter: "agTextColumnFilter",
      })),
      ...buildSubGroupColumns(),
    ];

    const groupedData = {};

    // Step 4: Build initial grouped rows
    initialData.forEach((item) => {
      const rowKey = groupBy.map((g) => item[g]).join("-");
      if (!groupedData[rowKey]) {
        groupedData[rowKey] = groupBy.reduce(
          (acc, g) => ({ ...acc, [g]: item[g] }),
          {}
        );
      }
    });

    // Step 5: Populate aggregation values
    initialData.forEach((item) => {
      const rowKey = groupBy.map((g) => item[g]).join("-");
      const subKey = subGroupBy.length
        ? subGroupBy.map((s) => item[s]).join("-")
        : "Values";

      valueFields.forEach((valueField) => {
        const fieldKey = `${subKey}-${valueField}`;

        if (!groupedData[rowKey][fieldKey]) {
          groupedData[rowKey][fieldKey] = {
            sum: 0,
            count: 0,
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
          };
        }

        const group = groupedData[rowKey][fieldKey];
        const numValue = Number(item[valueField] || 0);

        group.sum += numValue;
        group.count += 1;
        if (numValue < group.min) group.min = numValue;
        if (numValue > group.max) group.max = numValue;
      });
    });

    // Step 6: Apply aggregation logic
    for (const rowKey in groupedData) {
      const row = groupedData[rowKey];
      for (const fieldKey of Object.keys(row)) {
        if (groupBy.includes(fieldKey)) continue;

        const group = row[fieldKey];
        if (!group || typeof group !== "object") continue;

        switch (aggregationType) {
          case "sum":
            row[fieldKey] = group.sum;
            break;
          case "avg":
            row[fieldKey] = group.count
              ? parseFloat((group.sum / group.count).toFixed(2))
              : 0;
            break;
          case "count":
            row[fieldKey] = group.count;
            break;
          case "min":
            row[fieldKey] = group.min === Number.MAX_VALUE ? 0 : group.min;
            break;
          case "max":
            row[fieldKey] = group.max === Number.MIN_VALUE ? 0 : group.max;
            break;
          default:
            row[fieldKey] = group.sum;
            break;
        }
      }
    }

    setColumnDefs(cols);
    setRowData(Object.values(groupedData));
  }, [groupBy, subGroupBy, valueFields, aggregationType]);

  // AG Grid default column definition
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
      flex: 1,
      autoHeaderHeight: true,
      wrapHeaderText: true,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
    }),
    []
  );

  // Custom CSS for the grid
  const gridStyle = {
    height: "400px",
    width: "90%",
    borderRadius: "8px",
    padding: "5px 5px 5px 5px",
    overflow: "auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  // Handle dropping a field into the group by zone
  const handleGroupByDrop = (field) => {
    setGroupBy((prev) => [...new Set([...prev, field])]); // Ensure unique fields
  };

  const handleSubGroupByDrop = (field) => {
    setSubGroupBy((prev) => [...new Set([...prev, field])]);
  };

  const handleValueFieldDrop = (field) => {
    setValueFields((prev) => [...new Set([...prev, field])]);
  };

  const handleRemoveGroupBy = (fieldToRemove) => {
    setGroupBy(groupBy.filter((field) => field !== fieldToRemove));
  };

  const handleRemoveSubGroupBy = (fieldToRemove) => {
    setSubGroupBy(subGroupBy.filter((field) => field !== fieldToRemove));
  };

  const handleRemoveValueField = (fieldToRemove) => {
    setValueFields(valueFields.filter((field) => field !== fieldToRemove));
  };

  // Define numeric fields
  const numericFields = ["employees", "carats", "pcs"];
  const isNumericField = (field) => numericFields.includes(field);

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ maxWidth: "100%", margin: "auto", padding: "20px" }}>
        <h2
          style={{
            marginBottom: "20px",
            color: "#495057",
            textAlign: "center",
          }}
        >
          Interactive Pivot Table
        </h2>

        {/* Drag Fields Section */}
        <Card
          style={{
            padding: "20px",
            marginBottom: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Card.Header
            as="h5"
            style={{
              backgroundColor: "#f8f9fa",
              border: "none",
              padding: "15px",
            }}
          >
            Drag and Drop Fields
          </Card.Header>
          <Card.Body>
            <p className="text-muted mb-3">
              Drag fields below to change how data is displayed in the grid
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              {columns.map((col) => (
                <DraggableField
                  key={col}
                  name={col}
                  isNumeric={isNumericField(col)}
                />
              ))}
            </div>

            {/* Drop Zones */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >
              <DropZone
                label="Sub-Group by (Column)"
                onDrop={handleSubGroupByDrop}
                currentValue={subGroupBy}
                onRemove={handleRemoveSubGroupBy}
                acceptNumeric={false}
              />

              {/* Value Fields Drop Zone with onlyNumeric=true */}
              <DropZone
                label="Value Fields (for aggregation)"
                onDrop={handleValueFieldDrop}
                currentValue={valueFields}
                onRemove={handleRemoveValueField}
                acceptNumeric={true}
                onlyNumeric={true}
              />
            </div>

            <div style={{ position: "relative", marginTop: "20px" }}>
              <button
                onClick={() => setShowAggregationMenu(!showAggregationMenu)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Aggregation: {aggregationType.toUpperCase()} ▼
              </button>
              {showAggregationMenu && <AggregationMenu />}
            </div>
          </Card.Body>
        </Card>

        {/* AG Grid Section */}
        <div style={{ display: "flex" }}>
          <DropZone
            label="Group by (Column)"
            onDrop={handleGroupByDrop}
            currentValue={groupBy}
            onRemove={handleRemoveGroupBy}
            acceptNumeric={false}
          />
          <div className="ag-theme-alpine" style={gridStyle}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              rowHeight={48}
              sideBar={true}
              rowGroupPanelShow="always"
              headerHeight={48}
              // Ensure this is present
              rowClassRules={{
                "grid-row-even": (params) => params.rowIndex % 2 === 0,
                "grid-row-odd": (params) => params.rowIndex % 2 !== 0,
              }}
              getRowStyle={(params) => {
                if (params.rowIndex % 2 === 0) {
                  return { backgroundColor: "#ffffff" };
                }
                return { backgroundColor: "#f8f9fa" };
              }}
            />
          </div>
        </div>
      </div>

      {/* Additional styles */}
      <style jsx global>{`
        .ag-header-cell-custom {
          background-color: #007bff !important;
          color: white !important;
        }
        .ag-header-cell {
          font-weight: bold;
        }
        .ag-cell-value {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        .ag-header-cell-text {
          font-weight: 600;
        }
      `}</style>
    </DndProvider>
  );
}
