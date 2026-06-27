import React, { useEffect, useState } from 'react';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';

function Foods() {
  const { role } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
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
      setError('Error fetching foods database');
    }
    setLoading(false);
  };

  // Add new food
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      await apiClient('http://localhost:5000/add-food', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('✅ Food added successfully!');
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
      setMessage('❌ Error adding food');
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
      await apiClient(`http://localhost:5000/foods/${foodId}`, {
        method: 'PUT',
        body: JSON.stringify(editFormData),
      });
      
      setMessage('✅ Food updated successfully!');
      setEditingFood(null);
      setEditFormData({});
      fetchFoods();
    } catch (err) {
      setMessage('❌ Error updating food');
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
      setMessage('✅ Food deleted successfully');
      fetchFoods();
    } catch (err) {
      setMessage('❌ Error deleting food');
    }
  };

  // Filter foods by query and category
  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.properties && food.properties.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (food.benefits && food.benefits.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === '' || food.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (cat) => {
    const colors = {
      Grains: '#3F51B5', // Blue
      Vegetables: '#2E7D32', // Green
      Fruits: '#E91E63', // Pink
      Spices: '#FF9800', // Orange
      Herbs: '#9C27B0', // Purple
      Dairy: '#00BCD4', // Cyan
      Oils: '#795548' // Brown
    };
    return colors[cat] || '#607D8B';
  };

  if (!role) return <div className="container"><p className="text-center">Loading user info...</p></div>;
  if (loading && foods.length === 0) return <div className="container"><p className="text-center">Loading foods database...</p></div>;

  return (
    <div className="container" style={{ animation: 'fadeInDown 0.6s ease-out' }}>
      <div className="section-header">
        <h2>🍎 Ayurvedic Food Database</h2>
        <p className="subtitle">Explore clinical Ayurvedic nutritional values: Rasa (taste), Virya (potency), and Dosha properties.</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Add New Food Form */}
      {(role === 'doctor' || role === 'admin') && !editingFood && (
        <div className="form-container mb-4">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary-color)' }}>➕ Add New Food Item</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Food Name *</label>
                <input 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  placeholder="e.g., Basmati Rice, Cumin" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select 
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })} 
                  required 
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
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Rasa (Taste)</label>
                <select 
                  value={form.taste} 
                  onChange={(e) => setForm({ ...form, taste: e.target.value })} 
                >
                  <option value="">Taste</option>
                  <option value="Sweet">Sweet</option>
                  <option value="Sour">Sour</option>
                  <option value="Salty">Salty</option>
                  <option value="Bitter">Bitter</option>
                  <option value="Pungent">Pungent</option>
                  <option value="Astringent">Astringent</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Virya (Potency)</label>
                <select 
                  value={form.potency} 
                  onChange={(e) => setForm({ ...form, potency: e.target.value })} 
                >
                  <option value="">Potency</option>
                  <option value="Hot">Hot (Ushna)</option>
                  <option value="Cold">Cold (Shita)</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Ayurvedic Properties (Vata, Pitta, Kapha balancing effects)</label>
              <textarea 
                value={form.properties} 
                onChange={(e) => setForm({ ...form, properties: e.target.value })} 
                placeholder="e.g., Pacifies Vata & Pitta, may increase Kapha in excess." 
                style={{ height: '70px' }}
              />
            </div>
            
            <div className="form-group">
              <label>Clinical Health Benefits *</label>
              <textarea 
                value={form.benefits} 
                onChange={(e) => setForm({ ...form, benefits: e.target.value })} 
                placeholder="Describe physiological benefits, digestion support, nutrient actions..." 
                required
                style={{ height: '70px' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-success">
                Add Food
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="filter-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search foods, properties, or benefits..."
          />
        </div>
        <div style={{ minWidth: '180px' }}>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem' }}
          >
            <option value="">All Categories</option>
            <option value="Grains">Grains</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Spices">Spices</option>
            <option value="Herbs">Herbs</option>
            <option value="Dairy">Dairy</option>
            <option value="Oils">Oils</option>
          </select>
        </div>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}

      {/* Food Database Cards Grid */}
      <div className="section-header" style={{ marginTop: '2rem' }}>
        <h3>Food Directory ({filteredFoods.length} items matched)</h3>
      </div>

      {filteredFoods.length === 0 ? (
        <p className="text-center" style={{ color: '#999', padding: '40px' }}>
          No food items found matching your filters.
        </p>
      ) : (
        <div className="cards-grid">
          {filteredFoods.map((food) => (
            <div key={food._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              {editingFood === food._id ? (
                // EDIT MODE
                <div style={{ animation: 'slideDown 0.3s ease-out', width: '100%' }}>
                  <h4 style={{ color: '#007bff', marginBottom: '1.25rem' }}>Editing: {food.name}</h4>
                  
                  <div className="form-group">
                    <label>Name</label>
                    <input 
                      value={editFormData.name} 
                      onChange={(e) => handleEditChange('name', e.target.value)} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      value={editFormData.category} 
                      onChange={(e) => handleEditChange('category', e.target.value)} 
                    >
                      <option value="Grains">Grains</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Spices">Spices</option>
                      <option value="Herbs">Herbs</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Oils">Oils</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Taste</label>
                    <select 
                      value={editFormData.taste} 
                      onChange={(e) => handleEditChange('taste', e.target.value)} 
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
                  
                  <div className="form-group">
                    <label>Potency</label>
                    <select 
                      value={editFormData.potency} 
                      onChange={(e) => handleEditChange('potency', e.target.value)} 
                    >
                      <option value="">Select Potency</option>
                      <option value="Hot">Hot</option>
                      <option value="Cold">Cold</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Properties</label>
                    <textarea 
                      value={editFormData.properties} 
                      onChange={(e) => handleEditChange('properties', e.target.value)} 
                      style={{ height: '60px' }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Benefits</label>
                    <textarea 
                      value={editFormData.benefits} 
                      onChange={(e) => handleEditChange('benefits', e.target.value)} 
                      style={{ height: '60px' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '1.25rem' }}>
                    <button 
                      onClick={() => handleUpdate(food._id)} 
                      className="btn btn-small btn-success"
                    >
                      💾 Save
                    </button>
                    <button 
                      onClick={handleCancelEdit} 
                      className="btn btn-small btn-outline"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '10px' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '1.25rem' }}>{food.name}</h4>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      color: 'white', 
                      backgroundColor: getCategoryColor(food.category), 
                      padding: '4px 8px', 
                      borderRadius: '12px' 
                    }}>
                      {food.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {food.taste && (
                      <span style={{ fontSize: '0.8rem', background: '#e3f2fd', color: '#1565C0', padding: '3px 8px', borderRadius: '4px', fontWeight: '500' }}>
                        👅 Rasa: {food.taste}
                      </span>
                    )}
                    {food.potency && (
                      <span style={{ fontSize: '0.8rem', background: '#ffe0b2', color: '#E65100', padding: '3px 8px', borderRadius: '4px', fontWeight: '500' }}>
                        ⚡ Virya: {food.potency}
                      </span>
                    )}
                  </div>

                  {food.properties && (
                    <p style={{ fontSize: '0.9rem', background: '#f5f5f5', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #ccc', margin: '0 0 1rem 0' }}>
                      <strong>Gunadharmas:</strong> {food.properties}
                    </p>
                  )}
                  
                  <p style={{ fontSize: '0.925rem', color: '#555', lineHeight: '1.5', margin: '0 0 1.5rem 0', flex: 1 }}>
                    <strong>Benefits:</strong> {food.benefits}
                  </p>
                  
                  {(role === 'doctor' || role === 'admin') && (
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: 'auto' }}>
                      <button 
                        onClick={() => handleEdit(food)} 
                        className="btn btn-small btn-outline"
                        style={{ flex: 1 }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(food._id)} 
                        className="btn btn-small btn-danger"
                        style={{ flex: 1 }}
                      >
                        🗑️ Delete
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
