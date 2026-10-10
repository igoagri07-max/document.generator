import React, { useState, useRef } from "react";
import {
  Building,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  FileSignature,
  FileText,
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import { DEFAULT_LOGO_BASE64 } from "../constants/logoBase64.js";

export default function CompanySettings({
  settings,
  onSaveSettings,
  onResetSettings
}) {
  const [formState, setFormState] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const logoInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange("logo", event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogoToGenuine = () => {
    handleChange("logo", DEFAULT_LOGO_BASE64);
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange("signatureImage", event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    handleChange("signatureImage", "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="company-settings-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Company Settings & Defaults</h2>
          <p className="page-subtitle">
            Configure central company identity, official logo, declaration, and signatory defaults
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onResetSettings}
            title="Reset to factory settings"
          >
            <RotateCcw size={16} />
            <span>Reset All Defaults</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="alert-banner alert-success">
          <CheckCircle2 size={18} />
          <span>Company settings saved successfully! These defaults will apply to new invoices.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form-layout">
        {/* Card 1: Company Profile & Identification */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Building size={20} className="card-header-icon" />
            <div>
              <h3>Company Identity & Contact</h3>
              <p>Primary business details appearing in header</p>
            </div>
          </div>

          <div className="form-grid grid-2">
            <div className="form-group grid-span-2">
              <label htmlFor="companyName" className="required">
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                className="form-input"
                value={formState.companyName || ""}
                onChange={(e) => handleChange("companyName", e.target.value)}
                required
              />
            </div>

            <div className="form-group grid-span-2">
              <label htmlFor="companyAddress" className="required">
                Full Registered Address
              </label>
              <textarea
                id="companyAddress"
                rows={3}
                className="form-textarea"
                value={formState.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyEmail" className="required">
                Official Email
              </label>
              <input
                id="companyEmail"
                type="email"
                className="form-input"
                value={formState.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyGstin" className="required">
                GSTIN
              </label>
              <input
                id="companyGstin"
                type="text"
                className="form-input"
                value={formState.gstin || ""}
                onChange={(e) => handleChange("gstin", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyPhone">Official Phone</label>
              <input
                id="companyPhone"
                type="tel"
                className="form-input"
                value={formState.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Company Logo Management */}
        <div className="settings-card">
          <div className="settings-card-header">
            <ImageIcon size={20} className="card-header-icon" />
            <div>
              <h3>Company Official Logo</h3>
              <p>Displayed in the document header with preserved aspect ratio</p>
            </div>
          </div>

          <div className="logo-management-block">
            <div className="logo-preview-box">
              {formState.logo ? (
                <img
                  src={formState.logo}
                  alt="Company Logo Preview"
                  className="settings-logo-img"
                />
              ) : (
                <span className="text-muted">No logo selected</span>
              )}
            </div>

            <div className="logo-actions-col">
              <input
                type="file"
                ref={logoInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleLogoUpload}
              />

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload size={15} />
                <span>Upload New Logo</span>
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleResetLogoToGenuine}
                title="Restore default genuine IGO logo"
              >
                <RotateCcw size={15} />
                <span>Restore Genuine IGO Logo</span>
              </button>

              <p className="field-hint">
                Supported formats: PNG, JPG, JPEG. Preserves genuine branding.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Authorised Signatory */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FileSignature size={20} className="card-header-icon" />
            <div>
              <h3>Authorised Signatory Section</h3>
              <p>Configured bottom-right signatory block</p>
            </div>
          </div>

          <div className="form-grid grid-2">
            <div className="form-group">
              <label htmlFor="signatoryEntity">Signatory Header Entity</label>
              <input
                id="signatoryEntity"
                type="text"
                className="form-input"
                value={formState.signatoryEntity || ""}
                onChange={(e) => handleChange("signatoryEntity", e.target.value)}
                placeholder="e.g. For IGO Agric Products or For IGO GROUP OF COMPANIES"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signatoryDesignation">Signatory Designation</label>
              <input
                id="signatoryDesignation"
                type="text"
                className="form-input"
                value={formState.signatoryDesignation || ""}
                onChange={(e) =>
                  handleChange("signatoryDesignation", e.target.value)
                }
                placeholder="Authorised Signatory"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signatoryName">Signatory Person Name (Optional)</label>
              <input
                id="signatoryName"
                type="text"
                className="form-input"
                value={formState.signatoryName || ""}
                onChange={(e) => handleChange("signatoryName", e.target.value)}
                placeholder="Leave blank for physical signature, or provide name"
              />
            </div>

            <div className="form-group">
              <label>Optional Signature Image</label>
              <div className="signature-upload-wrap">
                <input
                  type="file"
                  ref={signatureInputRef}
                  style={{ display: "none" }}
                  accept="image/png, image/jpeg"
                  onChange={handleSignatureUpload}
                />

                {formState.signatureImage ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={formState.signatureImage}
                      alt="Signature"
                      className="signature-preview-thumbnail"
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleRemoveSignature}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => signatureInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    <span>Upload Signature PNG/JPG</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Declaration & Footer Text */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FileText size={20} className="card-header-icon" />
            <div>
              <h3>Legal Declaration & Footer Note</h3>
              <p>Default declaration appearing at the bottom-left of every invoice</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="declaration">Invoice Declaration Statement</label>
            <textarea
              id="declaration"
              rows={3}
              className="form-textarea"
              value={formState.declaration || ""}
              onChange={(e) => handleChange("declaration", e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginTop: "14px" }}>
            <label htmlFor="footerNote">Document Footer Note</label>
            <input
              id="footerNote"
              type="text"
              className="form-input"
              value={formState.footerNote || ""}
              onChange={(e) => handleChange("footerNote", e.target.value)}
              placeholder="This is a computer generated invoice ."
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="settings-footer-actions">
          <button type="submit" className="btn btn-primary btn-lg">
            <Save size={18} />
            <span>Save All Company Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
