import { authHandlers } from './auth'
import { featuresHandlers } from './features'
import { tasksHandlers } from './tasks'
import { calendarHandlers } from './calendar'
import { notesHandlers } from './notes'
import { contactsHandlers } from './contacts'
import { bookmarksHandlers } from './bookmarks'
import { snippetsHandlers } from './snippets'
import { projectsHandlers } from './projects'
import { devopsHandlers } from './devops'
import { formsHandlers } from './forms'
import { sharingHandlers } from './sharing'
import { notificationsHandlers } from './notifications'
import { supportHandlers } from './support'
import { reportsHandlers } from './reports'

export const handlers = [
  ...authHandlers,
  ...featuresHandlers,
  ...tasksHandlers,
  ...calendarHandlers,
  ...notesHandlers,
  ...contactsHandlers,
  ...bookmarksHandlers,
  ...snippetsHandlers,
  ...projectsHandlers,
  ...devopsHandlers,
  ...formsHandlers,
  ...sharingHandlers,
  ...notificationsHandlers,
  ...supportHandlers,
  ...reportsHandlers,
]
