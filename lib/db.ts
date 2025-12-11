import fs from "fs"
import path from "path"

// Caminho para armazenar dados
const DATA_DIR = path.join(process.cwd(), "data")

// Garantir que o diretório existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Interface de dados
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  password: string
  photoUrl?: string
  createdAt: string
}

export interface Appliance {
  id: string
  userId: string
  name: string
  powerWatts: number
  createdAt: string
}

export interface DailyRecord {
  id: string
  userId: string
  applianceId: string
  date: string // YYYY-MM-DD
  hoursUsed: number
  createdAt: string
}

export interface UserSettings {
  userId: string
  tariff: number
}

// Base de dados em memória para ambiente v0 (onde fs não funciona)
const IN_MEMORY_STORE = {
  users: [] as User[],
  appliances: [] as Appliance[],
  records: [] as DailyRecord[],
  settings: [] as UserSettings[],
}

// Detectar se estamos em ambiente onde fs funciona
let USE_FILE_SYSTEM = true

try {
  if (typeof window !== "undefined") {
    USE_FILE_SYSTEM = false
  }
} catch {
  // Estamos no servidor
}

// Funções de leitura/escrita com fallback
function readFile<T>(filename: string): T[] {
  if (!USE_FILE_SYSTEM) {
    // Retornar dados em memória baseado no nome do arquivo
    if (filename === "users.json") return IN_MEMORY_STORE.users as T[]
    if (filename === "appliances.json") return IN_MEMORY_STORE.appliances as T[]
    if (filename === "records.json") return IN_MEMORY_STORE.records as T[]
    if (filename === "settings.json") return IN_MEMORY_STORE.settings as T[]
    return []
  }

  const filepath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filepath)) {
    return []
  }
  const data = fs.readFileSync(filepath, "utf-8")
  return JSON.parse(data)
}

function writeFile<T>(filename: string, data: T[]): void {
  if (!USE_FILE_SYSTEM) {
    // Salvar em memória baseado no nome do arquivo
    if (filename === "users.json") IN_MEMORY_STORE.users = data as User[]
    if (filename === "appliances.json") IN_MEMORY_STORE.appliances = data as Appliance[]
    if (filename === "records.json") IN_MEMORY_STORE.records = data as DailyRecord[]
    if (filename === "settings.json") IN_MEMORY_STORE.settings = data as UserSettings[]
    return
  }

  const filepath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
}

// Operações de Usuários
export const UserDB = {
  getAll: (): User[] => readFile<User>("users.json"),

  getById: (id: string): User | undefined => {
    const users = UserDB.getAll()
    return users.find((u) => u.id === id)
  },

  getByEmail: (email: string): User | undefined => {
    const users = UserDB.getAll()
    return users.find((u) => u.email === email)
  },

  getByEmailOrPhone: (emailOrPhone: string): User | undefined => {
    const users = UserDB.getAll()
    return users.find((u) => u.email === emailOrPhone || u.phone === emailOrPhone)
  },

  create: (user: User): User => {
    const users = UserDB.getAll()
    users.push(user)
    writeFile("users.json", users)
    return user
  },

  update: (id: string, updates: Partial<User>): User | null => {
    const users = UserDB.getAll()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) return null

    users[index] = { ...users[index], ...updates }
    writeFile("users.json", users)
    return users[index]
  },
}

// Operações de Aparelhos
export const ApplianceDB = {
  getAll: (): Appliance[] => readFile<Appliance>("appliances.json"),

  getByUserId: (userId: string): Appliance[] => {
    const appliances = ApplianceDB.getAll()
    return appliances.filter((a) => a.userId === userId)
  },

  getById: (id: string): Appliance | undefined => {
    const appliances = ApplianceDB.getAll()
    return appliances.find((a) => a.id === id)
  },

  create: (appliance: Appliance): Appliance => {
    const appliances = ApplianceDB.getAll()
    appliances.push(appliance)
    writeFile("appliances.json", appliances)
    return appliance
  },

  update: (id: string, updates: Partial<Appliance>): Appliance | null => {
    const appliances = ApplianceDB.getAll()
    const index = appliances.findIndex((a) => a.id === id)
    if (index === -1) return null

    appliances[index] = { ...appliances[index], ...updates }
    writeFile("appliances.json", appliances)
    return appliances[index]
  },

  delete: (id: string): boolean => {
    const appliances = ApplianceDB.getAll()
    const filtered = appliances.filter((a) => a.id !== id)
    if (filtered.length === appliances.length) return false

    writeFile("appliances.json", filtered)
    return true
  },
}

// Operações de Registros Diários
export const RecordDB = {
  getAll: (): DailyRecord[] => readFile<DailyRecord>("records.json"),

  getByUserId: (userId: string): DailyRecord[] => {
    const records = RecordDB.getAll()
    return records.filter((r) => r.userId === userId)
  },

  getByUserIdAndDateRange: (userId: string, startDate: string, endDate: string): DailyRecord[] => {
    const records = RecordDB.getByUserId(userId)
    return records.filter((r) => r.date >= startDate && r.date <= endDate)
  },

  create: (record: DailyRecord): DailyRecord => {
    const records = RecordDB.getAll()
    records.push(record)
    writeFile("records.json", records)
    return record
  },

  update: (id: string, updates: Partial<DailyRecord>): DailyRecord | null => {
    const records = RecordDB.getAll()
    const index = records.findIndex((r) => r.id === id)
    if (index === -1) return null

    records[index] = { ...records[index], ...updates }
    writeFile("records.json", records)
    return records[index]
  },

  delete: (id: string): boolean => {
    const records = RecordDB.getAll()
    const filtered = records.filter((r) => r.id !== id)
    if (filtered.length === records.length) return false

    writeFile("records.json", filtered)
    return true
  },
}

// Operações de Configurações
export const SettingsDB = {
  getAll: (): UserSettings[] => readFile<UserSettings>("settings.json"),

  getByUserId: (userId: string): UserSettings | undefined => {
    const settings = SettingsDB.getAll()
    return settings.find((s) => s.userId === userId)
  },

  upsert: (userSettings: UserSettings): UserSettings => {
    const settings = SettingsDB.getAll()
    const index = settings.findIndex((s) => s.userId === userSettings.userId)

    if (index === -1) {
      settings.push(userSettings)
    } else {
      settings[index] = userSettings
    }

    writeFile("settings.json", settings)
    return userSettings
  },
}
