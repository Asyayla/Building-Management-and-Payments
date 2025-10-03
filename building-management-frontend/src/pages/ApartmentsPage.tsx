import React, { useEffect, useState, useRef } from "react";
import api from "../api/client";
import { ApartmentDTO } from "../types/apartment";

export default function ApartmentsPage() {
  const [apartments, setApartments] = useState<ApartmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form state
  const [newBlock, setNewBlock] = useState("");
  const [newFloor, setNewFloor] = useState<number | "">("");
  const [newNumber, setNewNumber] = useState<number | "">("");
  const [newIsOccupied, setNewIsOccupied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBlock, setEditBlock] = useState("");
  const [editFloor, setEditFloor] = useState<number>(0);
  const [editNumber, setEditNumber] = useState<number>(0);
  const [editIsOccupied, setEditIsOccupied] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Fetch apartments initially
  const fetchApartments = async () => {
    try {
      const res = await api.get<ApartmentDTO[]>("/apartments");
      setApartments(res.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data || "Failed to fetch apartments");
    } finally {
      setLoading(false);
    }
  };

  // WebSocket (real-time sync)
  useEffect(() => {
    fetchApartments();

    wsRef.current = new WebSocket("ws://127.0.0.1:5287/ws/apartments");
    wsRef.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as { type: string; apartment: ApartmentDTO };

      setApartments((prev) => {
        if (data.type === "ADD") return [...prev, data.apartment];
        if (data.type === "UPDATE")
          return prev.map((a) => (a.id === data.apartment.id ? data.apartment : a));
        if (data.type === "DELETE") return prev.filter((a) => a.id !== data.apartment.id);
        return prev;
      });
    };

    return () => wsRef.current?.close();
  }, []);

  // Add apartment
  const handleAdd = async () => {
    if (!newBlock || newFloor === "" || newNumber === "") {
      alert("Please fill all fields");
      return;
    }

    setSubmitting(true);
    setSuccessMessage("");

    try {
      const res = await api.post("/apartments", {
        block: newBlock,
        floor: Number(newFloor),
        number: Number(newNumber),
        isOccupied: newIsOccupied,
      });

      setApartments((prev) => [...prev, res.data]);
      setNewBlock("");
      setNewFloor("");
      setNewNumber("");
      setNewIsOccupied(false);
      setSuccessMessage("Apartment added successfully! ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to add apartment");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete apartment
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this apartment?")) return;

    const backup = [...apartments];
    setApartments((prev) => prev.filter((a) => a.id !== id));

    try {
      await api.delete(`/apartments/${id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to delete apartment");
      setApartments(backup);
    }
  };

  // Start editing
  const startEdit = (apartment: ApartmentDTO) => {
    setEditingId(apartment.id);
    setEditBlock(apartment.block);
    setEditFloor(apartment.floor);
    setEditNumber(apartment.number);
    setEditIsOccupied(apartment.isOccupied);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: number) => {
    const updated = {
      block: editBlock,
      floor: editFloor,
      number: editNumber,
      isOccupied: editIsOccupied,
    };

    const backup = [...apartments];
    setApartments(prev => prev.map(a => (a.id === id ? { ...a, ...updated } : a)));
    setEditingId(null);

    try {
      await api.put(`/apartments/${id}`, updated);
    } catch (err) {
      console.error(err);
      alert("Failed to save apartment");
      setApartments(backup);
    }
  };


  const toggleOccupied = (apartment: ApartmentDTO) => {
    setApartments((prev) =>
      prev.map((a) =>
        a.id === apartment.id ? { ...a, isOccupied: !a.isOccupied } : a
      )
    );
  };


  if (loading) return <p className="p-6 text-center">Loading apartments...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🏢 Apartments</h1>

      {successMessage && (
        <div className="p-3 bg-green-100 text-green-800 border border-green-300 rounded">
          {successMessage}
        </div>
      )}

      {/* Add Apartment Form */}
      <div className="border p-6 rounded-xl shadow-md bg-white space-y-4 max-w-md">
        <h2 className="text-xl font-semibold">Add New Apartment</h2>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Block"
            value={newBlock}
            onChange={(e) => setNewBlock(e.target.value)}
            className="border p-2 rounded-lg w-full"
          />
          <input
            type="number"
            placeholder="Floor"
            value={newFloor}
            onChange={(e) => setNewFloor(Number(e.target.value))}
            className="border p-2 rounded-lg w-full"
          />
          <input
            type="number"
            placeholder="Number"
            value={newNumber}
            onChange={(e) => setNewNumber(Number(e.target.value))}
            className="border p-2 rounded-lg w-full"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newIsOccupied}
              onChange={(e) => setNewIsOccupied(e.target.checked)}
              className="h-5 w-5"
            />
            <span>Occupied</span>
          </label>
        </div>
        <button
          onClick={handleAdd}
          disabled={submitting}
          className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          {submitting ? "Adding..." : "➕ Add Apartment"}
        </button>
      </div>

      {/* Apartments Table */}
      <div className="overflow-x-auto border rounded-xl shadow-md bg-white">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border text-left">ID</th>
              <th className="p-3 border text-left">Block</th>
              <th className="p-3 border text-left">Floor</th>
              <th className="p-3 border text-left">Number</th>
              <th className="p-3 border text-center">Occupied</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apartments.map((a) => (
              <tr key={a.id} className="hover:bg-gray-100 text-center">
                <td className="p-2 border">{a.id}</td>
                {editingId === a.id ? (
                  <>
                    <td className="p-2 border">
                      <input
                        value={editBlock}
                        onChange={(e) => setEditBlock(e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={editFloor}
                        onChange={(e) => setEditFloor(Number(e.target.value))}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={editNumber}
                        onChange={(e) => setEditNumber(Number(e.target.value))}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="checkbox"
                        checked={editIsOccupied}
                        onChange={(e) => setEditIsOccupied(e.target.checked)}
                      />
                    </td>
                    <td className="p-2 border space-x-2">
                      <button
                        onClick={() => saveEdit(a.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2 border">{a.block}</td>
                    <td className="p-2 border">{a.floor}</td>
                    <td className="p-2 border">{a.number}</td>
                    <td className="p-2 border">
                      <button
                        disabled={true}
                        className={`px-3 py-1 rounded text-white ${
                          a.isOccupied ? "bg-green-500" : "bg-red-500 "
                        } cursor-not-allowed `}
                      >
                        {a.isOccupied ? "Occupied" : "Vacant"}
                      </button>
                    </td>
                    <td className="p-2 border space-x-2">
                      <button
                        onClick={() => startEdit(a)}
                        className="px-3 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
                <td colSpan={6} className="p-4 text-gray-500">
                  No records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}