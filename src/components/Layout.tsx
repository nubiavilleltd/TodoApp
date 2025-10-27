import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900">
      <h1 className="text-center text-2xl font-bold p-4 bg-blue-950 text-white">
        SharePoint ToDo
      </h1>
      <Outlet />
    </div>
  );
}

export default Layout;
