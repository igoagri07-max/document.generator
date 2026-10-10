import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FilePlus,
  MapPin,
  Phone,
  Mail,
  Check
} from "lucide-react";

export default function CustomerDirectory({
  customers = [],
  onSaveCustomer,
  onDeleteCustomer,
  onCreateInvoiceForCustomer
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const initialCustForm = {
    name: "",
    contactPerson: "",
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    gstin: ""
  };

  const [formData, setFormData] = useState(initialCustForm);

  const filtered = customers.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData(initialCustForm);
    setIsEditing(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({ ...customer });
    setIsEditing(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSaveCustomer({
      ...formData,
      id: editingCustomer ? editingCustomer.id : undefined
    });
    setIsEditing(false);
  };

  return (
    <div className="customer-directory-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Customer Directory</h2>
          <p className="page-subtitle">
            Manage reusable customer and client profiles for one-click invoice creation
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
        >
          <Plus size={16} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="filters-card">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search customers by name, city, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Form Modal */}
      {isEditing && (
        <div className="modal-backdrop" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCustomer ? "Edit Customer" : "Add Customer Profile"}</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsEditing(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid grid-2">
                <div className="form-group grid-span-2">
                  <label className="required">Customer / Client Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Mrs. Sukavya Deepak A V"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Person / Care Of</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                    placeholder="e.g. C/o. Nagaraj"
                  />
                </div>

                <div className="form-group">
                  <label>GSTIN (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.gstin}
                    onChange={(e) =>
                      setFormData({ ...formData, gstin: e.target.value })
                    }
                    placeholder="15-character GSTIN"
                  />
                </div>

                <div className="form-group grid-span-2">
                  <label>Street Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Door No, Street name, landmark"
                  />
                </div>

                <div className="form-group">
                  <label>City / Town</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="e.g. Chintamani"
                  />
                </div>

                <div className="form-group">
                  <label>District</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    placeholder="e.g. Chikkaballapur (dist)"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="e.g. Karnataka"
                  />
                </div>

                <div className="form-group">
                  <label>PIN / Postal Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    placeholder="e.g. 563 125"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Save Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customers Grid */}
      <div className="customers-grid">
        {filtered.map((cust) => (
          <div key={cust.id} className="customer-card">
            <div className="customer-card-header">
              <div className="customer-avatar">
                {cust.name.charAt(0).toUpperCase()}
              </div>
              <div className="customer-header-details">
                <h3 className="customer-name">{cust.name}</h3>
                {cust.contactPerson && (
                  <span className="customer-contact-person">
                    {cust.contactPerson}
                  </span>
                )}
              </div>
            </div>

            <div className="customer-card-body">
              {cust.address && (
                <div className="customer-info-line">
                  <MapPin size={14} className="text-muted" />
                  <span>
                    {cust.address}
                    {cust.city ? `, ${cust.city}` : ""}
                    {cust.pincode ? ` - ${cust.pincode}` : ""}
                  </span>
                </div>
              )}

              {cust.phone && (
                <div className="customer-info-line">
                  <Phone size={14} className="text-muted" />
                  <span>{cust.phone}</span>
                </div>
              )}

              {cust.email && (
                <div className="customer-info-line">
                  <Mail size={14} className="text-muted" />
                  <span>{cust.email}</span>
                </div>
              )}

              {cust.gstin && (
                <div className="customer-info-line">
                  <strong className="text-xs">GSTIN:</strong>
                  <span className="font-mono text-xs">{cust.gstin}</span>
                </div>
              )}
            </div>

            <div className="customer-card-actions">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm flex-1"
                onClick={() => onCreateInvoiceForCustomer(cust)}
                title="Create a new invoice for this customer"
              >
                <FilePlus size={14} />
                <span>Create Invoice</span>
              </button>

              <button
                type="button"
                className="btn-icon"
                onClick={() => handleOpenEdit(cust)}
                title="Edit Customer"
              >
                <Edit2 size={15} />
              </button>

              <button
                type="button"
                className="btn-icon delete-btn"
                onClick={() => onDeleteCustomer(cust.id, cust.name)}
                title="Delete Customer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
