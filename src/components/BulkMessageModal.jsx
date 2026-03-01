import { useState, useEffect } from 'react';
import { X, Send, Loader2, ChevronDown } from 'lucide-react';

export default function BulkMessageModal({ selectedContactsData, onClose, onSendComplete }) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    // New state variables for sender email selection
    const [availableSenders, setAvailableSenders] = useState([]);
    const [selectedSender, setSelectedSender] = useState('');
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    // Fetch available sender emails when modal opens
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
                const response = await fetch(`${baseUrl}/api/config`);
                if (response.ok) {
                    const data = await response.json();
                    setAvailableSenders(data.senderEmails || []);
                    if (data.senderEmails && data.senderEmails.length > 0) {
                        setSelectedSender(data.senderEmails[0]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch config", err);
            } finally {
                setIsLoadingConfig(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSend = async () => {
        if (!message.trim()) return;

        setIsSending(true);
        setError('');

        try {
            // Extract emails from the full contact objects passed from App.jsx
            const recipients = selectedContactsData.map(c => c.email);
            const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';

            const response = await fetch(`${baseUrl}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipients, message, senderEmail: selectedSender }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send messages');
            }

            // Tell parent component it succeeded
            onSendComplete();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <div
                className="glass"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-lg)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ marginBottom: '0.5rem' }}>New Bulk Message</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    Sending message to {selectedContactsData.length} contact{selectedContactsData.length !== 1 ? 's' : ''}
                </p>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        From
                    </label>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={selectedSender}
                            onChange={(e) => setSelectedSender(e.target.value)}
                            disabled={isLoadingConfig || isSending || availableSenders.length <= 1}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontFamily: 'inherit',
                                fontSize: '0.875rem',
                                appearance: 'none',
                                cursor: availableSenders.length <= 1 ? 'default' : 'pointer'
                            }}
                        >
                            {isLoadingConfig ? (
                                <option>Loading senders...</option>
                            ) : availableSenders.length === 0 ? (
                                <option>No sender configured</option>
                            ) : (
                                availableSenders.map((sender, idx) => (
                                    <option key={idx} value={sender}>{sender}</option>
                                ))
                            )}
                        </select>
                        {availableSenders.length > 1 && (
                            <ChevronDown
                                size={16}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)',
                                    pointerEvents: 'none'
                                }}
                            />
                        )}
                    </div>
                </div>

                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Message
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    style={{
                        width: '100%',
                        height: '150px',
                        resize: 'vertical',
                        marginBottom: '1.5rem'
                    }}
                    disabled={isSending}
                    autoFocus
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={onClose} disabled={isSending}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        disabled={!message.trim() || isSending || isLoadingConfig || availableSenders.length === 0}
                        onClick={handleSend}
                    >
                        {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {isSending ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </div>
        </div>
    );
}
