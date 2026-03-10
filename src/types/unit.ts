export interface Unit {
  id: string;
  factionId: string;
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
  factionUserId: string;
  joinedAt: string;
}
