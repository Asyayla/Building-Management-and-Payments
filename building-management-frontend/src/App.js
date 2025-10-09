import React, { useState } from "react";
import ApartmentsPage from "./pages/ApartmentsPage";
import PaymentsPage from "./pages/PaymentsPage"; 

function App() {
  const [currentPage, setCurrentPage] = useState("apartments");

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-blue-600 text-white p-4 flex justify-center space-x-4">
        <button
          onClick={() => setCurrentPage("apartments")}
          className="px-4 py-2 rounded bg-blue-400 hover:bg-blue-500 transition-colors duration-300"
        >
          Apartments
        </button>

        <button
          onClick={() => setCurrentPage("payments")} 
          className="px-4 py-2 rounded bg-green-400 hover:bg-green-500 transition-colors duration-300"
        >
          Payments
        </button>
      </header>

      <main className="p-6">
        {currentPage === "apartments" && <ApartmentsPage />}
        {currentPage === "payments" && <PaymentsPage />} {/* ✅ PaymentsPage render */}
      </main>
    </div>
  );
}

export default App;
