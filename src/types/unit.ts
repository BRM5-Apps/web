import type { ServerMember } from './server';

export interface Unit {
  id: string;
  serverId: string;
  parentId?: string;              // Parent unit for hierarchy
  name: string;
  description?: string;
  iconUrl?: string;
  leaderId?: string;
  maxMembers?: number;            // Soft/hard cap for members
  isHardCap: boolean;             // True = enforce cap, false = notify only
  createdAt: string;
  updatedAt: string;

  // Computed fields for UI
  memberCount?: number;
  depth?: number;                 // Depth in hierarchy tree
  children?: Unit[];              // Child units
  leader?: ServerMember;          // Unit leader
}

export interface UnitMember {
  id: string;
  unitId: string;
  serverUserId: string;
  joinedAt: string;

  // Populated fields
  member?: ServerMember;
}

// Unit tree node for hierarchy display
export interface UnitTreeNode extends Unit {
  children: UnitTreeNode[];
  memberCount: number;
}

// Unit assignment history entry
export interface UnitAssignmentHistory {
  id: string;
  serverUserId: string;
  unitId: string;
  unit?: Unit;
  action: 'joined' | 'left' | 'transferred';
  previousUnitId?: string;
  previousUnit?: Unit;
  reason: string;
  changedBy: string;
  changedByUser?: ServerMember;
  createdAt: string;
}

// Payload for creating/updating a unit
export interface UnitPayload {
  name: string;
  description?: string;
  iconUrl?: string;
  parentId?: string;
  leaderId?: string;
  maxMembers?: number;
  isHardCap?: boolean;
}

// Payload for setting unit cap
export interface UnitCapPayload {
  maxMembers: number;
  isHardCap: boolean;
}

// Payload for moving a unit in hierarchy
export interface MoveUnitPayload {
  newParentId?: string;           // null to make root
}