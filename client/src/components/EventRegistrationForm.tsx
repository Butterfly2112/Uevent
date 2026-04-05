import React, { useState, useRef, useEffect } from 'react';
import { AddressAutocomplete } from './AddressAutocomplete';
// Get address by coordinates using Google Maps Geocoding API
async function getAddressFromCoords(lat: number, lng: number): Promise<string> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return `${lat}, ${lng}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return `${lat}, ${lng}`;
  } catch {
    return `${lat}, ${lng}`;
  }
}

export interface EventFormData {
  notificate_owner?: boolean;
  title: string;
  description: string;
  price: number;
  ticket_limit?: number;
  address?: string;
  poster_url?: string | File;
  redirect_url?: string;
  start_date: string;
  end_date: string;
  publish_date: string;
  status?: string;
  format?: string;
  theme?: string;
  visitor_visibility: 'everybody' | 'attendees_only';
  promoCodes?: PromoCode[];
}

const statusOptions = [
  { value: '', label: 'Select status' },
  { value: 'draft', label: 'Draft' },
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'ended', label: 'Ended' },
];

const formatOptions = [
  { value: '', label: 'Select format' },
  { value: 'Conference', label: 'Conference' },
  { value: 'Lecture', label: 'Lecture' },
  { value: 'Concert', label: 'Concert' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Fest', label: 'Fest' },
];

const themeOptions = [
  { value: '', label: 'Select theme' },
  { value: 'business', label: 'Business' },
  { value: 'politics', label: 'Politics' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'fan meeting', label: 'Fan Meeting' },
];

const visitorVisibilityOptions = [
  { value: 'everybody', label: 'Everybody' },
  { value: 'attendees_only', label: 'Attendees Only' },
];

type PromoCode = {
  code: string;
  discount_percentage: number;
  expires_at: string;
};

export const EventRegistrationForm: React.FC<{
  onSubmit: (data: EventFormData) => void;
  loading?: boolean;
  error?: string;
  onClose?: () => void;
  initialData?: Partial<EventFormData>;
}> = ({ onSubmit, loading, error, onClose, initialData }) => {
  const formRef = useRef<HTMLFormElement>(null);

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialData?.promoCodes || []);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  const getNowDatetimeLocal = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const [form, setForm] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price ?? 0,
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    publish_date: initialData?.publish_date || getNowDatetimeLocal(),
    visitor_visibility: initialData?.visitor_visibility || 'everybody',
    ticket_limit: initialData?.ticket_limit,
    address: initialData?.address,
    poster_url: initialData?.poster_url,
    redirect_url: initialData?.redirect_url,
    status: initialData?.status,
    format: initialData?.format,
    theme: initialData?.theme,
    promoCodes: initialData?.promoCodes,
    notificate_owner: initialData?.notificate_owner,
  });
  // Update form and promoCodes if initialData changes (for edit mode)
  React.useEffect(() => {
    if (initialData) {
      setForm(f => ({
        ...f,
        ...initialData,
        price: initialData.price ?? 0,
        publish_date: initialData.publish_date || getNowDatetimeLocal(),
        visitor_visibility: initialData.visitor_visibility || 'everybody',
      }));
      setPromoCodes(initialData.promoCodes || []);
    }
  }, [initialData]);

  const addPromoCode = () => {
    if (promoCodes.length >= 5) return;

    setPromoCodes((prev) => [
      ...prev,
      { code: '', discount_percentage: 0, expires_at: '' },
    ]);
  };

  const updatePromoCode = (index: number, field: keyof PromoCode, value: string | number) => {
    setPromoCodes((prev) =>
        prev.map((p, i) =>
            i === index ? { ...p, [field]: value } : p
        )
    );
  };

  const removePromoCode = (index: number) => {
    setPromoCodes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      if (e.target instanceof HTMLInputElement) {
        const checked = e.target.checked;
        setForm((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        setForm((prev) => ({ ...prev, poster_url: file }));
        const reader = new FileReader();
        reader.onloadend = () => setPosterPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setForm((prev) => ({ ...prev, poster_url: undefined }));
        setPosterPreview(undefined);
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const [posterPreview, setPosterPreview] = useState<string | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure ticket_limit is number or undefined
    const submitForm = { ...form };
    if (typeof submitForm.ticket_limit === 'string') {
      if (submitForm.ticket_limit === '') {
        delete submitForm.ticket_limit;
      } else {
        const parsed = parseInt(submitForm.ticket_limit, 10);
        submitForm.ticket_limit = isNaN(parsed) ? undefined : parsed;
      }
    } else if (submitForm.ticket_limit === undefined) {
      delete submitForm.ticket_limit;
    }

    // Remove empty or undefined optional fields
    const cleanedForm: Record<string, unknown> = {};
    Object.entries(submitForm).forEach(([key, value]) => {
      // List of required fields
      const requiredFields = [
        'title',
        'description',
        'price',
        'start_date',
        'end_date',
        'publish_date',
        'visitor_visibility',
      ];
      if (
        requiredFields.includes(key) ||
        (value !== undefined && value !== null && value !== '')
      ) {
        if (key === 'ticket_limit' && value !== undefined && value !== null && value !== '') {
          cleanedForm[key] = typeof value === 'number' ? value : Number(value);
        } else {
          cleanedForm[key] = value;
        }
      }
    });
    if (promoCodes.length > 0) {
      cleanedForm.promoCodes = JSON.stringify(
          promoCodes.map(p => ({
            code: p.code,
            discount_percentage: Number(p.discount_percentage),
            expires_at: new Date(p.expires_at).toISOString(),
          }))
      );
    }
    console.log(cleanedForm.promoCodes);
    onSubmit(cleanedForm as unknown as EventFormData);
  };

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: '80vh',
      padding: '32px 0',
      background: 'transparent',
    }}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 16px #ffe066',
          padding: 48,
          width: '100%',
          maxWidth: 'calc(100vw - 120px)',
          border: 'none',
          maxHeight: '80vh',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#ffe066 #f9f9ed',
          position: 'relative',
        }}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 10,
              right: 14,
              background: 'none',
              border: 'none',
              fontSize: 28,
              fontWeight: 700,
              cursor: 'pointer',
              color: '#888',
              zIndex: 2
            }}
            aria-label="Закрыть форму"
          >
            &#10006;
          </button>
        )}
      <h2 style={{margin: 0, fontSize: 28, color: '#222', marginBottom: 18}}>Register New Event</h2>
      {error && <div style={{ color: 'red', fontSize: 17, marginBottom: 10 }}>{error}</div>}
      {/* Title */}
      <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom: 12}}>
        <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Title <span style={{color:'red'}}>*</span></label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          minLength={3}
          maxLength={50}
          required
          placeholder="Event title"
          style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
        />
      </div>
      {/* Description */}
      <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom: 18}}>
        <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Description <span style={{color:'red'}}>*</span></label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          minLength={3}
          maxLength={500}
          required
          placeholder="Event description"
          rows={4}
          style={{ resize: 'vertical', padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17, minHeight: 80 }}
        />
      </div>

      <div style={{display:'flex', gap:16, marginBottom: 16}}>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Price <span style={{color:'red'}}>*</span></label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            min={0}
            required
            placeholder="Price"
            style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
          />
        </div>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Ticket Limit</label>
          <input
            type="number"
            name="ticket_limit"
            value={form.ticket_limit || ''}
            onChange={handleChange}
            min={1}
            placeholder="Ticket Limit"
            style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
          />
        </div>
        <div style={{flex:2, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Address</label>
          <AddressAutocomplete
            value={form.address || ''}
            onChange={val => setForm(prev => ({ ...prev, address: val }))}
          />
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', margin: '24px 0' }}>
        <div style={{ width: 400, height: 220, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 8px #ffe06655', position: 'relative' }}>
          <iframe
            title="Pick location on map"
            width="100%"
            height="220"
            style={{ border: 0, borderRadius: 10 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(form.address || 'Kyiv, Ukraine')}&output=embed`}
          ></iframe>
          <div style={{position:'absolute',top:0,left:0,width:'100%',height:'220px',zIndex:2,cursor:'crosshair'}} 
            onClick={async (ev: React.MouseEvent<HTMLDivElement>) => {
              const rect = (ev.target as HTMLDivElement).getBoundingClientRect();
              const x = (ev.nativeEvent as MouseEvent).offsetX;
              const y = (ev.nativeEvent as MouseEvent).offsetY;
              const mapWidth = rect.width;
              const lat = 50.45 + (0.02 * (110 - y) / 110); // rough estimate
              const lng = 30.52 + (0.04 * (x - mapWidth/2) / (mapWidth/2));
              const address = await getAddressFromCoords(lat, lng);
              setForm(prev => ({ ...prev, address }));
            }}
            title="Click to select location"
          ></div>
        </div>
      </div>
      {/* Format, Visitor Visibility */}
      <div style={{display:'flex', gap:16, marginBottom: 16}}>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Format</label>
          <select name="format" value={form.format || ''} onChange={handleChange} style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}>
            {formatOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Visitor Visibility <span style={{color:'red'}}>*</span></label>
          <select
            name="visitor_visibility"
            value={form.visitor_visibility}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
          >
            {visitorVisibilityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Theme, Status */}
      <div style={{display:'flex', gap:16, marginBottom: 16}}>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Theme</label>
          <select name="theme" value={form.theme || ''} onChange={handleChange} style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}>
            {themeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Status</label>
          <select name="status" value={form.status || ''} onChange={handleChange} style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Publish Date, Start Date, End Date */}
      <div style={{display:'flex', gap:16, marginBottom: 16}}>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Publish Date <span style={{color:'red'}}>*</span></label>
          <input
              type="datetime-local"
              name="publish_date"
              value={form.publish_date}
              onChange={handleChange}
              required
              style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
            />
        </div>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Start Date <span style={{color:'red'}}>*</span></label>
          <input
            type="datetime-local"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
          />
        </div>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>End Date <span style={{color:'red'}}>*</span></label>
          <input
            type="datetime-local"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
          />
        </div>
      </div>
      {/* Redirect URL, Poster Image */}
      <div style={{display:'flex', gap:16, marginBottom: 18}}>
        <div style={{flex:2, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Redirect URL</label>
          <input
            type="text"
            name="redirect_url"
            value={form.redirect_url || ''}
            onChange={handleChange}
            placeholder="Redirect URL"
            style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
          />
        </div>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:6}}>
          <label style={{fontWeight:500, fontSize:17, marginBottom:2}}>Poster Image</label>
          <input
            type="file"
            name="poster_url"
            accept="image/*"
            onChange={handleChange}
            style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
          />
          {posterPreview && (
            <div style={{ marginTop: 8 }}>
              <img src={posterPreview} alt="Preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 12, boxShadow: '0 2px 8px #ffe066' }} />
            </div>
          )}
        </div>
      </div>
      {/* Notify owner */}
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom: 18}}>
        <input
          type="checkbox"
          name="notificate_owner"
          checked={!!form.notificate_owner}
          onChange={handleChange}
          style={{width:18, height:18}}
        />
        <span style={{fontSize:16}}>Notify me about new attendees</span>
      </div>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 10 }}>Promo Codes (max 5)</h3>

          {promoCodes.map((promo, index) => (
              <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginBottom: 10,
                    alignItems: 'center',
                  }}
              >
                <input
                    type="text"
                    placeholder="Code"
                    value={promo.code}
                    onChange={(e) =>
                        updatePromoCode(index, 'code', e.target.value)
                    }
                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                />

                <input
                    type="number"
                    placeholder="%"
                    min={1}
                    max={100}
                    value={promo.discount_percentage}
                    onChange={(e) =>
                        updatePromoCode(index, 'discount_percentage', Number(e.target.value))
                    }
                    style={{ width: 80, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                />

                <input
                    type="date"
                    value={promo.expires_at}
                    onChange={(e) =>
                        updatePromoCode(index, 'expires_at', e.target.value)
                    }
                    style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                />

                <button
                    type="button"
                    onClick={() => removePromoCode(index)}
                    style={{
                      background: '#ffdddd',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 10px',
                      cursor: 'pointer',
                    }}
                >
                  ✕
                </button>
              </div>
          ))}

          {promoCodes.length < 5 && (
              <button
                  type="button"
                  onClick={addPromoCode}
                  style={{
                    marginTop: 8,
                    background: '#e6f0ff',
                    border: '1px dashed #6c63ff',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
              >
                + Add promo code
              </button>
          )}
        </div>
      {/* Submit button */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
        <button type="submit" disabled={loading || !form.title.trim() || !form.description.trim()} style={{ background: '#ffe066', border: 'none', borderRadius: 8, padding: '12px 36px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 18 }}>
          {loading ? 'Registering...' : 'Register Event'}
        </button>
      </div>
      </form>
    </div>
  );
};