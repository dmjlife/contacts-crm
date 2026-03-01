import { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function EditContactModal({ contact, onClose, onSave }) {
    // Initialize form state with contact data
    const [name, setName] = useState(contact.name || '');
    const [email, setEmail] = useState(contact.email || '');
    const [phone, setPhone] = useState(contact.phone || '');
    const [tags, setTags] = useState((contact.tags || []).join(', '));

    const handleSave = () => {
        const updatedContact = {
            ...contact,
            name,
            email,
            phone,
            // Split comma-separated string back into an array of tags, removing empty ones
            tags: tags.split(',').map(t => t.trim()).filter(t => t)
        };
        onSave(updatedContact);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }} onClick={onClose}>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                }}>
                    <X size={20} />
                </button>

                <h2 style={{ marginBottom: '1.5rem' }}>Edit Contact</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Name
                    </label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{ width: '100%' }}
                        autoFocus
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Phone
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Tags (comma separated)
                    </label>
                    <input
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        style={{ width: '100%' }}
                        placeholder="e.g. Lead, VIP, Active"
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!name.trim()}>
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
