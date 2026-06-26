import React, { useEffect, useState } from 'react';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';

function Foods() {
  const { role } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state for adding new food
  const [form, setForm] = useState({
    name: '',
    category: '',
    benefits: '',
    properties: '',
    taste: '',
    potency: ''
  });
  
  // Edit state
  const [editingFood, setEditingFood] = useState(null); // Stores ID of food being edited
  const [editFormData, setEditFormData] = useState({}); // Stores edit form values
  const [message, setMessage] = useState('');

  // Fetch all foods
  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient('http://localhost:5000/foods');
      setFoods(data);
    } catch (err) {
      setError('Error fetching foods');
    }
    setLoading(false);
  };

  // Add new food
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const response = await apiClient('http://localhost:5000/add-food', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('Food added successfully!');
      setForm({
        name: '',
        category: '',
        benefits: '',
        properties: '',
        taste: '',
        potency: ''
      });
      fetchFoods();
    } catch (err) {
      setMessage('Error adding food');
    }
  };

  // Initialize edit mode
  const handleEdit = (food) => {
    setEditingFood(food._id);
    setEditFormData({
      name: food.name,
      category: food.category,
      benefits: food.benefits,
      properties: food.properties || '',
      taste: food.taste || '',
      potency: food.potency || ''
    });
    setMessage('');
  };

  // Handle changes in edit form
  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit update
  const handleUpdate = async (foodId) => {
    try {
      const response = await apiClient(`http://localhost:5000/foods/${foodId}`, {
        method: 'PUT',
        body: JSON.stringify(editFormData),
      });
      
      setMessage('Food updated successfully!');
      setEditingFood(null);
      setEditFormData({});
      fetchFoods();
    } catch (err) {
      setMessage('Error updating food');
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingFood(null);
    setEditFormData({});
    setMessage('');
  };

  // Delete food
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await apiClient(`http://localhost:5000/foods/${id}`, { method: 'DELETE' });
      setMessage('Food deleted successfully');
      fetchFoods();
    } catch (err) {
      setMessage('Error deleting food');
    }
  };

  if (!role) return <p>Loading user info...</p>;
  if (loading) return <p>Loading foods...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Ayurvedic Food Database</h2>
      
      {/* Add New Food Form */}
      {(role === 'doctor' || role === 'admin') && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Add New Food Item</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="Food Name" 
              required 
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
            <select 
              value={form.category} 
              onChange={(e) => setForm({ ...form, category: e.target.value })} 
              required 
              style={{ padding: '8px', marginRight: '10px', width: '150px' }}
            >
              <option value="">Select Category</option>
              <option value="Grains">Grains</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Spices">Spices</option>
              <option value="Herbs">Herbs</option>
              <option value="Dairy">Dairy</option>
              <option value="Oils">Oils</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <select 
              value={form.taste} 
              onChange={(e) => setForm({ ...form, taste: e.target.value })} 
              style={{ padding: '8px', marginRight: '10px', width: '120px' }}
            >
              <option value="">Taste</option>
              <option value="Sweet">Sweet</option>
              <option value="Sour">Sour</option>
              <option value="Salty">Salty</option>
              <option value="Bitter">Bitter</option>
              <option value="Pungent">Pungent</option>
              <option value="Astringent">Astringent</option>
            </select>
            
            <select 
              value={form.potency} 
              onChange={(e) => setForm({ ...form, potency: e.target.value })} 
              style={{ padding: '8px', marginRight: '10px', width: '120px' }}
            >
              <option value="">Potency</option>
              <option value="Hot">Hot</option>
              <option value="Cold">Cold</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <textarea 
              value={form.properties} 
              onChange={(e) => setForm({ ...form, properties: e.target.value })} 
              placeholder="Ayurvedic Properties (Vata, Pitta, Kapha effects)" 
              style={{ padding: '8px', width: '400px', height: '60px' }}
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <textarea 
              value={form.benefits} 
              onChange={(e) => setForm({ ...form, benefits: e.target.value })} 
              placeholder="Health Benefits" 
              required 
              style={{ padding: '8px', width: '400px', height: '60px' }}
            />
          </div>
          
          <button 
            type="submit" 
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Add Food
          </button>
          
          {message && (
            <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>
              {message}
            </p>
          )}
        </form>
      )}
      
      {/* Food List with Edit Functionality */}
      <h3>Food Database ({foods.length} items)</h3>
      {foods.length === 0 ? (
        <p>No food items added yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {foods.map((food) => (
            <div 
              key={food._id} 
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '5px', 
                backgroundColor: '#f9f9f9' 
              }}
            >
              {editingFood === food._id ? (
                // EDIT MODE
                <div>
                  <h4 style={{ color: '#007bff' }}>Editing: {food.name}</h4>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Name:
                    </label>
                    <input 
                      value={editFormData.name} 
                      onChange={(e) => handleEditChange('name', e.target.value)} 
                      style={{ padding: '8px', width: '100%', maxWidth: '400px' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Category:
                    </label>
                    <select 
                      value={editFormData.category} 
                      onChange={(e) => handleEditChange('category', e.target.value)} 
                      style={{ padding: '8px', width: '100%', maxWidth: '200px' }}
                    >
                      <option value="">Select Category</option>
                      <option value="Grains">Grains</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Spices">Spices</option>
                      <option value="Herbs">Herbs</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Oils">Oils</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Taste:
                    </label>
                    <select 
                      value={editFormData.taste} 
                      onChange={(e) => handleEditChange('taste', e.target.value)} 
                      style={{ padding: '8px', width: '100%', maxWidth: '200px' }}
                    >
                      <option value="">Select Taste</option>
                      <option value="Sweet">Sweet</option>
                      <option value="Sour">Sour</option>
                      <option value="Salty">Salty</option>
                      <option value="Bitter">Bitter</option>
                      <option value="Pungent">Pungent</option>
                      <option value="Astringent">Astringent</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Potency:
                    </label>
                    <select 
                      value={editFormData.potency} 
                      onChange={(e) => handleEditChange('potency', e.target.value)} 
                      style={{ padding: '8px', width: '100%', maxWidth: '200px' }}
                    >
                      <option value="">Select Potency</option>
                      <option value="Hot">Hot</option>
                      <option value="Cold">Cold</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Properties:
                    </label>
                    <textarea 
                      value={editFormData.properties} 
                      onChange={(e) => handleEditChange('properties', e.target.value)} 
                      placeholder="Ayurvedic Properties" 
                      style={{ padding: '8px', width: '100%', maxWidth: '400px', height: '60px' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Benefits:
                    </label>
                    <textarea 
                      value={editFormData.benefits} 
                      onChange={(e) => handleEditChange('benefits', e.target.value)} 
                      placeholder="Health Benefits" 
                      style={{ padding: '8px', width: '100%', maxWidth: '400px', height: '60px' }}
                    />
                  </div>
                  
                  <div style={{ marginTop: '15px' }}>
                    <button 
                      onClick={() => handleUpdate(food._id)} 
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '3px',
                        marginRight: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={handleCancelEdit} 
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#6c757d', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div>
                  <h4>{food.name} - {food.category}</h4>
                  {food.taste && <p><strong>Taste:</strong> {food.taste}</p>}
                  {food.potency && <p><strong>Potency:</strong> {food.potency}</p>}
                  {food.properties && <p><strong>Properties:</strong> {food.properties}</p>}
                  <p><strong>Benefits:</strong> {food.benefits}</p>
                  
                  {(role === 'doctor' || role === 'admin') && (
                    <div style={{ marginTop: '10px' }}>
                      <button 
                        onClick={() => handleEdit(food)} 
                        style={{ 
                          padding: '5px 10px', 
                          backgroundColor: '#007bff', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '3px',
                          marginRight: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(food._id)} 
                        style={{ 
                          padding: '5px 10px', 
                          backgroundColor: '#dc3545', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Foods;
