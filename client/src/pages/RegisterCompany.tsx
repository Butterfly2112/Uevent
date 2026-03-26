import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterCompany.css';

const RegisterCompany: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email_for_info: '',
    location: '',
    description: '',
    picture: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, picture: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email_for_info', form.email_for_info);
      formData.append('location', form.location);
      formData.append('description', form.description);
      if (form.picture) formData.append('picture', form.picture);

      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/companies/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        if (text.includes('already has company')) {
          setMessage('Error: You have already registered a company. You cannot register more than one.');
          setLoading(false);
          return;
        }
        throw new Error(text);
      }
      const data = await res.json();
      setMessage('Company registered successfully!');
      setForm({ name: '', email_for_info: '', location: '', description: '', picture: null });
      if (data && data.id) {
        setTimeout(() => {
          navigate(`/company/${data.id}`);
        }, 800);
      }
    } catch (err: unknown) {
      let errorMsg = 'Cannot register company';
      if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as Record<string, unknown>).message === 'string'
      ) {
        errorMsg = (err as { message: string }).message;
      }
      setMessage('Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-company-root">
      <div className="register-company-container">
        <div className="register-company-title">Company Registration</div>
        <form className="register-company-form" onSubmit={handleSubmit} autoComplete="off">
          <label className="register-label">
            Company name
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Acme Corp" required maxLength={60} />
          </label>
          <label className="register-label">
            Contact email
            <input name="email_for_info" value={form.email_for_info} onChange={handleChange} placeholder="e.g. info@acme.com" required type="email" maxLength={60} />
          </label>
          <label className="register-label">
            Location
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Country or city"
              list="country-list"
              maxLength={60}
              required
            />
          </label>
          <datalist id="country-list">
            <option value="Afghanistan" />
            <option value="Albania" />
            <option value="Algeria" />
            <option value="Andorra" />
            <option value="Angola" />
            <option value="Antigua and Barbuda" />
            <option value="Argentina" />
            <option value="Armenia" />
            <option value="Australia" />
            <option value="Austria" />
            <option value="Azerbaijan" />
            <option value="Bahamas" />
            <option value="Bahrain" />
            <option value="Bangladesh" />
            <option value="Barbados" />
            <option value="Belarus" />
            <option value="Belgium" />
            <option value="Belize" />
            <option value="Benin" />
            <option value="Bhutan" />
            <option value="Bolivia" />
            <option value="Bosnia and Herzegovina" />
            <option value="Botswana" />
            <option value="Brazil" />
            <option value="Brunei" />
            <option value="Bulgaria" />
            <option value="Burkina Faso" />
            <option value="Burundi" />
            <option value="Cabo Verde" />
            <option value="Cambodia" />
            <option value="Cameroon" />
            <option value="Canada" />
            <option value="Central African Republic" />
            <option value="Chad" />
            <option value="Chile" />
            <option value="China" />
            <option value="Colombia" />
            <option value="Comoros" />
            <option value="Congo, Democratic Republic of the" />
            <option value="Congo, Republic of the" />
            <option value="Costa Rica" />
            <option value="Cote d'Ivoire" />
            <option value="Croatia" />
            <option value="Cuba" />
            <option value="Cyprus" />
            <option value="Czech Republic" />
            <option value="Denmark" />
            <option value="Djibouti" />
            <option value="Dominica" />
            <option value="Dominican Republic" />
            <option value="Ecuador" />
            <option value="Egypt" />
            <option value="El Salvador" />
            <option value="Equatorial Guinea" />
            <option value="Eritrea" />
            <option value="Estonia" />
            <option value="Eswatini" />
            <option value="Ethiopia" />
            <option value="Fiji" />
            <option value="Finland" />
            <option value="France" />
            <option value="Gabon" />
            <option value="Gambia" />
            <option value="Georgia" />
            <option value="Germany" />
            <option value="Ghana" />
            <option value="Greece" />
            <option value="Grenada" />
            <option value="Guatemala" />
            <option value="Guinea" />
            <option value="Guinea-Bissau" />
            <option value="Guyana" />
            <option value="Haiti" />
            <option value="Honduras" />
            <option value="Hungary" />
            <option value="Iceland" />
            <option value="India" />
            <option value="Indonesia" />
            <option value="Iran" />
            <option value="Iraq" />
            <option value="Ireland" />
            <option value="Israel" />
            <option value="Italy" />
            <option value="Jamaica" />
            <option value="Japan" />
            <option value="Jordan" />
            <option value="Kazakhstan" />
            <option value="Kenya" />
            <option value="Kiribati" />
            <option value="Korea, North" />
            <option value="Korea, South" />
            <option value="Kosovo" />
            <option value="Kuwait" />
            <option value="Kyrgyzstan" />
            <option value="Laos" />
            <option value="Latvia" />
            <option value="Lebanon" />
            <option value="Lesotho" />
            <option value="Liberia" />
            <option value="Libya" />
            <option value="Liechtenstein" />
            <option value="Lithuania" />
            <option value="Luxembourg" />
            <option value="Madagascar" />
            <option value="Malawi" />
            <option value="Malaysia" />
            <option value="Maldives" />
            <option value="Mali" />
            <option value="Malta" />
            <option value="Marshall Islands" />
            <option value="Mauritania" />
            <option value="Mauritius" />
            <option value="Mexico" />
            <option value="Micronesia" />
            <option value="Moldova" />
            <option value="Monaco" />
            <option value="Mongolia" />
            <option value="Montenegro" />
            <option value="Morocco" />
            <option value="Mozambique" />
            <option value="Myanmar" />
            <option value="Namibia" />
            <option value="Nauru" />
            <option value="Nepal" />
            <option value="Netherlands" />
            <option value="New Zealand" />
            <option value="Nicaragua" />
            <option value="Niger" />
            <option value="Nigeria" />
            <option value="North Macedonia" />
            <option value="Norway" />
            <option value="Oman" />
            <option value="Pakistan" />
            <option value="Palau" />
            <option value="Palestine" />
            <option value="Panama" />
            <option value="Papua New Guinea" />
            <option value="Paraguay" />
            <option value="Peru" />
            <option value="Philippines" />
            <option value="Poland" />
            <option value="Portugal" />
            <option value="Qatar" />
            <option value="Romania" />
            <option value="Russia" />
            <option value="Rwanda" />
            <option value="Saint Kitts and Nevis" />
            <option value="Saint Lucia" />
            <option value="Saint Vincent and the Grenadines" />
            <option value="Samoa" />
            <option value="San Marino" />
            <option value="Sao Tome and Principe" />
            <option value="Saudi Arabia" />
            <option value="Senegal" />
            <option value="Serbia" />
            <option value="Seychelles" />
            <option value="Sierra Leone" />
            <option value="Singapore" />
            <option value="Slovakia" />
            <option value="Slovenia" />
            <option value="Solomon Islands" />
            <option value="Somalia" />
            <option value="South Africa" />
            <option value="South Sudan" />
            <option value="Spain" />
            <option value="Sri Lanka" />
            <option value="Sudan" />
            <option value="Suriname" />
            <option value="Sweden" />
            <option value="Switzerland" />
            <option value="Syria" />
            <option value="Taiwan" />
            <option value="Tajikistan" />
            <option value="Tanzania" />
            <option value="Thailand" />
            <option value="Timor-Leste" />
            <option value="Togo" />
            <option value="Tonga" />
            <option value="Trinidad and Tobago" />
            <option value="Tunisia" />
            <option value="Turkey" />
            <option value="Turkmenistan" />
            <option value="Tuvalu" />
            <option value="Uganda" />
            <option value="Ukraine" />
            <option value="United Arab Emirates" />
            <option value="United Kingdom" />
            <option value="United States" />
            <option value="Uruguay" />
            <option value="Uzbekistan" />
            <option value="Vanuatu" />
            <option value="Vatican City" />
            <option value="Venezuela" />
            <option value="Vietnam" />
            <option value="Yemen" />
            <option value="Zambia" />
            <option value="Zimbabwe" />
          </datalist>
          <label className="register-label">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your company, mission, and what you do."
              required
              maxLength={400}
            />
          </label>
          <label className="register-label">
            Company logo (optional)
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          {preview && (
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <img src={preview} alt="Preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 12, boxShadow: '0 2px 8px #ffe066' }} />
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>
        {message && <div className={message.startsWith('Error') ? 'register-company-error' : 'register-company-success'}>{message}</div>}
      </div>
    </div>
  );
};

export default RegisterCompany;
