import { useState, useMemo } from 'react';
import { Search, Filter, MessageSquare, CheckSquare, Square, X, Edit2 } from 'lucide-react';
import { mockContacts, allTags } from './data/mockContacts';
import BulkMessageModal from './components/BulkMessageModal';
import EditContactModal from './components/EditContactModal';

function App() {
  const [contacts, setContacts] = useState(mockContacts);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState(new Set());

  // Modals state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Filtering logic
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => contact.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [contacts, searchQuery, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleContactSelection = (id) => {
    setSelectedContacts(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedContacts.size === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleSaveContact = (updatedContact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    setEditingContact(null);
  };

  return (
    <div className="app-container">
      {/* Main Content */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--accent-color)', padding: '0.6rem', borderRadius: '0.75rem', display: 'flex' }}>
              <Filter size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Contacts CRM</h1>
              <p style={{ fontSize: '0.875rem' }}>{filteredContacts.length} contacts found</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="btn btn-outline" onClick={selectAll}>
              {selectedContacts.size === filteredContacts.length && filteredContacts.length > 0 ? (
                <><CheckSquare size={18} /> Deselect All</>
              ) : (
                <><Square size={18} /> Select All</>
              )}
            </button>

            <button
              className="btn btn-primary"
              disabled={selectedContacts.size === 0}
              onClick={() => setIsMessageModalOpen(true)}
            >
              <MessageSquare size={18} />
              Message ({selectedContacts.size})
            </button>
          </div>
        </header>

        {/* Top Filter Bar */}
        <div className="filter-bar">
          <div className="search-container">
            <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Search
            </h2>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="tag-filters-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                Filter by Tags
              </h2>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
            <div className="tag-list-horizontal">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${selectedTags.includes(tag) ? 'var(--accent-color)' : 'var(--surface-border)'}`,
                    background: selectedTags.includes(tag) ? 'var(--accent-color)' : 'rgba(255,255,255,0.03)',
                    color: selectedTags.includes(tag) ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    transition: 'var(--transition)'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
          <table className="contacts-table">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingLeft: '1.5rem' }}>
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    onChange={selectAll}
                    checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Tags</th>
                <th style={{ width: '80px', textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map(contact => (
                <tr key={contact.id} className={selectedContacts.has(contact.id) ? 'selected-row' : ''}>
                  <td style={{ paddingLeft: '1.5rem' }}>
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={selectedContacts.has(contact.id)}
                      onChange={() => toggleContactSelection(contact.id)}
                    />
                  </td>
                  <td style={{ fontWeight: 500 }}>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {contact.tags.map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setEditingContact(contact)}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    No contacts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modals */}
      {isMessageModalOpen && (
        <BulkMessageModal
          selectedContactsData={filteredContacts.filter(c => selectedContacts.has(c.id))}
          onClose={() => setIsMessageModalOpen(false)}
          onSendComplete={() => {
            setSelectedContacts(new Set());
            setIsMessageModalOpen(false);
            alert('Messages sent successfully!');
          }}
        />
      )}

      {editingContact && (
        <EditContactModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSave={handleSaveContact}
        />
      )}
    </div>
  );
}

export default App;
