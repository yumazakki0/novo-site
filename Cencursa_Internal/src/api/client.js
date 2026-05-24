const STORAGE_DATA_KEY = 'cencursa_app_data';
const STORAGE_USER_KEY = 'cencursa_app_user';
const STORAGE_UPLOADS_KEY = 'cencursa_app_uploads';

const INITIAL_DATA = {
  Character: [
    {
      id: 'char-1',
      player_email: 'player@example.com',
      player_name: 'Player One',
      name: 'MORGANA',
      age: '27',
      height: '1.72m',
      weight: '68kg',
      appearance: 'Olhos cinzentos, cabelo curto e roupas gastas',
      nationality: 'Inglesa',
      occupation: 'Investigadora',
      fears: 'Escuridão total',
      traumas: 'Desaparecimento do irmão',
      desires: 'Descobrir a verdade',
      addictions: 'Cigarros',
      important_memory: 'Noite em que ouvi a campainha',
      mental_instability: 'Episódios de dissociação',
      str: 6,
      agi: 7,
      res: 5,
      int: 8,
      per: 7,
      pre: 5,
      will: 7,
      hp: 10,
      hp_max: 10,
      sanity: 100,
      sanity_max: 100,
      souls: 0,
      is_marked: false,
      avatar_url: '',
      notes: '',
      is_active: true,
      created_date: '2026-01-01T00:00:00.000Z'
    }
  ],
  Document: [],
  EventLog: [
    {
      id: 'log-1',
      type: 'system',
      message: 'Mundo inicial carregado.',
      value: 0,
      is_global: true,
      is_hidden: false,
      created_date: '2026-01-01T00:00:01.000Z'
    }
  ],
  InventoryItem: [
    {
      id: 'item-1',
      character_id: 'char-1',
      name: 'Revólver .38',
      description: 'Um revólver de calibre .38 em bom estado de funcionamento',
      category: 'weapon',
      rarity: 'common',
      is_equipped: true,
      quantity: 1,
      created_date: '2026-01-01T00:00:02.000Z'
    },
    {
      id: 'item-2',
      character_id: 'char-1',
      name: 'Jaqueta de Couro',
      description: 'Uma jaqueta de couro desgastada pelos anos',
      category: 'armor',
      rarity: 'common',
      is_equipped: true,
      quantity: 1,
      created_date: '2026-01-01T00:00:03.000Z'
    },
    {
      id: 'item-3',
      character_id: 'char-1',
      name: 'Cigarro (maço)',
      description: 'Um maço de cigarros, quase vazio',
      category: 'consumable',
      rarity: 'common',
      is_equipped: false,
      quantity: 1,
      created_date: '2026-01-01T00:00:04.000Z'
    },
    {
      id: 'item-4',
      character_id: 'char-1',
      name: 'Medalha Antiga',
      description: 'Uma medalha de ouro antigo com inscrições ilegíveis',
      category: 'artifact',
      rarity: 'rare',
      is_equipped: false,
      quantity: 1,
      created_date: '2026-01-01T00:00:05.000Z'
    },
    {
      id: 'item-5',
      character_id: 'char-1',
      name: 'Caderno de Anotações',
      description: 'Um caderno com anotações fragmentadas sobre investigações',
      category: 'document',
      rarity: 'uncommon',
      is_equipped: false,
      quantity: 1,
      created_date: '2026-01-01T00:00:06.000Z'
    }
  ],
  Power: [],
  Request: [],
  StatusEffect: [],
  WorldState: [
    {
      id: 'world-1',
      weather: 'rain',
      global_alert: '',
      global_alert_active: false,
      world_event: '',
      world_event_active: false,
      system_message: '',
      system_message_active: false,
      phase: 'AFTER LIFE — PHASE I',
      session_number: 1,
      date_in_game: 'London, 2014',
      created_date: '2026-01-01T00:00:00.000Z'
    }
  ]
};

const defaultUsers = {
  player: {
    email: 'player@example.com',
    full_name: 'Player One',
    role: 'player'
  },
  admin: {
    email: 'gm@example.com',
    full_name: 'Keeper',
    role: 'admin'
  }
};

const hasWindow = typeof window !== 'undefined';

const localStorageSafe = () => {
  if (!hasWindow) return null;
  return window.localStorage;
};

const loadData = () => {
  const storage = localStorageSafe();
  if (!storage) {
    return structuredClone(INITIAL_DATA);
  }

  const raw = storage.getItem(STORAGE_DATA_KEY);
  if (!raw) {
    storage.setItem(STORAGE_DATA_KEY, JSON.stringify(INITIAL_DATA));
    return structuredClone(INITIAL_DATA);
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(INITIAL_DATA),
      ...parsed,
    };
  } catch (error) {
    storage.setItem(STORAGE_DATA_KEY, JSON.stringify(INITIAL_DATA));
    return structuredClone(INITIAL_DATA);
  }
};

const saveData = (data) => {
  const storage = localStorageSafe();
  if (!storage) return;
  storage.setItem(STORAGE_DATA_KEY, JSON.stringify(data));
};

const loadUploads = () => {
  const storage = localStorageSafe();
  if (!storage) return [];
  const raw = storage.getItem(STORAGE_UPLOADS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveUploads = (files) => {
  const storage = localStorageSafe();
  if (!storage) return;
  storage.setItem(STORAGE_UPLOADS_KEY, JSON.stringify(files));
};

const saveUser = (user) => {
  const storage = localStorageSafe();
  if (!storage) return;
  storage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
};

const getStoredUser = () => {
  const storage = localStorageSafe();
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_USER_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      storage.removeItem(STORAGE_USER_KEY);
      return null;
    }
  }

  const params = new URLSearchParams(window.location.search);
  const role = params.get('role');
  if (role === 'admin' || role === 'player') {
    const user = role === 'admin' ? defaultUsers.admin : defaultUsers.player;
    saveUser(user);
    return user;
  }

  return null;
};

const getId = () => {
  if (hasWindow && typeof window.crypto?.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
};

const clone = (value) => {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
};

const matchQuery = (item, query) => {
  if (!query || typeof query !== 'object') return true;
  return Object.entries(query).every(([key, value]) => {
    if (value === undefined || value === null) return true;
    if (Array.isArray(value)) {
      return value.includes(item[key]);
    }
    return item[key] === value;
  });
};

const sortEntities = (items, sort) => {
  if (!sort) return items;
  const direction = sort.startsWith('-') ? -1 : 1;
  const field = sort.replace(/^-/, '');
  return [...items].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    if (aValue === bValue) return 0;
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    return aValue > bValue ? direction : -direction;
  });
};

const loadEntityList = (name) => {
  const data = loadData();
  return Array.isArray(data[name]) ? data[name] : [];
};

const persistEntityList = (name, list) => {
  const data = loadData();
  data[name] = list;
  saveData(data);
};

const readEntity = (name, id) => {
  const list = loadEntityList(name);
  return list.find((item) => item.id === id) || null;
};

const filterEntities = (name, query, sort, limit) => {
  const list = loadEntityList(name).filter((item) => matchQuery(item, query));
  const sorted = sortEntities(list, sort);
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
};

const createEntity = (name, data) => {
  const list = loadEntityList(name);
  const item = {
    ...data,
    id: getId(),
    created_date: new Date().toISOString(),
  };
  list.push(item);
  persistEntityList(name, list);
  return clone(item);
};

const updateEntity = (name, id, data) => {
  const list = loadEntityList(name);
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Entity ${name} with id ${id} not found`);
  }
  const updated = { ...list[index], ...data };
  list[index] = updated;
  persistEntityList(name, list);
  return clone(updated);
};

const deleteEntity = (name, id) => {
  const list = loadEntityList(name);
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Entity ${name} with id ${id} not found`);
  }
  list.splice(index, 1);
  persistEntityList(name, list);
  return null;
};

const entityService = (name) => ({
  list: async (sort, limit) => filterEntities(name, {}, sort, limit),
  filter: async (query, sort, limit) => filterEntities(name, query, sort, limit),
  create: async (data) => createEntity(name, data),
  update: async (id, data) => updateEntity(name, id, data),
  delete: async (id) => deleteEntity(name, id),
});

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const uploadFile = async ({ file }) => {
  if (!file) {
    throw new Error('Missing file');
  }
  const dataUrl = await fileToBase64(file);
  const fileUrl = `data:${file.type};base64,${dataUrl}`;
  const uploads = loadUploads();
  uploads.push({ id: getId(), name: file.name, url: fileUrl, created_date: new Date().toISOString() });
  saveUploads(uploads);
  return { file_url: fileUrl };
};

export const client = {
  auth: {
    me: async () => getStoredUser(),
    login: async (user) => {
      if (!user || !user.email) {
        throw new Error('Email is required');
      }
      saveUser(user);
      return user;
    },
    logout: (redirect = true) => {
      const storage = localStorageSafe();
      if (storage) {
        storage.removeItem(STORAGE_USER_KEY);
      }
      if (redirect && hasWindow) {
        window.location.href = '/';
      }
    },
    redirectToLogin: (returnUrl) => {
      if (hasWindow) {
        window.location.href = returnUrl || '/';
      }
    }
  },
  entities: {
    Character: entityService('Character'),
    Document: entityService('Document'),
    EventLog: entityService('EventLog'),
    InventoryItem: entityService('InventoryItem'),
    Power: entityService('Power'),
    Request: entityService('Request'),
    StatusEffect: entityService('StatusEffect'),
    WorldState: entityService('WorldState'),
  },
  integrations: {
    Core: {
      UploadFile: uploadFile
    }
  }
};
