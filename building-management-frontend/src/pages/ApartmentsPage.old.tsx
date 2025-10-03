import React, { useEffect, useState } from "react";
import api from "../api/client"; // baseURL: http://127.0.0.1:5287/api
import { ApartmentDTO } from "../types/apartment";

interface Payment {
  id: number;
  apartment: string;
  amount: number;
  paid: boolean;
}

export default function ApartmentsPage() {
  const [apartments, setApartments] = useState<ApartmentDTO[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Apartment Form
  const [newBlock, setNewBlock] = useState("");
  const [newFloor, setNewFloor] = useState<number | "">("");
  const [newNumber, setNewNumber] = useState<number | "">("");
  const [newIsOccupied, setNewIsOccupied] = useState(false);

  // Edit Apartment Form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBlock, setEditBlock] = useState("");
  const [editFloor, setEditFloor] = useState<number | "">("");
  const [editNumber, setEditNumber] = useState<number | "">("");
  const [editIsOccupied, setEditIsOccupied] = useState(false);

  // Payment Form
  const [paymentApartmentId, setPaymentApartmentId] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentPaid, setPaymentPaid] = useState<boolean>(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // Load apartments and payments
  const load = async () => {
    try {
      setLoading(true);

      // Apartments
      const apartmentsRes = await api.get<ApartmentDTO[]>("/apartments");
      setApartments(apartmentsRes.data);

      // Set default apartment for payment form
      if (apartmentsRes.data.length > 0) {
        setPaymentApartmentId(apartmentsRes.data[0].id);
      }

      // Payments
      const paymentsRes = await fetch("http://127.0.0.1:5287/api/payments");
      const paymentsData: Payment[] = await paymentsRes.json();
      setPayments(paymentsData);

      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong while loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Add Apartment
  const handleAddApartment = async () => {
    if (!newBlock || newFloor === "" || newNumber === "") {
      alert("Please fill all apartment fields!");
      return;
    }
    try {
      await api.post("/apartments", {
        block: newBlock,
        floor: Number(newFloor),
        number: Number(newNumber),
        isOccupied: newIsOccupied,
      });
      setNewBlock("");
      setNewFloor("");
      setNewNumber("");
      setNewIsOccupied(false);
      load();
    } catch {
      alert("Failed to add apartment.");
    }
  };

  // Edit Apartment
  const handleSaveApartment = async (id: number) => {
    try {
      await api.put(`/apartments/${id}`, {
        block: editBlock,
        floor: Number(editFloor),
        number: Number(editNumber),
        isOccupied: editIsOccupied,
      });
      setEditingId(null);
      load();
    } catch {
      alert("Failed to update apartment.");
    }
  };

  // Delete Apartment
  const handleDeleteApartment = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/apartments/${id}`);
      load();
    } catch {
      alert("Failed to delete apartment.");
    }
  };

  // Add Payment
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:5287/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apartmentId: paymentApartmentId,
          amount: paymentAmount,
          paid: paymentPaid,
        }),
      });
      if (!res.ok) throw new Error("Failed to add payment");
      const newPayment = await res.json();
      setPayments(prev => [...prev, newPayment]);
      setPaymentAmount(0);
      setPaymentPaid(false);
    } catch (err) {
      console.error(err);
      alert("Payment could not be added.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🏢 Apartments</h1>

      {/* Add Apartment Form */}
      <div className="border p-6 rounded-xl bg-white shadow space-y-4">
        <h2 className="text-xl font-semibold">Add New Apartment</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Block"
            value={newBlock}
            onChange={e => setNewBlock(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Floor"
            value={newFloor}
            onChange={e => setNewFloor(Number(e.target.value))}
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Number"
            value={newNumber}
            onChange={e => setNewNumber(Number(e.target.value))}
            className="border p-2 rounded w-full"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newIsOccupied}
              onChange={e => setNewIsOccupied(e.target.checked)}
              className="w-5 h-5"
            />
            <span>Occupied</span>
          </label>
        </div>
        <button
          onClick={handleAddApartment}
          className="px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          ➕ Add Apartment
        </button>
      </div>

      {/* Apartments Table */}
      <div className="overflow-x-auto border rounded-xl shadow bg-white">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Block</th>
              <th className="p-3 border">Floor</th>
              <th className="p-3 border">Number</th>
              <th className="p-3 border">Occupied</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apartments.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                {editingId === a.id ? (
                  <>
                    <td className="p-2 border">{a.id}</td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={editBlock}
                        onChange={e => setEditBlock(e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={editFloor}
                        onChange={e => setEditFloor(Number(e.target.value))}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={editNumber}
                        onChange={e => setEditNumber(Number(e.target.value))}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={editIsOccupied}
                        onChange={e => setEditIsOccupied(e.target.checked)}
                        className="w-5 h-5"
                      />
                    </td>
                    <td className="p-2 border space-x-2 text-center">
                      <button
                        onClick={() => handleSaveApartment(a.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-400 text-white rounded"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2 border">{a.id}</td>
                    <td className="p-2 border">{a.block}</td>
                    <td className="p-2 border">{a.floor}</td>
                    <td className="p-2 border">{a.number}</td>
                    <td className="p-2 border text-center">
                      {a.isOccupied ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Yes</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded">No</span>
                      )}
                    </td>
                    <td className="p-2 border space-x-2 text-center">
                      <button
                        onClick={() => {
                          setEditingId(a.id);
                          setEditBlock(a.block);
                          setEditFloor(a.floor);
                          setEditNumber(a.number);
                          setEditIsOccupied(a.isOccupied);
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteApartment(a.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {apartments.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={6}>
                  No apartments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Form */}
      <div className="border p-6 rounded-xl bg-white shadow space-y-4">
        <h2 className="text-xl font-semibold">💳 Add Payment</h2>
        <form onSubmit={handleAddPayment} className="space-y-3">
          <div>
            <label>Apartment:</label>
            <select
              value={paymentApartmentId}
              onChange={e => setPaymentApartmentId(Number(e.target.value))}
              className="border px-2 py-1 w-full"
            >
              {apartments.map(a => (
                <option key={a.id} value={a.id}>
                  {`${a.block}-${a.floor}${a.number}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Amount:</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={e => setPaymentAmount(Number(e.target.value))}
              className="border px-2 py-1 w-full"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={paymentPaid}
              onChange={e => setPaymentPaid(e.target.checked)}
              className="mr-2"
            />
            <label>Paid?</label>
          </div>

          <button
            type="submit"
            disabled={paymentSubmitting}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {paymentSubmitting ? "Adding..." : "Add Payment"}
          </button>
        </form>
      </div>

      {/* Payments Table */}
      <div className="border p-6 rounded-xl shadow bg-white space-y-4">
        <h2 className="text-xl font-semibold">💳 Payments</h2>
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Apartment</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Paid</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-2 border">{p.id}</td>
                <td className="p-2 border">{p.apartment}</td>
                <td className="p-2 border">${p.amount}</td>
                <td className="p-2 border">
                  {p.paid ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Yes</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">No</span>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={4}>
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Refresh */}
      <div className="flex justify-center">
        <button
          onClick={load}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}