import React from "react";
import { TodoList } from "./components/TodoList";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-center text-2xl font-bold p-4 dark:bg-blue-950 text-white">SharePoint ToDo</h1>
      <TodoList />
    </div>
  );
};

export default App;
