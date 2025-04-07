import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="text-4xl font-bold text-indigo-900 p-4">
              Hello World
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
