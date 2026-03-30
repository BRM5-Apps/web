import type { Unit } from './unit';
import type { Rank } from './rank';

// Position represents a role/position within a server that can be assigned to members
export interface Position {
  id: string;
  serverId: string;
  name: string;
  description?: string;
  unitId?: string;
  rankId?: string;
  permissions: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

// PositionAssignment represents a member holding a position
export interface PositionAssignment {
  id: string;
  positionId: string;
  position?: Position;
  unitId?: string;
  unit?: Unit;
  serverUserId: string;
  assignedBy: string;
  assignedAt: string;
  endedAt?: string;
  endReason?: string;
}

// Position with holders for display
export interface PositionWithHolders extends Position {
  holders: PositionAssignment[];
  unit?: Unit;
  rank?: Rank;
}

// Payload for creating/updating a position
export interface PositionPayload {
  name: string;
  description?: string;
  unitId?: string;
  rankId?: string;
  permissions?: string[];
  order?: number;
}

// Payload for assigning a position to a member
export interface AssignPositionPayload {
  serverUserId: string;
  unitId?: string;
}