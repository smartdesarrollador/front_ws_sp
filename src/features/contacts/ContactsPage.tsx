import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Users, CheckSquare } from 'lucide-react'
import { apiClient } from '@/lib/axios'
import { useContacts } from './hooks/useContacts'
import { useContactGroups } from './hooks/useContactGroups'
import { useDeleteContact } from './hooks/useDeleteContact'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { useImportContacts } from './hooks/useImportContacts'
import ExportMenu, { type ExportFormat } from '@/components/shared/ExportMenu'
import ImportButton from '@/components/shared/ImportButton'
import ImportModal from '@/components/shared/ImportModal'
import Pagination from '@/components/shared/Pagination'
import FeatureGate from '@/components/shared/FeatureGate'
import { toCSV, toVCard, downloadBlob } from '@/lib/export'
import { parseContacts } from '@/lib/import'
import { ContactFilters, EMPTY_FILTERS } from './components/ContactFilters'
import { ContactCard } from './components/ContactCard'
import { ContactModal } from './components/ContactModal'
import { ContactViewModal } from './components/ContactViewModal'
import { ManageGroupsModal } from './components/ManageGroupsModal'
import { ShareResourceModal } from '@/features/sharing/components/ShareResourceModal'
import { useBulkSelection } from '@/features/sharing/hooks/useBulkSelection'
import { BulkActionBar } from '@/features/sharing/components/BulkActionBar'
import type { Contact, ContactFiltersState } from './types'

interface AllContactsResponse {
  contacts: Contact[]
}

export default function ContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showModal, setShowModal] = useState(false)
  const [showGroupsModal, setShowGroupsModal] = useState(false)
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null)
  const [viewingContact, setViewingContact] = useState<Contact | null>(null)
  const [shareResources, setShareResources] = useState<{ id: string; title: string }[] | null>(null)
  const [filters, setFilters] = useState<ContactFiltersState>(EMPTY_FILTERS)
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1)
  const bulk = useBulkSelection()

  const { data, isLoading } = useContacts(filters, page)
  const { data: groups = [] } = useContactGroups()
  const deleteContact = useDeleteContact()
  const importContacts = useImportContacts()
  const { data: summaryData } = useDashboardSummary()

  const allContacts = data?.contacts ?? []
  const pagination = data?.pagination
  const total = pagination?.total ?? 0

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

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newPage <= 1) next.delete('page')
      else next.set('page', String(newPage))
      return next
    })
  }

  const handleFiltersChange = (f: ContactFiltersState) => {
    setFilters(f)
    handlePageChange(1)
  }

  const fetchAllContactsForExport = async () => {
    const params: Record<string, string> = {}
    if (filters.search) params.search = filters.search
    if (filters.group_id) params.group = filters.group_id
    const { data: allData } = await apiClient.get<AllContactsResponse>('/app/contacts/', { params })
    return allData.contacts.filter((contact) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matches =
          contact.name.toLowerCase().includes(q) ||
          contact.email.toLowerCase().includes(q) ||
          (contact.company ?? '').toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }

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

  const handleView = (contact: Contact) => {
    setViewingContact(contact)
  }

  const handleCloseViewModal = () => {
    setViewingContact(null)
  }

  const handleBulkShare = () => {
    const selected = filteredContacts
      .filter((c) => bulk.selectedIds.has(c.id))
      .map((c) => ({ id: c.id, title: c.name }))
    setShareResources(selected)
  }

  const handleCloseShareModal = () => {
    setShareResources(null)
    bulk.exitSelection()
  }

  const exportFormats: ExportFormat[] = [
    {
      id: 'vcard',
      label: 'vCard (.vcf)',
      run: async () => {
        const contacts = await fetchAllContactsForExport()
        downloadBlob(
          new Blob(
            [
              toVCard(
                contacts.map((c) => ({
                  name: c.name,
                  email: c.email,
                  phone: c.phone,
                  company: c.company,
                  job_title: c.job_title,
                  notes: c.notes,
                })),
              ),
            ],
            { type: 'text/vcard;charset=utf-8' },
          ),
          'contactos.vcf',
        )
      },
    },
    {
      id: 'csv',
      label: 'CSV',
      run: async () => {
        const contacts = await fetchAllContactsForExport()
        downloadBlob(
          new Blob(
            [
              toCSV(contacts, [
                { label: 'Nombre', value: (c) => c.name },
                { label: 'Email', value: (c) => c.email },
                { label: 'Teléfono', value: (c) => c.phone ?? '' },
                { label: 'Empresa', value: (c) => c.company ?? '' },
                { label: 'Cargo', value: (c) => c.job_title ?? '' },
                { label: 'Grupo', value: (c) => c.group?.name ?? '' },
              ]),
            ],
            { type: 'text/csv;charset=utf-8' },
          ),
          'contactos.csv',
        )
      },
    },
  ]

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
          <ImportButton
            feature="contact_import"
            disabledHint="Actualiza tu plan para importar contactos"
            renderModal={(close) => (
              <ImportModal
                title="Importar contactos"
                accept=".vcf,.csv"
                formatsHint="vCard (.vcf) o CSV"
                parse={parseContacts}
                columns={[
                  { label: 'Nombre', value: (c) => c.name ?? '' },
                  { label: 'Email', value: (c) => c.email ?? '' },
                  { label: 'Teléfono', value: (c) => c.phone ?? '' },
                ]}
                onImport={(items) => importContacts.mutateAsync(items)}
                onClose={close}
              />
            )}
          />
          <ExportMenu
            feature="contact_export"
            formats={exportFormats}
            disabledHint="Actualiza tu plan para exportar contactos"
          />

          <FeatureGate
            feature="contact_groups"
            fallback={
              <button
                disabled
                title="Actualiza tu plan para gestionar grupos"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              >
                <Users className="w-4 h-4" />
                Gestionar grupos
              </button>
            }
          >
            <button
              onClick={() => setShowGroupsModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              Gestionar grupos
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
          onChange={handleFiltersChange}
          totalCount={total}
          groups={groups}
        />
      </div>

      {/* Bulk selection toolbar */}
      {bulk.isSelecting ? (
        <BulkActionBar
          count={bulk.selectedIds.size}
          onShare={handleBulkShare}
          onCancel={bulk.exitSelection}
        />
      ) : (
        <div className="flex justify-end">
          <button
            onClick={bulk.toggleSelecting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <CheckSquare className="w-4 h-4" />
            Seleccionar
          </button>
        </div>
      )}

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
              onShare={(c) => setShareResources([{ id: c.id, title: c.name }])}
              onView={handleView}
              selectionMode={bulk.isSelecting}
              selected={bulk.selectedIds.has(contact.id)}
              onToggleSelect={bulk.toggleId}
            />
          ))}
        </div>
      )}

      {!isLoading && pagination && (
        <Pagination
          page={pagination.page}
          perPage={pagination.per_page}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modals */}
      {showModal && <ContactModal contact={contactToEdit} onClose={handleCloseModal} />}
      <ContactViewModal
        contact={viewingContact}
        open={!!viewingContact}
        onClose={handleCloseViewModal}
      />
      {showGroupsModal && <ManageGroupsModal onClose={() => setShowGroupsModal(false)} />}
      {shareResources && (
        <ShareResourceModal
          resourceType="contact"
          resources={shareResources}
          onClose={handleCloseShareModal}
        />
      )}
    </div>
  )
}
