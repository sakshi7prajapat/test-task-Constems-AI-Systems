import { useState, useMemo } from "react";
import Papa from "papaparse";
import "./App.css";

export default function App() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const columns = useMemo(() => (rows.length ? Object.keys(rows[0]) : []), [rows]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a .csv file");
      return;
    }
    setError("");
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data);
        setFilters({});
      },
      error: (err) => setError(err.message),
    });
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.entries(filters).every(
        ([col, value]) =>
          !value || String(row[col] ?? "").toLowerCase().includes(value.toLowerCase())
      )
    );
  }, [rows, filters]);

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="app">
      <header className="header">
        <h1>CSV Viewer</h1>
        <p>Upload a CSV file, then filter it by any column.</p>
      </header>

      <div className="upload-card">
        <label className="upload-btn">
          Choose CSV file
          <input type="file" accept=".csv" onChange={handleUpload} hidden />
        </label>
        <span className="file-name">{fileName || "No file selected"}</span>
      </div>

      {error && <div className="error">{error}</div>}

      {rows.length > 0 && (
        <div className="table-card">
          <div className="toolbar">
            <span className="count">
              Showing <strong>{filteredRows.length}</strong> of{" "}
              <strong>{rows.length}</strong> rows
            </span>
            <button
              className="clear-btn"
              onClick={() => setFilters({})}
              disabled={!hasFilters}
            >
              Clear filters
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
                <tr className="filter-row">
                  {columns.map((col) => (
                    <th key={col}>
                      <input
                        placeholder={`Filter ${col}`}
                        value={filters[col] || ""}
                        onChange={(e) => setFilters({ ...filters, [col]: e.target.value })}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, i) => (
                    <tr key={i}>
                      {columns.map((col) => (
                        <td key={col}>{row[col]}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="empty" colSpan={columns.length}>
                      No rows match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}