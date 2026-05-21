import React from "react";
import ReactDOM from "react-dom/client";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import DashboardPage from "./components/DashboardPage";
import DataInputPage from "./components/DataInputPage";
import ComputationPage from "./components/ComputationPage";
import CalibrationPage from "./components/CalibrationPage";
import ReportsPage from "./components/ReportsPage";
import ProjectListPage from "./components/ProjectListPage";

const path = window.location.pathname;
const params = new URLSearchParams(window.location.search);
const projectId = params.get('projectId') ? Number(params.get('projectId')) : null;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    {path === "/signup" ? (
      <SignUpPage />
    ) : path === "/dashboard" ? (
      <DashboardPage />
    ) : path === "/projects" ? (
      <ProjectListPage />
    ) : path === "/data-input" ? (
      <DataInputPage projectId={projectId} />
    ) : path === "/computation" ? (
      <ComputationPage projectId={projectId} />
    ) : path === "/calibration" ? (
      <CalibrationPage projectId={projectId} />
    ) : path === "/reports" ? (
      <ReportsPage />
    ) : (
      <LoginPage />
    )}
  </React.StrictMode>,
);
