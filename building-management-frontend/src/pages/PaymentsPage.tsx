import React, { useEffect, useState } from "react";

interface Apartment {
  id: number;
  block: string;
  floor: number;
  number: number;
}

interface Payment {
  id: number;
  apartment: string;
  apartmentId: number;
  amount: number;
  paid: boolean;
  createdAt: string; // ISO 8601 format
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedApartmentId, setSelectedApartmentId] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [paid, setPaid] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editApartmentId, setEditApartmentId] = useState<number>(0);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editPaid, setEditPaid] = useState<boolean>(false);

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const paymentsRes = await fetch("http://127.0.0.1:5287/api/payments");
      const paymentsData: Payment[] = await paymentsRes.json();
      setPayments(paymentsData);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchPayments();

        const apartmentsRes = await fetch("http://127.0.0.1:5287/api/apartments");
        const apartmentsData: Apartment[] = await apartmentsRes.json();
        setApartments(apartmentsData);

        if (apartmentsData.length > 0) {
          setSelectedApartmentId(apartmentsData[0].id);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Add payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");

    try {
      const res = await fetch("http://127.0.0.1:5287/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartmentId: selectedApartmentId, amount, paid }),
      });

      if (!res.ok) throw new Error("Failed to add payment");

      setAmount(0);
      setPaid(false);
      setSuccessMessage("Payment added successfully! ✅");

      await fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Payment eklenemedi!");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete payment
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:5287/api/payments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete payment");

      await fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Payment could not be deleted!");
    }
  };

  // Toggle paid
  const togglePaid = async (payment: Payment) => {
    try {
      const res = await fetch(`http://127.0.0.1:5287/api/payments/${payment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payment.id,
          apartmentId: payment.apartmentId,
          amount: payment.amount,
          paid: !payment.paid,
        }),
      });

      if (!res.ok) throw new Error("Failed to update payment");

      await fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Payment could not be updated!");
    }
  };

  // Start editing
  const startEdit = (payment: Payment) => {
    setEditingId(payment.id);
    setEditApartmentId(payment.apartmentId);
    setEditAmount(payment.amount);
    setEditPaid(payment.paid);
  };

  // Cancel editing
  const cancelEdit = () => setEditingId(null);

  // Save editing
  const saveEdit = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:5287/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          apartmentId: editApartmentId,
          amount: editAmount,
          paid: editPaid,
        }),
      });

      if (!res.ok) throw new Error("Failed to update payment");

      await fetchPayments();
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Payment could not be updated!");
    }
  };

  if (loading) return <p>Loading payments...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">💳 Payments</h1>

      {successMessage && (
        <div className="p-3 bg-green-100 text-green-800 border border-green-300 rounded">
          {successMessage}
        </div>
      )}

      {/* Payment Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 border rounded-lg bg-gray-50 max-w-md space-y-4 shadow-md"
      >
        <div>
          <label className="block mb-1 font-medium text-gray-700">Apartment:</label>
          <select
            value={selectedApartmentId}
            onChange={(e) => setSelectedApartmentId(Number(e.target.value))}
            className="border px-3 py-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>
                {`${a.block} - Floor ${a.floor} Apt ${a.number}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border px-3 py-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={paid}
            onChange={(e) => setPaid(e.target.checked)}
            className="mr-2"
          />
          <label className="text-gray-700">Paid?</label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          {submitting ? "Adding..." : "➕ Add Payment"}
        </button>
      </form>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 rounded overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Apartment</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Paid</th>
              <th className="py-2 px-4 border-b">Actions</th>
              <th className="py-2 px-4 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, index) => (
              <tr
                key={p.id}
                className={`text-center hover:bg-gray-100 ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="py-2 px-4 border">{p.id}</td>
                <td className="py-2 px-4 border">{editingId === p.id ? (
                  <select
                    value={editApartmentId}
                    onChange={(e) => setEditApartmentId(Number(e.target.value))}
                    className="border px-2 py-1 rounded"
                  >
                    {apartments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {`${a.block} - Floor ${a.floor} Apt ${a.number}`}
                      </option>
                    ))}
                  </select>
                ) : p.apartment}</td>
                <td className="py-2 px-4 border">{editingId === p.id ? (
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="border px-2 py-1 rounded w-24"
                  />
                ) : `$${p.amount}`}</td>
                <td className="py-2 px-4 border">{editingId === p.id ? (
                  <input
                    type="checkbox"
                    checked={editPaid}
                    onChange={(e) => setEditPaid(e.target.checked)}
                  />
                ) : p.paid ? (
                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full">Paid</span>
                ) : (
                  <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full">Unpaid</span>
                )}</td>
                <td className="py-2 px-4 border space-x-2">
                  {editingId === p.id ? (
                    <>
                      <button onClick={() => saveEdit(p.id)} className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600">Save</button>
                      <button onClick={cancelEdit} className="px-3 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-500">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => togglePaid(p)} className="px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500">Toggle Paid</button>
                      <button onClick={() => startEdit(p)} className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">Delete</button>
                    </>
                  )}
                </td>
                <td className="py-2 px-4 border">{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
