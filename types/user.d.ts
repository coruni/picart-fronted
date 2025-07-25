interface Permission {
  id: number;
  name?: string;
  description?: string;
}

interface Role {
  id: number;
  name?: string;
  displayName?: null;
  description?: string;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export type Status = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface User {
  id: number;
  username?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  status: Status;
  description?: string;
  roles: Role[];
  config: null;
  createdAt?: string;
  updatedAt?: string;
}
