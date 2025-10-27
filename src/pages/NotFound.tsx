import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex items-center justify-center flex-col min-h-screen space-y-4">
      <div>Page not found</div>
      <Link to="/" className="bg-black text-white p-3.5 rounded-lg">Go back to Home</Link>
    </div>
  );
}

export default NotFound;
