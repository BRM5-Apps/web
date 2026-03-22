export interface Unit {
  id: string;
  serverId: string;
  name: string;
  description?: string;
  iconUrl?: string;
  leaderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitMember {
  id: string;
  unitId: string;
  serverUserId: string;
  joinedAt: string;
}
