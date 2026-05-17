import { useState } from 'react'
import { Plus, Users, Download } from 'lucide-react'
import { useContacts } from './hooks/useContacts'
import { useContactGroups } from './hooks/useContactGroups'
import { useDeleteContact } from './hooks/useDeleteContact'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import FeatureGate from '@/components/shared/FeatureGate'
import { ContactFilters, EMPTY_FILTERS } from './components/ContactFilters'
import { ContactCard } from './components/ContactCard'
import { ContactModal } from './components/ContactModal'
import { ShareResourceModal } from '@/features/sharing/components/ShareResourceModal'
import type { Contact, ContactFiltersState } from './types'

export default function ContactsPage() {
  const [showModal, setShowModal] = useState(false)
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null)
  const [contactToShare, setContactToShare] = useState<Contact | null>(null)
  const [filters, setFilters] = useState<ContactFiltersState>(EMPTY_FILTERS)

  const { data, isLoading } = useContacts(filters)
  const { data: groups = [] } = useContactGroups()
  const deleteContact = useDeleteContact()
  const { data: summaryData } = useDashboardSummary()

  const allContacts = data?.contacts ?? []
  const total = data?.total ?? 0

  // Frontend filtering: search in name+email+company, group_id exact match
  const filteredContacts = allContacts.filter((contact) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matches =
        contact.name.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        (contact.company ?? '').toLowerCase().includes(q)
      if (!matches) return false
    }
    if (filters.group_id && contact.group?.id !== filters.group_id) return false
    return true
  })

  // Plan limit banner
  const contactsCount = summaryData?.usage.contacts ?? 0
  const contactsLimit = summaryData?.usage.contacts_limit ?? null
  const showPlanBanner = contactsLimit !== null && contactsCount >= contactsLimit * 0.8

  const handleEdit = (contact: Contact) => {
    setContactToEdit(contact)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    deleteContact.mutate(id)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setContactToEdit(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contactos</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* CSV Export with FeatureGate */}
          <FeatureGate
            feature="contacts_export"
            fallback={
              <button
                disabled
                title="Actualiza tu plan para exportar contactos"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            }
          >
            <button
              onClick={() => {
                const csvContent = [
                  ['Nombre', 'Email', 'Teléfono', 'Empresa', 'Cargo', 'Grupo'].join(','),
                  ...filteredContacts.map((c) =>
                    [
                      c.name,
                      c.email,
                      c.phone ?? '',
                      c.company ?? '',
                      c.job_title ?? '',
                      c.group?.name ?? '',
                    ].join(','),
                  ),
                ].join('\n')
                const blob = new Blob([csvContent], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'contactos.csv'
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </FeatureGate>

          <button
            onClick={() => {
              setContactToEdit(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Contacto
          </button>
        </div>
      </div>

      {/* Plan limit banner */}
      {showPlanBanner && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
          Has alcanzado el {Math.round((contactsCount / (contactsLimit ?? 1)) * 100)}% del límite de
          contactos de tu plan ({contactsCount}/{contactsLimit}). Considera actualizar tu plan.
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <ContactFilters
          filters={filters}
          onChange={setFilters}
          totalCount={total}
          groups={groups}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse h-36 rounded-lg bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
            No hay contactos
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Comienza añadiendo tu primer contacto
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShare={setContactToShare}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && <ContactModal contact={contactToEdit} onClose={handleCloseModal} />}
      {contactToShare && (
        <ShareResourceModal
          resourceType="contact"
          resourceId={contactToShare.id}
          resourceTitle={contactToShare.name}
          onClose={() => setContactToShare(null)}
        />
      )}
    </div>
  )
}
