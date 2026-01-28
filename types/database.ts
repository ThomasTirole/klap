// Types correspondant au schéma de base de données Supabase

// =====================================================
// ENUMS
// =====================================================

export type SessionStatus = 'draft' | 'open' | 'closed'

export type ItemType = 'poll_single' | 'poll_multi' | 'wordcloud' | 'open' | 'scale'

export type ModerationStatus = 'pending' | 'approved' | 'hidden'

// =====================================================
// TABLE TYPES
// =====================================================

export interface Session {
  id: string
  owner_user_id: string
  title: string
  join_code: string
  status: SessionStatus
  active_item_id: string | null
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  session_id: string
  type: ItemType
  title: string
  prompt: string | null
  config: ItemConfig
  order_index: number
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  session_id: string
  participant_id: string
  nickname: string | null
  created_at: string
}

export interface Response {
  id: string
  session_id: string
  item_id: string
  participant_id: string
  payload: ResponsePayload
  created_at: string
}

export interface Moderation {
  id: string
  response_id: string
  status: ModerationStatus
  moderated_by: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// CONFIG TYPES (pour le champ config des items)
// =====================================================

export interface PollOption {
  id: string
  label: string
}

export interface PollSingleConfig {
  options: PollOption[]
  showResults?: boolean
}

export interface PollMultiConfig {
  options: PollOption[]
  maxChoices?: number
  showResults?: boolean
}

export interface WordcloudConfig {
  maxWords?: number
  maxLength?: number
  allowMultiple?: boolean
  moderation?: boolean
}

export interface OpenConfig {
  maxLength?: number
  moderation?: boolean
}

export interface ScaleNumericConfig {
  min: number
  max: number
  step?: number
  labels?: Record<number, string>
}

export interface ScaleCategoricalConfig {
  values: string[]
}

export type ScaleConfig = ScaleNumericConfig | ScaleCategoricalConfig

export type ItemConfig =
  | PollSingleConfig
  | PollMultiConfig
  | WordcloudConfig
  | OpenConfig
  | ScaleConfig

// =====================================================
// PAYLOAD TYPES (pour le champ payload des responses)
// =====================================================

export interface PollSinglePayload {
  optionId: string
}

export interface PollMultiPayload {
  optionIds: string[]
}

export interface WordcloudPayload {
  text: string
}

export interface OpenPayload {
  text: string
}

export interface ScalePayload {
  value: number | string
}

export type ResponsePayload =
  | PollSinglePayload
  | PollMultiPayload
  | WordcloudPayload
  | OpenPayload
  | ScalePayload

// =====================================================
// INSERT TYPES (pour les créations)
// =====================================================

export type SessionInsert = Omit<Session, 'id' | 'created_at' | 'updated_at'>

export type ItemInsert = Omit<Item, 'id' | 'created_at' | 'updated_at'>

export type ParticipantInsert = Omit<Participant, 'id' | 'created_at'>

export type ResponseInsert = Omit<Response, 'id' | 'created_at'>

export type ModerationInsert = Omit<Moderation, 'id' | 'created_at' | 'updated_at'>

// =====================================================
// UPDATE TYPES (pour les modifications)
// =====================================================

export type SessionUpdate = Partial<Omit<Session, 'id' | 'created_at' | 'updated_at' | 'owner_user_id'>>

export type ItemUpdate = Partial<Omit<Item, 'id' | 'session_id' | 'created_at' | 'updated_at'>>

export type ModerationUpdate = Partial<Omit<Moderation, 'id' | 'response_id' | 'created_at' | 'updated_at'>>

// =====================================================
// HELPER TYPES
// =====================================================

// Type pour vérifier si une config est de type numérique ou catégoriel
export function isNumericScale(config: ScaleConfig): config is ScaleNumericConfig {
  return 'min' in config && 'max' in config
}

export function isCategoricalScale(config: ScaleConfig): config is ScaleCategoricalConfig {
  return 'values' in config
}

// Type guard pour les payloads
export function isPollSinglePayload(payload: ResponsePayload): payload is PollSinglePayload {
  return 'optionId' in payload && typeof payload.optionId === 'string'
}

export function isPollMultiPayload(payload: ResponsePayload): payload is PollMultiPayload {
  return 'optionIds' in payload && Array.isArray(payload.optionIds)
}

export function isWordcloudPayload(payload: ResponsePayload): payload is WordcloudPayload {
  return 'text' in payload && typeof payload.text === 'string'
}

export function isOpenPayload(payload: ResponsePayload): payload is OpenPayload {
  return 'text' in payload && typeof payload.text === 'string'
}

export function isScalePayload(payload: ResponsePayload): payload is ScalePayload {
  return 'value' in payload
}
