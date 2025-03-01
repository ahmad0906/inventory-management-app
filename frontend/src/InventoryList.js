// frontend/src/InventoryList.js

import React, { useEffect, useState } from 'react';

const InventoryList = ({ inventory, setInventory }) => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // New state for sorting: field and order
  const [sortBy, setSortBy] = useState('name'); // 'name' or 'quantity'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  useEffect(() => {
    // Fetch inventory data from the backend API only if not provided via props
    if (inventory.length === 0) {

    // Fetch inventory data from the backend API
    fetch('/api/inventory')
      .then(response => response.json())
      .then(data => {
        console.log("Fetched data:", data); // <-- Add this line
        setInventory(data);
        setLoading(false);
      })

      .catch(error => {
        console.error('Error fetching inventory:', error);
        setLoading(false);
      });
  } else {
      setLoading(false);
    }
  }, [inventory, setInventory]);

  // Temporary debug effect for search filtering
  useEffect(() => {
    const filteredItems = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log("Search term:", searchTerm);
    console.log("Filtered items:", filteredItems);
  }, [searchTerm, inventory]);

  // Function to handle deleting an item
  const handleDelete = (id) => {
    fetch(`/api/inventory/${id}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(() => {
        setInventory(prev => prev.filter(item => item.id !== id));
      })
      .catch(error => console.error('Error deleting item:', error));
  };

  // Function to handle editing an item
  const handleEdit = (id) => {
    const newName = prompt("Enter the new name:");
    const newQuantity = prompt("Enter the new quantity:");
    if (newName && newQuantity) {
      const updatedItem = { name: newName, quantity: Number(newQuantity) };
      fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      })
        .then(response => response.json())
        .then(updatedData => {
          setInventory(prev =>
            prev.map(item => (item.id === id ? updatedData : item))
          );
        })
        .catch(error => console.error('Error updating item:', error));
    }
  };

  // Filter items based on the search term
  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

   // Sort the filtered items based on sortBy and sortOrder
   const sortedItems = filteredItems.slice().sort((a, b) => {
    if (sortBy === 'name') {
      // Compare names alphabetically
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    } else if (sortBy === 'quantity') {
      // Compare numeric values
      return sortOrder === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
    }
    return 0;
  });

  if (loading) {
    return <p>Loading inventory...</p>;
  }

  return (
    <div>
      <h2>Inventory List</h2>
      <input
        type="text"
        placeholder="Search inventory..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {filteredItems.length === 0 && searchTerm && (
        <p>No items match your search.</p>
      )}
      {/* Sorting Controls */}
      <div className="sort-controls">
        <label>Sort By: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="quantity">Quantity</option>
        </select>
        <button onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}>
          {sortOrder === 'asc' ? 'Asc' : 'Desc'}
        </button>
      </div>
      <ul>
        {sortedItems.map((item, index) => (
          <li key={`${item.id}-${index}`}>
            {item.name} - Quantity: {item.quantity}
            <button onClick={() => handleEdit(item.id)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  ); 
};

export default InventoryList;
