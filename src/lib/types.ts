export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "signature"
  | "file";

export type FieldWidth = "full" | "half" | "third";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  width: FieldWidth;
  accept?: string;
  multiple?: boolean;
}

export type Block =
  | { kind: "heading"; id: string; text: string; level: 1 | 2 | 3 }
  | { kind: "richText"; id: string; text: string }
  | { kind: "fieldRow"; id: string; fields: FormField[] }
  | { kind: "divider"; id: string };

export interface FormDesign {
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface FormContact {
  phone: string;
  website: string;
  email: string;
}

export interface FormSettings {
  submitButtonText: string;
  saveDraftButtonText: string;
  thankYouTitle: string;
  thankYouMessage: string;
  notifyEmail: string;
  notificationsEnabled: boolean;
  requireBothSignatures: boolean;
}

export interface FormMeta {
  title: string;
  browserTitle: string;
  description: string;
}

export interface FormConfig {
  version: number;
  updatedAt: string;
  meta: FormMeta;
  design: FormDesign;
  contact: FormContact;
  blocks: Block[];
  settings: FormSettings;
}

export interface SubmissionFile {
  url: string;
  name: string;
  size: number;
}

export interface Submission {
  id: string;
  createdAt: string;
  data: Record<string, string>;
  files: Record<string, SubmissionFile[]>;
  signatures: Record<string, string>;
  configVersion: number;
}

export interface DraftPayload {
  token: string;
  updatedAt: string;
  data: Record<string, string>;
}
