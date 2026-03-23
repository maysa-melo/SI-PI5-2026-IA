import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { Patients } from "./pages/Patients";
import { Consultation } from "./pages/Consultation";
import { MedicalRecord } from "./pages/MedicalRecord";
import { PatientHistory } from "./pages/PatientHistory";
import { NewRecord } from "./pages/NewRecord";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "pacientes", Component: Patients },
    ]
  },
  {
    path: "/novo-prontuario",
    Component: NewRecord
  },
  {
    path: "/consulta",
    Component: Consultation
  },
  {
    path: "/prontuario",
    Component: MedicalRecord
  },
  {
    path: "/paciente/:id",
    Component: PatientHistory
  },
]);